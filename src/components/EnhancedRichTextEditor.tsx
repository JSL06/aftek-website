import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  X
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

interface EnhancedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const EnhancedRichTextEditor: React.FC<EnhancedRichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Start writing your article...",
  className = ""
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageData, setImageData] = useState<Partial<ImageData>>({
    alt: '',
    orientation: 'center',
    width: '100%',
    caption: ''
  });
  const [uploading, setUploading] = useState(false);

  const getSelectedText = () => {
    if (!textareaRef.current) return '';
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    return value.substring(start, end);
  };

  const replaceSelectedText = (replacement: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = start + replacement.length;
        textareaRef.current.selectionEnd = start + replacement.length;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const wrapSelectedText = (before: string, after: string = '') => {
    const selectedText = getSelectedText();
    if (selectedText) {
      replaceSelectedText(before + selectedText + after);
    } else {
      replaceSelectedText(before + after);
    }
  };

  const insertAtCursor = (text: string) => {
    replaceSelectedText(text);
  };

  const handleImageUpload = async () => {
    if (!imageFile || !imageData.alt) {
      toast.error('Please select an image and provide alt text');
      return;
    }

    setUploading(true);
    try {
      const fileName = `articles/${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('article-images')
        .getPublicUrl(fileName);

      const imageHtml = generateImageHTML({
        url: publicUrlData.publicUrl,
        alt: imageData.alt,
        orientation: imageData.orientation,
        width: imageData.width,
        caption: imageData.caption
      });

      insertAtCursor(imageHtml);
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

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const selectedText = getSelectedText();
      if (selectedText) {
        wrapSelectedText(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, '</a>');
      } else {
        insertAtCursor(`<a href="${url}" target="_blank" rel="noopener noreferrer">Link text</a>`);
      }
    }
  };

  const toolbarButtons = [
    {
      icon: <Bold className="h-4 w-4" />,
      tooltip: 'Bold',
      action: () => wrapSelectedText('<strong>', '</strong>')
    },
    {
      icon: <Italic className="h-4 w-4" />,
      tooltip: 'Italic',
      action: () => wrapSelectedText('<em>', '</em>')
    },
    {
      icon: <Heading1 className="h-4 w-4" />,
      tooltip: 'Heading 1',
      action: () => wrapSelectedText('<h1>', '</h1>')
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      tooltip: 'Heading 2',
      action: () => wrapSelectedText('<h2>', '</h2>')
    },
    {
      icon: <List className="h-4 w-4" />,
      tooltip: 'Bullet List',
      action: () => insertAtCursor('<ul>\n<li>List item</li>\n</ul>')
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      tooltip: 'Numbered List',
      action: () => insertAtCursor('<ol>\n<li>List item</li>\n</ol>')
    },
    {
      icon: <Quote className="h-4 w-4" />,
      tooltip: 'Quote',
      action: () => wrapSelectedText('<blockquote>', '</blockquote>')
    },
    {
      icon: <Code className="h-4 w-4" />,
      tooltip: 'Code',
      action: () => wrapSelectedText('<code>', '</code>')
    },
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
      <div className="bg-muted/50 p-2 border-b flex flex-wrap gap-1">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={button.action}
            className="h-8 w-8 p-0"
            title={button.tooltip}
          >
            {button.icon}
          </Button>
        ))}
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[400px] border-0 resize-none focus:ring-0 font-mono text-sm"
        onSelect={() => {
          if (textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            // Update selection state if needed
          }
        }}
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

export default EnhancedRichTextEditor;
