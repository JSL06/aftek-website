import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ModernRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
}

const ModernRichTextEditor: React.FC<ModernRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  className = "",
  height = "200px"
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      // Clean the incoming value before setting it
      const cleanedValue = cleanHtmlContent(value);
      if (cleanedValue !== value) {
        console.log('🔍 ModernRichTextEditor: Cleaned incoming value from:', value);
        console.log('🔍 ModernRichTextEditor: To:', cleanedValue);
      }
      editorRef.current.innerHTML = cleanedValue;
    }
  }, [value]);

  // Update button states based on current selection
  const updateButtonStates = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        // Check if current selection is bold
        const boldElement = container.nodeType === Node.ELEMENT_NODE 
          ? (container as Element).closest('b, strong') 
          : container.parentElement?.closest('b, strong');
        setIsBold(!!boldElement);
        
        // Check if current selection is italic
        const italicElement = container.nodeType === Node.ELEMENT_NODE 
          ? (container as Element).closest('i, em') 
          : container.parentElement?.closest('i, em');
        setIsItalic(!!italicElement);
      }
    }
  };

  // Clean HTML content by removing unnecessary styles and attributes
  const cleanHtmlContent = (html: string): string => {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove all style attributes and class attributes that contain Tailwind-like patterns
    const removeUnnecessaryAttributes = (element: Element) => {
      // Remove style attributes
      element.removeAttribute('style');
      
      // Remove class attributes that contain Tailwind-like patterns
      const classAttr = element.getAttribute('class');
      if (classAttr && (classAttr.includes('--tw-') || classAttr.includes('bg-') || classAttr.includes('text-'))) {
        element.removeAttribute('class');
      }
      
      // Recursively process child elements
      Array.from(element.children).forEach(removeUnnecessaryAttributes);
    };
    
    removeUnnecessaryAttributes(tempDiv);
    
    // Convert the cleaned content back to HTML string
    let cleanedHtml = tempDiv.innerHTML;
    
    // Remove any remaining style attributes that might have been missed
    cleanedHtml = cleanedHtml.replace(/\s*style="[^"]*"/g, '');
    
    // Remove any remaining class attributes that contain Tailwind patterns
    cleanedHtml = cleanedHtml.replace(/\s*class="[^"]*--tw-[^"]*"/g, '');
    cleanedHtml = cleanedHtml.replace(/\s*class="[^"]*bg-[^"]*"/g, '');
    cleanedHtml = cleanedHtml.replace(/\s*class="[^"]*text-[^"]*"/g, '');
    
    // Clean up empty attributes
    cleanedHtml = cleanedHtml.replace(/\s*class="\s*"/g, '');
    cleanedHtml = cleanedHtml.replace(/\s*class=""/g, '');
    
    // Clean up multiple spaces
    cleanedHtml = cleanedHtml.replace(/\s+/g, ' ');
    
    return cleanedHtml;
  };

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      const rawValue = editorRef.current.innerHTML;
      const cleanedValue = cleanHtmlContent(rawValue);
      console.log('🔍 ModernRichTextEditor: Raw innerHTML:', rawValue);
      console.log('🔍 ModernRichTextEditor: Cleaned HTML:', cleanedValue);
      onChange(cleanedValue);
    }
  };

  // Handle selection changes to update button states
  const handleSelectionChange = () => {
    updateButtonStates();
  };

  // Format text with proper HTML tags
  const formatText = (tag: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        if (!range.collapsed) {
          // Text is selected, wrap it with the tag
          const element = document.createElement(tag);
          range.surroundContents(element);
          
          // Merge adjacent elements of the same type
          const parent = element.parentElement;
          if (parent) {
            const nextSibling = element.nextSibling;
            if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE) {
              const nextElement = nextSibling as Element;
              if (nextElement.tagName.toLowerCase() === tag) {
                // Merge with next element
                element.innerHTML += nextElement.innerHTML;
                nextElement.remove();
              }
            }
            
            const prevSibling = element.previousSibling;
            if (prevSibling && prevSibling.nodeType === Node.ELEMENT_NODE) {
              const prevElement = prevSibling as Element;
              if (prevElement.tagName.toLowerCase() === tag) {
                // Merge with previous element
                prevElement.innerHTML += element.innerHTML;
                element.remove();
              }
            }
          }
        } else {
          // No text selected, insert the tag and place cursor inside
          const element = document.createElement(tag);
          element.innerHTML = '&nbsp;'; // Insert a non-breaking space
          range.insertNode(element);
          
          // Place cursor inside the element
          const newRange = document.createRange();
          newRange.setStart(element.firstChild!, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        
        editorRef.current.focus();
        handleInput();
        updateButtonStates();
      }
    }
  };

  // Toggle bold formatting
  const toggleBold = () => {
    formatText('b');
  };

  // Toggle italic formatting
  const toggleItalic = () => {
    formatText('i');
  };

  // Insert line break
  const insertLineBreak = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const br = document.createElement('br');
        range.insertNode(br);
        
        // Move cursor after the line break
        range.setStartAfter(br);
        range.setEndAfter(br);
        selection.removeAllRanges();
        selection.addRange(range);
        
        editorRef.current.focus();
        handleInput();
      }
    }
  };

  // Insert paragraph break
  const insertParagraph = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const p = document.createElement('p');
        p.innerHTML = '&nbsp;'; // Insert a non-breaking space
        range.insertNode(p);
        
        // Move cursor inside the new paragraph
        const newRange = document.createRange();
        newRange.setStart(p.firstChild!, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        editorRef.current.focus();
        handleInput();
      }
    }
  };

  return (
    <div className={`modern-rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-t-lg border-b">
        <Button
          variant={isBold ? "default" : "outline"}
          size="sm"
          onClick={toggleBold}
          className="h-8 px-2"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant={isItalic ? "default" : "outline"}
          size="sm"
          onClick={toggleItalic}
          className="h-8 px-2"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={insertLineBreak}
          className="h-8 px-2"
          title="Insert Line Break (Shift+Enter)"
        >
          Line Break
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={insertParagraph}
          className="h-8 px-2"
          title="Insert Paragraph (Enter)"
        >
          Paragraph
        </Button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable="true"
        onInput={handleInput}
        onBlur={handleInput}
        onKeyUp={updateButtonStates}
        onMouseUp={updateButtonStates}
        onSelect={handleSelectionChange}
        className="p-4 border rounded-b-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        style={{ 
          height,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowY: 'auto',
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'normal',
          writingMode: 'horizontal-tb'
        }}
        suppressContentEditableWarning
      >
        {!value && <span className="text-muted-foreground">{placeholder}</span>}
      </div>
    </div>
  );
};

export default ModernRichTextEditor;
