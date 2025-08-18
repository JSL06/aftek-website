import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Bold, Italic, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
}

const SimpleRichTextEditor: React.FC<SimpleRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  className = "",
  height = "200px"
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');

  // Initialize editor
  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      // Ensure images are properly rendered (not markdown)
      const images = editorRef.current.querySelectorAll('img');
      images.forEach(img => {
        if (img.style.display !== 'block') {
          img.style.display = 'block';
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.margin = '10px 0';
        }
      });
      
      onChange(editorRef.current.innerHTML);
    }
  };

  // Focus editor
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Bold formatting
  const toggleBold = () => {
    document.execCommand('bold');
    setIsBold(!isBold);
    focusEditor();
  };

  // Italic formatting
  const toggleItalic = () => {
    document.execCommand('italic');
    setIsItalic(!isItalic);
    focusEditor();
  };

  // Alignment functions
  const setTextAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    document.execCommand(`justify${align.charAt(0).toUpperCase() + align.slice(1)}`);
    setAlignment(align);
    focusEditor();
  };

  // Insert image with better error handling
  const insertImageElement = (url: string, altText?: string) => {
    if (!editorRef.current) return;
    
    console.log('Inserting image element:', url);
    
    const img = document.createElement('img');
    img.src = url;
    img.alt = altText || 'Uploaded image';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.margin = '10px 0';
    img.style.border = '1px solid #e2e8f0';
    img.style.borderRadius = '4px';
    
    // Add error handling
    img.onerror = () => {
      console.error('Failed to load image:', url);
      img.style.display = 'none';
      const errorText = document.createTextNode(`[Image failed to load: ${url}]`);
      img.parentNode?.replaceChild(errorText, img);
    };
    
    // Add load success handling
    img.onload = () => {
      console.log('Image loaded successfully:', url);
    };
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(img);
      range.setStartAfter(img);
      range.setEndAfter(img);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // If no selection, append to the end
      editorRef.current.appendChild(img);
    }
    
    // Force a content update
    handleInput();
    focusEditor();
  };

  const insertImage = (url: string) => {
    if (url) {
      console.log('Inserting image from URL:', url);
      const img = document.createElement('img');
      img.src = url;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.margin = '10px 0';
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        if (editorRef.current) {
          editorRef.current.appendChild(img);
        }
      }
      handleInput(); // Force a content update
      focusEditor();
    }
  };

  const uploadImage = async (file: File) => {
    try {
      console.log('Uploading image:', file.name);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('editor-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('editor-images')
        .getPublicUrl(fileName);
      
      console.log('Image uploaded successfully:', publicUrl);
      
      // Insert the image as HTML, not markdown
      const img = document.createElement('img');
      img.src = publicUrl;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.margin = '10px 0';
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        if (editorRef.current) {
          editorRef.current.appendChild(img);
        }
      }
      handleInput(); // Force a content update
      focusEditor();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadImage(file);
    }
    e.target.value = ''; // Reset input
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    // Check if we're pasting an image
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          uploadImage(file);
          return;
        }
      }
    }
    
    // If no image, paste as plain text
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Handle key events to maintain cursor position
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Let normal text input work naturally
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
  };

  return (
    <div className={`simple-rich-text-editor ${className}`}>
      {/* Simple Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-t-lg border-b">
        {/* Bold */}
        <Button
          variant={isBold ? "default" : "outline"}
          size="sm"
          onClick={toggleBold}
          className="h-8 px-2"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        {/* Italic */}
        <Button
          variant={isItalic ? "default" : "outline"}
          size="sm"
          onClick={toggleItalic}
          className="h-8 px-2"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Alignment */}
        <Button
          variant={alignment === 'left' ? "default" : "outline"}
          size="sm"
          onClick={() => setTextAlignment('left')}
          className="h-8 px-2"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant={alignment === 'center' ? "default" : "outline"}
          size="sm"
          onClick={() => setTextAlignment('center')}
          className="h-8 px-2"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          variant={alignment === 'right' ? "default" : "outline"}
          size="sm"
          onClick={() => setTextAlignment('right')}
          className="h-8 px-2"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant={alignment === 'justify' ? "default" : "outline"}
          size="sm"
          onClick={() => setTextAlignment('justify')}
          className="h-8 px-2"
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Image Insertion */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const url = e.currentTarget.value;
                      insertImage(url);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="image-upload">Upload Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Editor and Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor Area - Left Side */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground px-2">Editor</div>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            className="p-4 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 prose prose-sm max-w-none"
            style={{ 
              height,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowY: 'auto'
            }}
            suppressContentEditableWarning
          >
            {!value && <span className="text-muted-foreground">{placeholder}</span>}
          </div>
        </div>

        {/* Live Preview - Right Side */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground px-2">Live Preview</div>
          <div 
            className="p-4 border rounded-lg bg-white prose prose-sm max-w-none"
            style={{ 
              height,
              overflowY: 'auto'
            }}
            dangerouslySetInnerHTML={{ 
              __html: value || `<span class="text-muted-foreground">${placeholder}</span>` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SimpleRichTextEditor;
