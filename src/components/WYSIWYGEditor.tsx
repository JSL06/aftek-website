import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Image, 
  Link,
  Quote,
  Code,
  RotateCw,
  Upload,
  X,
  Undo,
  Redo
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageData {
  url: string;
  alt: string;
  orientation: 'left' | 'center' | 'right';
  width?: string;
  caption?: string;
}

interface WYSIWYGEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Start writing your content...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageData, setImageData] = useState<Partial<ImageData>>({
    alt: '',
    orientation: 'center',
    width: '100%',
    caption: ''
  });
  const [uploading, setUploading] = useState(false);
  
  // Storage bucket configuration
  const STORAGE_BUCKET = 'product-images';

  // Initialize editor content only once
  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, []); // Only run once on mount

  // Handle external value updates (e.g., from form reset)
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      // Only update if the value is actually different to avoid disrupting user input
      const currentContent = editorRef.current.innerHTML;
      if (value !== currentContent) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  // Simple content change handler - let contenteditable handle everything naturally
  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      // Only trigger onChange if content actually changed
      if (newContent !== value) {
        onChange(newContent);
      }
    }
  };

  // Execute command for formatting - simplified
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  // Insert HTML at cursor - simplified
  const insertHTML = (html: string) => {
    document.execCommand('insertHTML', false, html);
    editorRef.current?.focus();
    handleContentChange();
  };

  // Handle keyboard shortcuts - ONLY for formatting, NOT for text input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // ONLY handle formatting shortcuts
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          document.execCommand('undo');
          break;
        case 'y':
          e.preventDefault();
          document.execCommand('redo');
          break;
        case 'a':
          e.preventDefault();
          document.execCommand('selectAll');
          break;
      }
      // Return focus to editor after command
      editorRef.current?.focus();
      handleContentChange();
    }
    // DO NOT handle regular character input here - let contenteditable handle it naturally
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!imageFile || !imageData.alt) {
      toast.error('Please select an image and provide alt text');
      return;
    }

    setUploading(true);
    try {
      const fileName = `product-descriptions/${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      const imageHtml = generateImageHTML({
        url: publicUrlData.publicUrl,
        alt: imageData.alt,
        orientation: imageData.orientation,
        width: imageData.width,
        caption: imageData.caption
      });

      insertHTML(imageHtml);
      setShowImageDialog(false);
      setImageFile(null);
      setImageData({ alt: '', orientation: 'center', width: '100%', caption: '' });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const generateImageHTML = (imgData: ImageData) => {
    const orientationClasses = {
      left: 'float-left mr-4 mb-2',
      center: 'mx-auto block',
      right: 'float-right ml-4 mb-2'
    };

    const style = `max-width: ${imgData.width}; height: auto;`;
    const classes = orientationClasses[imgData.orientation];
    
    let html = `<div class="${classes}">`;
    html += `<img src="${imgData.url}" alt="${imgData.alt}" style="${style}" />`;
    
    if (imgData.caption) {
      html += `<p class="text-sm text-muted-foreground mt-2 text-center">${imgData.caption}</p>`;
    }
    
    html += '</div>';
    
    if (imgData.orientation !== 'center') {
      html += '<div class="clearfix"></div>';
    }
    
    return html;
  };

  // Handle link insertion - simplified
  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        document.execCommand('createLink', false, url);
      } else {
        insertHTML(`<a href="${url}" target="_blank" rel="noopener noreferrer">Link text</a>`);
      }
    }
  };

  // Handle list insertion - simplified
  const handleList = (ordered: boolean) => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      // Convert selected text to list
      const text = selection.toString();
      const lines = text.split('\n').filter(line => line.trim());
      const listItems = lines.map(line => `<li>${line}</li>`).join('');
      const listTag = ordered ? 'ol' : 'ul';
      const listHtml = `<${listTag}>${listItems}</${listTag}>`;
      
      // Replace selection with list
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const listElement = document.createElement('div');
      listElement.innerHTML = listHtml;
      range.insertNode(listElement);
      handleContentChange();
    } else {
      // Insert new list
      insertHTML(ordered ? '<ol><li>List item</li></ol>' : '<ul><li>List item</li></ul>');
    }
  };

  // Handle heading conversion - simplified
  const handleHeading = (level: 1 | 2) => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      // Convert selected text to heading
      const text = selection.toString();
      const headingTag = `h${level}`;
      const headingHtml = `<${headingTag}>${text}</${headingTag}>`;
      
      // Replace selection with heading
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const headingElement = document.createElement('div');
      headingElement.innerHTML = headingHtml;
      range.insertNode(headingElement);
      handleContentChange();
    } else {
      // Insert new heading
      insertHTML(`<h${level}>Heading ${level}</h${level}>`);
    }
  };

  // Handle quote insertion - simplified
  const handleQuote = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      // Convert selected text to quote
      const text = selection.toString();
      const quoteHtml = `<blockquote>${text}</blockquote>`;
      
      // Replace selection with quote
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const quoteElement = document.createElement('div');
      quoteElement.innerHTML = quoteHtml;
      range.insertNode(quoteElement);
      handleContentChange();
    } else {
      // Insert new quote
      insertHTML('<blockquote>Quote text</blockquote>');
    }
  };

  // Handle code insertion - simplified
  const handleCode = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      // Convert selected text to code
      const text = selection.toString();
      const codeHtml = `<code>${text}</code>`;
      
      // Replace selection with code
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const codeElement = document.createElement('div');
      codeElement.innerHTML = codeHtml;
      range.insertNode(codeElement);
      handleContentChange();
    } else {
      // Insert new code
      insertHTML('<code>code text</code>');
    }
  };

  // Handle undo/redo - simplified
  const handleUndo = () => {
    document.execCommand('undo');
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleRedo = () => {
    document.execCommand('redo');
    editorRef.current?.focus();
    handleContentChange();
  };

  // Toolbar buttons configuration
  const toolbarButtons = [
    {
      icon: <Undo className="h-4 w-4" />,
      tooltip: 'Undo (Ctrl+Z)',
      action: handleUndo
    },
    {
      icon: <Redo className="h-4 w-4" />,
      tooltip: 'Redo (Ctrl+Y)',
      action: handleRedo
    },
    { divider: true },
    {
      icon: <Bold className="h-4 w-4" />,
      tooltip: 'Bold (Ctrl+B)',
      action: () => execCommand('bold')
    },
    {
      icon: <Italic className="h-4 w-4" />,
      tooltip: 'Italic (Ctrl+I)',
      action: () => execCommand('italic')
    },
    { divider: true },
    {
      icon: <Heading1 className="h-4 w-4" />,
      tooltip: 'Heading 1',
      action: () => handleHeading(1)
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      tooltip: 'Heading 2',
      action: () => handleHeading(2)
    },
    { divider: true },
    {
      icon: <List className="h-4 w-4" />,
      tooltip: 'Bullet List',
      action: () => handleList(false)
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      tooltip: 'Numbered List',
      action: () => handleList(true)
    },
    { divider: true },
    {
      icon: <Quote className="h-4 w-4" />,
      tooltip: 'Quote',
      action: handleQuote
    },
    {
      icon: <Code className="h-4 w-4" />,
      tooltip: 'Code',
      action: handleCode
    },
    { divider: true },
    {
      icon: <Link className="h-4 w-4" />,
      tooltip: 'Insert Link',
      action: handleLink
    },
    {
      icon: <Image className="h-4 w-4" />,
      tooltip: 'Insert Image',
      action: () => setShowImageDialog(true)
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setImageData(prev => ({ ...prev, alt: fileName }));
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-muted/50 p-2 border-b flex flex-wrap gap-1 items-center">
        {toolbarButtons.map((button, index) => (
          button.divider ? (
            <div key={index} className="w-px h-6 bg-border mx-1" />
          ) : (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onMouseDown={(e) => e.preventDefault()} // Prevent selection loss
              onClick={() => {
                button.action();
                editorRef.current?.focus(); // Return focus to editor
              }}
              className="h-8 w-8 p-0"
              title={button.tooltip}
            >
              {button.icon}
            </Button>
          )
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable="true"
        onInput={handleContentChange}
        onBlur={handleContentChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          // Ensure proper cursor positioning when editor gains focus
          if (editorRef.current && !window.getSelection()?.rangeCount) {
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }}
        className="min-h-[400px] p-4 focus:outline-none prose max-w-none"
        style={{
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: '1.6'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Insert Image
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <Label htmlFor="image-upload">Select Image</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {imageFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setImageFile(null)}
                    className="p-1 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {imageFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>

            {/* Image Settings */}
            {imageFile && (
              <>
                <div>
                  <Label htmlFor="alt-text">Alt Text *</Label>
                  <Input
                    id="alt-text"
                    value={imageData.alt}
                    onChange={(e) => setImageData(prev => ({ ...prev, alt: e.target.value }))}
                    placeholder="Describe the image for accessibility"
                  />
                </div>

                <div>
                  <Label htmlFor="orientation">Image Orientation</Label>
                  <Select
                    value={imageData.orientation}
                    onValueChange={(value: 'left' | 'center' | 'right') => 
                      setImageData(prev => ({ ...prev, orientation: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left (Float Left)</SelectItem>
                      <SelectItem value="center">Center (Block)</SelectItem>
                      <SelectItem value="right">Right (Float Right)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="width">Image Width</Label>
                  <Input
                    id="width"
                    value={imageData.width}
                    onChange={(e) => setImageData(prev => ({ ...prev, width: e.target.value }))}
                    placeholder="e.g., 300px, 50%, 100%"
                  />
                </div>

                <div>
                  <Label htmlFor="caption">Caption (Optional)</Label>
                  <Input
                    id="caption"
                    value={imageData.caption}
                    onChange={(e) => setImageData(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Image caption text"
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleImageUpload}
                disabled={!imageFile || !imageData.alt || uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Insert Image
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowImageDialog(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WYSIWYGEditor;
