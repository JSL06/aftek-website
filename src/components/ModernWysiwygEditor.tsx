import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Link,
  Unlink,
  Image as ImageIcon,
  Code,
  Quote,
  Minus,
  Eraser,
  RotateCw,
  Maximize2,
  Minimize2,
  Type,
  Palette,
  Highlighter,
  Upload,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ModernWysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
  showToolbar?: boolean;
  showWordCount?: boolean;
  showFullscreen?: boolean;
}

const ModernWysiwygEditor: React.FC<ModernWysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  className = "",
  height = "400px",
  showToolbar = true,
  showWordCount = true,
  showFullscreen = true
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Font options
  const fontSizes = [
    { value: '1', label: 'Small', size: '14px' },
    { value: '3', label: 'Normal', size: '16px' },
    { value: '5', label: 'Large', size: '18px' },
    { value: '7', label: 'Huge', size: '24px' }
  ];

  const fontFamilies = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Helvetica', label: 'Helvetica' }
  ];

  const colors = [
    '#000000', '#ffffff', '#9e1717', '#00ff00', '#0000ff', '#ffff00',
    '#ff00ff', '#00ffff', '#ffa500', '#800080', '#008000', '#800000',
    '#000080', '#808000', '#808080', '#c0c0c0', '#ffc0cb', '#ffd700'
  ];

  // Initialize editor
  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
      updateWordCount();
    }
  }, [value]);

  // Update word count
  const updateWordCount = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || '';
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  }, []);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      updateWordCount();
      
      // Update undo/redo state
      setCanUndo(document.queryCommandEnabled('undo'));
      setCanRedo(document.queryCommandEnabled('redo'));
    }
  }, [onChange, updateWordCount]);

  // Focus editor
  const focusEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Execute command and focus
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    focusEditor();
    handleInput();
  }, [focusEditor, handleInput]);

  // Undo/Redo
  const undo = useCallback(() => {
    document.execCommand('undo');
    focusEditor();
    handleInput();
  }, [focusEditor, handleInput]);

  const redo = useCallback(() => {
    document.execCommand('redo');
    focusEditor();
    handleInput();
  }, [focusEditor, handleInput]);

  // Insert heading
  const insertHeading = useCallback((level: number) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const heading = document.createElement(`h${level}`);
      
      if (range.toString()) {
        heading.textContent = range.toString();
        range.deleteContents();
      } else {
        heading.textContent = `Heading ${level}`;
      }
      
      range.insertNode(heading);
      range.setStartAfter(heading);
      range.setEndAfter(heading);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    focusEditor();
    handleInput();
  }, [focusEditor, handleInput]);

  // Insert link
  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  // Remove link
  const removeLink = useCallback(() => {
    execCommand('unlink');
  }, [execCommand]);

  // Insert image from URL
  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      const img = document.createElement('img');
      img.src = url;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      focusEditor();
      handleInput();
    }
  }, [focusEditor, handleInput]);

  // Upload image
  const uploadImage = useCallback(async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('editor-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('editor-images')
        .getPublicUrl(fileName);

      const img = document.createElement('img');
      img.src = publicUrl;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      focusEditor();
      handleInput();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  }, [focusEditor, handleInput]);

  // Insert code block
  const insertCodeBlock = useCallback(() => {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = 'Enter your code here';
    pre.appendChild(code);
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(pre);
      range.setStart(code, 0);
      range.setEnd(code, code.textContent!.length);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    focusEditor();
    handleInput();
  }, [focusEditor, handleInput]);

  // Insert blockquote
  const insertBlockquote = useCallback(() => {
    execCommand('formatBlock', 'blockquote');
  }, [execCommand]);

  // Insert horizontal line
  const insertHorizontalLine = useCallback(() => {
    execCommand('insertHorizontalRule');
  }, [execCommand]);

  // Clear formatting
  const clearFormatting = useCallback(() => {
    execCommand('removeFormat');
  }, [execCommand]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            execCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            execCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            execCommand('underline');
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'k':
            e.preventDefault();
            insertLink();
            break;
        }
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('keydown', handleKeyDown);
      return () => editor.removeEventListener('keydown', handleKeyDown);
    }
  }, [execCommand, undo, redo, insertLink]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // File upload handler
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadImage(file);
    }
    e.target.value = ''; // Reset input
  }, [uploadImage]);

  // Handle paste events - let contenteditable handle paste naturally
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    // DO NOT prevent default - let contenteditable handle paste naturally
    // This prevents text insertion issues and cursor jumping
  }, []);

  return (
    <div className={`wysiwyg-editor ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {showToolbar && (
        <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-t-lg border-b">
          {/* Undo/Redo */}
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="h-8 px-2"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="h-8 px-2"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Text Formatting */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('bold')}
            className="h-8 px-2"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('italic')}
            className="h-8 px-2"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('underline')}
            className="h-8 px-2"
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('strikethrough')}
            className="h-8 px-2"
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Font Size */}
          <Select onValueChange={(value) => execCommand('fontSize', value)}>
            <SelectTrigger className="h-8 w-20">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {fontSizes.map(size => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Font Family */}
          <Select onValueChange={(value) => execCommand('fontName', value)}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map(font => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-8" />

          {/* Text Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="grid grid-cols-6 gap-1">
                {colors.map(color => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: color }}
                    onClick={() => execCommand('foreColor', color)}
                    title={color}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Background Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2">
                <Highlighter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="grid grid-cols-6 gap-1">
                {colors.map(color => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: color }}
                    onClick={() => execCommand('hiliteColor', color)}
                    title={color}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-8" />

          {/* Alignment */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('justifyLeft')}
            className="h-8 px-2"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('justifyCenter')}
            className="h-8 px-2"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('justifyRight')}
            className="h-8 px-2"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('justifyFull')}
            className="h-8 px-2"
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Lists */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('insertUnorderedList')}
            className="h-8 px-2"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('insertOrderedList')}
            className="h-8 px-2"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          {/* Indent */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('indent')}
            className="h-8 px-2"
            title="Indent"
          >
            <Indent className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => execCommand('outdent')}
            className="h-8 px-2"
            title="Outdent"
          >
            <Outdent className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Headings */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertHeading(1)}
            className="h-8 px-2"
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertHeading(2)}
            className="h-8 px-2"
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertHeading(3)}
            className="h-8 px-2"
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Links */}
          <Button
            variant="outline"
            size="sm"
            onClick={insertLink}
            className="h-8 px-2"
            title="Insert Link (Ctrl+K)"
          >
            <Link className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={removeLink}
            className="h-8 px-2"
            title="Remove Link"
          >
            <Unlink className="h-4 w-4" />
          </Button>

          {/* Images */}
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
                        if (url) {
                          const img = document.createElement('img');
                          img.src = url;
                          img.style.maxWidth = '100%';
                          img.style.height = 'auto';
                          
                          const selection = window.getSelection();
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            range.insertNode(img);
                            range.setStartAfter(img);
                            range.setEndAfter(img);
                            selection.removeAllRanges();
                            selection.addRange(range);
                          }
                          focusEditor();
                          handleInput();
                          e.currentTarget.value = '';
                        }
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

          <Separator orientation="vertical" className="h-8" />

          {/* Code & Blockquote */}
          <Button
            variant="outline"
            size="sm"
            onClick={insertCodeBlock}
            className="h-8 px-2"
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={insertBlockquote}
            className="h-8 px-2"
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={insertHorizontalLine}
            className="h-8 px-2"
            title="Horizontal Line"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Clear Formatting */}
          <Button
            variant="outline"
            size="sm"
            onClick={clearFormatting}
            className="h-8 px-2"
            title="Clear Formatting"
          >
            <Eraser className="h-4 w-4" />
          </Button>

          {/* Fullscreen Toggle */}
          {showFullscreen && (
            <>
              <Separator orientation="vertical" className="h-8" />
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 px-2"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        className="p-4 border rounded-b-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 prose prose-sm max-w-none"
        style={{ 
          height: isFullscreen ? 'calc(100vh - 80px)' : height,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowY: 'auto'
        }}
        suppressContentEditableWarning
      >
        {!value && <span className="text-muted-foreground">{placeholder}</span>}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center p-2 bg-muted rounded-b-lg border-t text-sm text-muted-foreground">
        {showWordCount && (
          <span>{wordCount} words</span>
        )}
        <div className="flex gap-2">
          <span>WYSIWYG Editor</span>
        </div>
      </div>
    </div>
  );
};

export default ModernWysiwygEditor;
