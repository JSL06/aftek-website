/**
 * ⚠️ CRITICAL: DO NOT MODIFY THIS COMPONENT ⚠️
 * 
 * This text editor has been carefully crafted to work correctly with contenteditable.
 * Previous versions had severe bugs including:
 * - Text appearing backwards (e.g., "hello" became "olleh")
 * - Cursor jumping to the beginning of text
 * - Text being inserted at wrong positions
 * 
 * THE FIX: This component lets the browser's native contenteditable handle ALL text input
 * naturally, without any JavaScript interference.
 * 
 * 🚫 NEVER ADD:
 * - document.execCommand('insertText') - Causes text reversal
 * - Manual text manipulation in keydown/keypress events
 * - preventDefault() on normal typing events
 * - Complex selection/cursor management
 * - Any code that intercepts normal character input
 * 
 * ✅ ONLY ALLOW:
 * - document.execCommand for formatting (bold, italic)
 * - Basic event handlers (onInput, onBlur)
 * - CSS styling and layout
 * 
 * 🔒 THIS CODE IS LOCKED - DO NOT CHANGE WITHOUT EXTENSIVE TESTING
 */

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Image as ImageIcon } from 'lucide-react';

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

  // ⚠️ CRITICAL: Initialize editor content ONLY when needed
  // DO NOT change this logic - it prevents content corruption
  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // ⚠️ CRITICAL: Simple content change handler - DO NOT MODIFY
  // This function MUST remain simple to prevent text reversal bugs
  const handleInput = () => {
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      console.log('🔍 SimpleRichTextEditor: handleInput called');
      console.log('🔍 SimpleRichTextEditor: New innerHTML:', newValue);
      console.log('🔍 SimpleRichTextEditor: Text content:', editorRef.current.textContent);
      onChange(newValue);
    }
  };

  // ⚠️ CRITICAL: Formatting functions - ONLY use document.execCommand
  // DO NOT add manual text insertion or cursor manipulation
  const toggleBold = () => {
    document.execCommand('bold');
    editorRef.current?.focus();
  };

  const toggleItalic = () => {
    document.execCommand('italic');
    editorRef.current?.focus();
  };

  return (
    <div className={`simple-rich-text-editor ${className}`}>
      {/* ⚠️ CRITICAL: Minimal Toolbar - DO NOT ADD COMPLEX FEATURES */}
      <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-t-lg border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleBold}
          className="h-8 px-2"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleItalic}
          className="h-8 px-2"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
      </div>

      {/* ⚠️ CRITICAL: Editor Area - DO NOT MODIFY THESE PROPERTIES */}
      {/* 
        This contenteditable element works because:
        1. NO onKeyDown handler - lets browser handle all key events naturally
        2. NO onPaste handler - lets browser handle paste naturally  
        3. NO manual text insertion - lets contenteditable work as intended
        4. Explicit CSS direction: 'ltr' - prevents RTL text reversal bugs
        5. Simple onInput/onBlur - only captures content changes, doesn't interfere
      */}
      <div
        ref={editorRef}
        contentEditable="true"
        onInput={handleInput}
        onBlur={handleInput}
        className="p-4 border rounded-b-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        style={{ 
          height,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowY: 'auto',
          direction: 'ltr', // ⚠️ CRITICAL: Force left-to-right text direction
          textAlign: 'left', // ⚠️ CRITICAL: Force left alignment
          unicodeBidi: 'normal', // ⚠️ CRITICAL: Normal bidirectional text
          writingMode: 'horizontal-tb' // ⚠️ CRITICAL: Horizontal top-to-bottom writing
        }}
        suppressContentEditableWarning
      >
        {!value && <span className="text-muted-foreground">{placeholder}</span>}
      </div>
    </div>
  );
};

export default SimpleRichTextEditor;
