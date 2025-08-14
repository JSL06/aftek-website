import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  Code
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Start writing your article..." 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

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
    
    // Set cursor position after the inserted text
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
      // If no text is selected, just insert the formatting
      replaceSelectedText(before + after);
    }
  };

  const insertAtCursor = (text: string) => {
    replaceSelectedText(text);
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // For now, we'll just insert a placeholder
        // In a real implementation, you'd upload to Supabase storage
        const imageUrl = URL.createObjectURL(file);
        insertAtCursor(`<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`);
      }
    };
    input.click();
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
      action: handleImageUpload
    }
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
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
        className="min-h-[400px] border-0 resize-none focus:ring-0"
        onSelect={() => {
          if (textareaRef.current) {
            setSelection({
              start: textareaRef.current.selectionStart,
              end: textareaRef.current.selectionEnd
            });
          }
        }}
      />
    </div>
  );
};

export default RichTextEditor; 