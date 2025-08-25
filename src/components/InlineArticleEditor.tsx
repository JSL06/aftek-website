import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Image as ImageIcon, 
  Upload, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Type,
  Bold,
  Italic,
  Underline,
  Link,
  Trash2,
  Copy,
  Move,
  Eye,
  Save,
  Plus,
  Columns,
  Grid3X3,
  Package,
  ExternalLink,
  X,
  Search,
  Edit
} from 'lucide-react';
import { productService, UnifiedProduct } from '@/services/productService';

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'heading' | 'paragraph' | 'list' | 'row';
  content: string; // Default/English content
  content_multilingual?: Record<string, string>; // Multilingual content for different languages
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  alignment: 'left' | 'center' | 'right' | 'justify';
  fontSize: 'small' | 'normal' | 'large' | 'h1' | 'h2' | 'h3';
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  width: 'small' | 'medium' | 'large' | 'full';
  margin: 'tight' | 'normal' | 'loose';
  isSelected: boolean;
  // Multi-column support
  columns?: number;
  columnLayout?: 'equal' | 'wide-left' | 'wide-right' | 'narrow-center';
  children?: ContentBlock[];
}

interface InlineArticleEditorProps {
  initialContent?: ContentBlock[];
  onContentChange: (content: ContentBlock[]) => void;
  onSave?: () => void;
  onPreview?: () => void;
  readOnly?: boolean;
  // Related content props
  relatedProducts?: string[];
  onRelatedProductsChange?: (products: string[]) => void;
  relatedLinks?: Array<{ title: string; url: string; description?: string }>;
  onRelatedLinksChange?: (links: Array<{ title: string; url: string; description?: string }>) => void;
  customButtons?: Array<{ text: string; url: string; variant?: 'default' | 'outline' | 'secondary' | 'destructive' }>;
  onCustomButtonsChange?: (buttons: Array<{ text: string; url: string; variant?: 'default' | 'outline' | 'secondary' | 'destructive' }>) => void;
}

const fontSizeOptions = [
  { value: 'small', label: 'Small', class: 'text-sm' },
  { value: 'normal', label: 'Normal', class: 'text-base' },
  { value: 'large', label: 'Large', class: 'text-lg' },
  { value: 'h1', label: 'Heading 1', class: 'text-3xl font-bold' },
  { value: 'h2', label: 'Heading 2', class: 'text-2xl font-bold' },
  { value: 'h3', label: 'Heading 3', class: 'text-xl font-bold' }
];

const widthOptions = [
  { value: 'small', label: 'Small (25%)', class: 'w-1/4' },
  { value: 'medium', label: 'Medium (50%)', class: 'w-1/2' },
  { value: 'large', label: 'Large (75%)', class: 'w-3/4' },
  { value: 'full', label: 'Full Width', class: 'w-full' }
];

const marginOptions = [
  { value: 'tight', label: 'Tight', class: 'my-2' },
  { value: 'normal', label: 'Normal', class: 'my-4' },
  { value: 'loose', label: 'Loose', class: 'my-8' }
];

const columnLayoutOptions = [
  { value: 'equal', label: 'Equal Width', class: 'grid-cols-2' },
  { value: 'wide-left', label: 'Wide Left', class: 'grid-cols-3' },
  { value: 'wide-right', label: 'Wide Right', class: 'grid-cols-3' },
  { value: 'narrow-center', label: 'Narrow Center', class: 'grid-cols-3' }
];

export default function InlineArticleEditor({ 
  initialContent = [], 
  onContentChange, 
  onSave, 
  onPreview,
  readOnly = false,
  relatedProducts = [],
  onRelatedProductsChange,
  relatedLinks = [],
  onRelatedLinksChange,
  customButtons = [],
  onCustomButtonsChange
}: InlineArticleEditorProps) {
  const [content, setContent] = useState<ContentBlock[]>(initialContent);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartIndex, setDragStartIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Language selection state
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh-Hant', name: '繁體中文', flag: '🇹🇼' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
  ];
  
  // Product selection state
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Helper function to get localized content for a block
  const getLocalizedContent = (block: ContentBlock, language: string): string => {
    if (language === 'en') {
      return block.content;
    }
    return block.content_multilingual?.[language] || block.content;
  };

  // Helper function to update localized content for a block
  const updateLocalizedContent = (blockId: string, language: string, newContent: string) => {
    setContent(prevContent => {
      const updatedContent = prevContent.map(block => {
        if (block.id === blockId) {
          if (language === 'en') {
            return { ...block, content: newContent };
          } else {
            return {
              ...block,
              content_multilingual: {
                ...block.content_multilingual,
                [language]: newContent
              }
            };
          }
        }
        return block;
      });
      onContentChange(updatedContent);
      return updatedContent;
    });
  };

  // Initialize with default content if empty
  useEffect(() => {
    if (content.length === 0) {
      const defaultBlock: ContentBlock = {
        id: crypto.randomUUID(),
        type: 'paragraph',
        content: 'Start typing your article here...',
        content_multilingual: {
          en: 'Start typing your article here...'
        },
        alignment: 'left',
        fontSize: 'normal',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        width: 'full',
        margin: 'normal',
        isSelected: false
      };
      setContent([defaultBlock]);
      onContentChange([defaultBlock]);
    }
  }, []);

  // Fetch products for selection
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await productService.getAllProducts();
        setProducts(allProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    
    if (!readOnly) {
      loadProducts();
    }
  }, [readOnly]);

  const createNewBlock = useCallback((type: ContentBlock['type'], afterId?: string) => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      content: type === 'image' ? '' : 'New content...',
      content_multilingual: {
        en: type === 'image' ? '' : 'New content...'
      },
      alignment: 'left',
      fontSize: type === 'heading' ? 'h2' : 'normal',
      fontWeight: type === 'heading' ? 'bold' : 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      width: type === 'image' ? 'medium' : 'full',
      margin: 'normal',
      isSelected: false
    };

    // Initialize row with default children
    if (type === 'row') {
      newBlock.columns = 2;
      newBlock.columnLayout = 'equal';
      newBlock.children = [
        {
          id: crypto.randomUUID(),
          type: 'paragraph',
          content: 'Left column content...',
          alignment: 'left',
          fontSize: 'normal',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          width: 'full',
          margin: 'normal',
          isSelected: false
        },
        {
          id: crypto.randomUUID(),
          type: 'paragraph',
          content: 'Right column content...',
          alignment: 'left',
          fontSize: 'normal',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          width: 'full',
          margin: 'normal',
          isSelected: false
        }
      ];
    }

    let newContent: ContentBlock[];
    if (afterId) {
      const index = content.findIndex(block => block.id === afterId);
      newContent = [...content];
      newContent.splice(index + 1, 0, newBlock);
    } else {
      newContent = [...content, newBlock];
    }

    setContent(newContent);
    onContentChange(newContent);
    setSelectedBlock(newBlock.id);
    return newBlock.id;
  }, [content, onContentChange]);

  const updateBlock = useCallback((id: string, updates: Partial<ContentBlock>) => {
    const newContent = content.map(block => 
      block.id === id ? { ...block, ...updates } : block
    );
    setContent(newContent);
    onContentChange(newContent);
  }, [content, onContentChange]);

  const updateChildBlock = useCallback((parentId: string, childId: string, updates: Partial<ContentBlock>) => {
    const newContent = content.map(block => {
      if (block.id === parentId && block.children) {
        return {
          ...block,
          children: block.children.map(child => 
            child.id === childId ? { ...child, ...updates } : child
          )
        };
      }
      return block;
    });
    setContent(newContent);
    onContentChange(newContent);
  }, [content, onContentChange]);

  const deleteBlock = useCallback((id: string) => {
    if (content.length <= 1) return; // Don't delete the last block
    
    const newContent = content.filter(block => block.id !== id);
    setContent(newContent);
    onContentChange(newContent);
    setSelectedBlock(null);
  }, [content, onContentChange]);

  const duplicateBlock = useCallback((id: string) => {
    const blockToDuplicate = content.find(block => block.id === id);
    if (!blockToDuplicate) return;

    const duplicatedBlock: ContentBlock = {
      ...blockToDuplicate,
      id: crypto.randomUUID(),
      isSelected: false
    };

    const index = content.findIndex(block => block.id === id);
    const newContent = [...content];
    newContent.splice(index + 1, 0, duplicatedBlock);
    
    setContent(newContent);
    onContentChange(newContent);
  }, [content, onContentChange]);

  const handleBlockClick = useCallback((id: string) => {
    setSelectedBlock(id);
    const newContent = content.map(block => ({
      ...block,
      isSelected: block.id === id
    }));
    setContent(newContent);
  }, [content]);

  const handleTextChange = useCallback((blockId: string, newContent: string) => {
    updateLocalizedContent(blockId, currentLanguage, newContent);
  }, [currentLanguage]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      updateBlock(blockId, { 
        imageUrl, 
        content: file.name,
        type: 'image'
      });
    }
  }, [updateBlock]);

  const handlePaste = useCallback((event: React.ClipboardEvent, blockId: string) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const imageUrl = URL.createObjectURL(file);
          updateBlock(blockId, { 
            imageUrl, 
            content: file.name,
            type: 'image'
          });
          event.preventDefault();
          break;
        }
      }
    }
  }, [updateBlock]);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragStartIndex === -1 || dragStartIndex === dropIndex) return;

    const newContent = [...content];
    const [draggedBlock] = newContent.splice(dragStartIndex, 1);
    newContent.splice(dropIndex, 0, draggedBlock);
    
    setContent(newContent);
    onContentChange(newContent);
    setIsDragging(false);
    setDragStartIndex(-1);
  }, [content, dragStartIndex, onContentChange]);

  const getColumnClasses = (layout: string, columnIndex: number) => {
    switch (layout) {
      case 'wide-left':
        return columnIndex === 0 ? 'col-span-2' : 'col-span-1';
      case 'wide-right':
        return columnIndex === 1 ? 'col-span-2' : 'col-span-1';
      case 'narrow-center':
        return columnIndex === 1 ? 'col-span-1' : 'col-span-1';
      default: // equal
        return 'col-span-1';
    }
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    const fontSizeClass = fontSizeOptions.find(f => f.value === block.fontSize)?.class || 'text-base';
    const widthClass = widthOptions.find(w => w.value === block.width)?.class || 'w-full';
    const marginClass = marginOptions.find(m => m.value === block.margin)?.class || 'my-4';

    const blockClasses = `
      ${marginClass} 
      ${block.alignment === 'center' ? 'mx-auto' : ''} 
      ${block.alignment === 'right' ? 'ml-auto' : ''} 
      ${block.isSelected ? 'ring-2 ring-blue-500' : ''} 
      ${!readOnly ? 'cursor-pointer transition-all duration-200 hover:bg-gray-50' : ''} 
      p-2 
      rounded-lg
      ${widthClass}
      relative
    `;

    const textClasses = `
      ${fontSizeClass} 
      ${block.fontWeight === 'bold' ? 'font-bold' : ''} 
      ${block.fontStyle === 'italic' ? 'italic' : ''} 
      ${block.textDecoration === 'underline' ? 'underline' : ''} 
      ${block.alignment === 'center' ? 'text-center' : ''} 
      ${block.alignment === 'right' ? 'text-right' : ''} 
      ${block.alignment === 'justify' ? 'text-justify' : ''}
    `;

    switch (block.type) {
      case 'row':
        return (
          <div
            key={block.id}
            className={`${blockClasses} ${block.isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={!readOnly ? () => handleBlockClick(block.id) : undefined}
            draggable={!readOnly}
            onDragStart={!readOnly ? (e) => handleDragStart(e, index) : undefined}
            onDragOver={!readOnly ? handleDragOver : undefined}
            onDrop={!readOnly ? (e) => handleDrop(e, index) : undefined}
          >
            <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">
                  Row Layout: {block.columns} columns ({block.columnLayout})
                </span>
                <div className="flex items-center gap-2">
                  {!readOnly ? (
                    <>
                      <Select 
                        value={block.columns?.toString() || '2'} 
                        onValueChange={(value) => updateBlock(block.id, { columns: parseInt(value) })}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 cols</SelectItem>
                          <SelectItem value="3">3 cols</SelectItem>
                          <SelectItem value="4">4 cols</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select 
                        value={block.columnLayout || 'equal'} 
                        onValueChange={(value: any) => updateBlock(block.id, { columnLayout: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {columnLayoutOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <span className="text-sm text-gray-600">
                      {block.columns} columns ({block.columnLayout})
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className={`grid ${columnLayoutOptions.find(c => c.value === block.columnLayout)?.class || 'grid-cols-2'} gap-4`}>
              {block.children?.map((child, childIndex) => (
                <div key={child.id} className={getColumnClasses(block.columnLayout || 'equal', childIndex)}>
                  {renderChildBlock(child, block.id, childIndex)}
                </div>
              )) || []}
            </div>
          </div>
        );

      case 'image':
        return (
          <div
            key={block.id}
            className={blockClasses}
            onClick={!readOnly ? () => handleBlockClick(block.id) : undefined}
            draggable={!readOnly}
            onDragStart={!readOnly ? (e) => handleDragStart(e, index) : undefined}
            onDragOver={!readOnly ? handleDragOver : undefined}
            onDrop={!readOnly ? (e) => handleDrop(e, index) : undefined}
          >
            {block.imageUrl ? (
              <div className="relative group">
                <img 
                  src={block.imageUrl} 
                  alt={block.imageAlt || block.content}
                  className="w-full h-auto rounded-lg shadow-md"
                />
                {block.imageCaption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg text-sm text-center">
                    {block.imageCaption}
                  </div>
                )}
                {block.isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded text-xs">
                    Selected
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Click to add image or paste from clipboard</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'heading':
        return (
          <div
            key={block.id}
            className={blockClasses}
            onClick={!readOnly ? () => handleBlockClick(block.id) : undefined}
            draggable={!readOnly}
            onDragStart={!readOnly ? (e) => handleDragStart(e, index) : undefined}
            onDragOver={!readOnly ? handleDragOver : undefined}
            onDrop={!readOnly ? (e) => handleDrop(e, index) : undefined}
          >
            {/* Language Indicator */}
            {!readOnly && (
              <div className="absolute top-1 right-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                {languages.find(lang => lang.code === currentLanguage)?.flag} {currentLanguage.toUpperCase()}
              </div>
            )}
            {!readOnly && block.isSelected ? (
              <Input
                value={getLocalizedContent(block, currentLanguage)}
                onChange={(e) => handleTextChange(block.id, e.target.value)}
                className={`${textClasses} border-2 border-blue-500 focus:border-blue-600`}
                placeholder="Enter heading..."
                autoFocus
              />
            ) : (
              <h2 className={textClasses}>
                {getLocalizedContent(block, currentLanguage) || 'Click to edit heading...'}
              </h2>
            )}
          </div>
        );

      case 'paragraph':
      case 'text':
        return (
          <div
            key={block.id}
            className={blockClasses}
            onClick={!readOnly ? () => handleBlockClick(block.id) : undefined}
            draggable={!readOnly}
            onDragStart={!readOnly ? (e) => handleDragStart(e, index) : undefined}
            onDragOver={!readOnly ? handleDragOver : undefined}
            onDrop={!readOnly ? (e) => handleDrop(e, index) : undefined}
          >
            {/* Language Indicator */}
            {!readOnly && (
              <div className="absolute top-1 right-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                {languages.find(lang => lang.code === currentLanguage)?.flag} {currentLanguage.toUpperCase()}
              </div>
            )}
            {!readOnly && block.isSelected ? (
              <Input
                value={getLocalizedContent(block, currentLanguage)}
                onChange={(e) => handleTextChange(block.id, e.target.value)}
                className={`${textClasses} border-2 border-blue-500 focus:border-blue-600`}
                placeholder="Enter text content..."
                autoFocus
              />
            ) : (
              <p className={textClasses}>
                {getLocalizedContent(block, currentLanguage) || 'Click to edit text...'}
              </p>
            )}
          </div>
        );

      case 'list':
        return (
          <div
            key={block.id}
            className={blockClasses}
            onClick={!readOnly ? () => handleBlockClick(block.id) : undefined}
            draggable={!readOnly}
            onDragStart={!readOnly ? (e) => handleDragStart(e, index) : undefined}
            onDragOver={!readOnly ? handleDragOver : undefined}
            onDrop={!readOnly ? (e) => handleDrop(e, index) : undefined}
          >
            {/* Language Indicator */}
            {!readOnly && (
              <div className="absolute top-1 right-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                {languages.find(lang => lang.code === currentLanguage)?.flag} {currentLanguage.toUpperCase()}
              </div>
            )}
            <ul className={textClasses}>
              <li>{getLocalizedContent(block, currentLanguage)}</li>
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  const renderChildBlock = (child: ContentBlock, parentId: string, childIndex: number) => {
    const fontSizeClass = fontSizeOptions.find(f => f.value === child.fontSize)?.class || 'text-base';
    const textClasses = `
      ${fontSizeClass} 
      ${child.fontWeight === 'bold' ? 'font-bold' : ''} 
      ${child.fontStyle === 'italic' ? 'italic' : ''} 
      ${child.textDecoration === 'underline' ? 'underline' : ''} 
      ${child.alignment === 'center' ? 'text-center' : ''} 
      ${child.alignment === 'right' ? 'text-right' : ''} 
      ${child.alignment === 'justify' ? 'text-justify' : ''}
    `;

    switch (child.type) {
      case 'image':
        return (
          <div className="relative group">
            {child.imageUrl ? (
              <>
                <img 
                  src={child.imageUrl} 
                  alt={child.imageAlt || child.content}
                  className="w-full h-auto rounded-lg shadow-md"
                />
                {child.imageCaption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg text-sm text-center">
                    {child.imageCaption}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Image</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'heading':
        return (
          <h3 className={textClasses}>
            {child.content}
          </h3>
        );

      case 'paragraph':
      case 'text':
        return (
          <p className={textClasses}>
            {child.content}
          </p>
        );

      case 'list':
        return (
          <ul className={textClasses}>
            <li>{child.content}</li>
          </ul>
        );

      default:
        return null;
    }
  };

  const renderToolbar = () => {
    const selectedBlockData = content.find(block => block.id === selectedBlock);
    
    return (
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 shadow-sm">
        {/* First Row - Main Controls */}
        <div className="flex items-center gap-4 mb-3">
          <h2 className="text-lg font-semibold">Article Editor</h2>
          
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Language:</span>
            <div className="flex gap-1">
              {languages.map(lang => (
                <Button
                  key={lang.code}
                  variant={currentLanguage === lang.code ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentLanguage(lang.code)}
                  className="px-2 py-1 text-xs"
                >
                  <span className="mr-1">{lang.flag}</span>
                  <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Block Type Selector */}
          <Select 
            value={selectedBlockData?.type || 'paragraph'} 
            onValueChange={(value: any) => {
              if (selectedBlock) {
                updateBlock(selectedBlock, { type: value });
              }
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraph">Paragraph</SelectItem>
              <SelectItem value="heading">Heading</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="row">Row (Multi-column)</SelectItem>
            </SelectContent>
          </Select>

          {/* Alignment Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant={selectedBlockData?.alignment === 'left' ? 'default' : 'outline'}
              size="sm"
              onClick={() => selectedBlock && updateBlock(selectedBlock, { alignment: 'left' })}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedBlockData?.alignment === 'center' ? 'default' : 'outline'}
              size="sm"
              onClick={() => selectedBlock && updateBlock(selectedBlock, { alignment: 'center' })}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedBlockData?.alignment === 'right' ? 'default' : 'outline'}
              size="sm"
              onClick={() => selectedBlock && updateBlock(selectedBlock, { alignment: 'right' })}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedBlockData?.alignment === 'justify' ? 'default' : 'outline'}
              size="sm"
              onClick={() => selectedBlock && updateBlock(selectedBlock, { alignment: 'justify' })}
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          {/* Font Size */}
          <Select 
            value={selectedBlockData?.fontSize || 'normal'} 
            onValueChange={(value: any) => {
              if (selectedBlock) {
                updateBlock(selectedBlock, { fontSize: value });
              }
            }}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontSizeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Text Formatting */}
          <Button
            variant={selectedBlockData?.fontWeight === 'bold' ? 'default' : 'outline'}
            size="sm"
            onClick={() => selectedBlock && updateBlock(selectedBlock, { 
              fontWeight: selectedBlockData?.fontWeight === 'bold' ? 'normal' : 'bold' 
            })}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={selectedBlockData?.fontStyle === 'italic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => selectedBlock && updateBlock(selectedBlock, { 
              fontStyle: selectedBlockData?.fontStyle === 'italic' ? 'normal' : 'italic' 
            })}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={selectedBlockData?.textDecoration === 'underline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => selectedBlock && updateBlock(selectedBlock, { 
              textDecoration: selectedBlockData?.textDecoration === 'underline' ? 'none' : 'underline' 
            })}
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        {/* Second Row - Additional Controls */}
        <div className="flex items-center gap-4">
          {/* Width Control */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Width:</span>
            <Select 
              value={selectedBlockData?.width || 'full'} 
              onValueChange={(value: any) => {
                if (selectedBlock) {
                  updateBlock(selectedBlock, { width: value });
                }
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {widthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Margin Control */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Margin:</span>
            <Select 
              value={selectedBlockData?.margin || 'normal'} 
              onValueChange={(value: any) => {
                if (selectedBlock) {
                  updateBlock(selectedBlock, { margin: value });
                }
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {marginOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedBlock && duplicateBlock(selectedBlock)}
              disabled={!selectedBlock}
            >
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedBlock && deleteBlock(selectedBlock)}
              disabled={!selectedBlock || content.length <= 1}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            {onPreview && (
              <Button variant="outline" size="sm" onClick={onPreview}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            )}
            {onSave && (
              <Button variant="default" size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {!readOnly && renderToolbar()}
      
      <div className="p-6 max-w-6xl mx-auto">
                {/* Quick Add Buttons - Hidden in read-only mode */}
        {!readOnly && (
          <div className="flex items-center gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Quick Add:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => createNewBlock('paragraph')}
            className="flex items-center gap-2"
          >
            <Type className="h-4 w-4" />
            Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => createNewBlock('heading')}
            className="flex items-center gap-2"
          >
            <Type className="h-4 w-4" />
            Heading
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => createNewBlock('image')}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => createNewBlock('list')}
            className="flex items-center gap-2"
          >
            <Type className="h-4 w-4" />
            List
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => createNewBlock('row')}
            className="flex items-center gap-2"
          >
            <Columns className="h-4 w-4" />
            Multi-column Row
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const buttonText = prompt('Enter button text:');
              const buttonUrl = prompt('Enter button URL:');
              if (buttonText && buttonUrl) {
                const newButtons = [...(customButtons || []), {
                  text: buttonText.trim(),
                  url: buttonUrl.trim(),
                  variant: 'default' as const
                }];
                onCustomButtonsChange?.(newButtons);
              }
            }}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Custom Button
          </Button>
        </div>
        )}

        {/* Content Editor */}
        <div 
          ref={editorRef}
          className="min-h-[600px] bg-white border border-gray-200 rounded-lg p-6"
          onPaste={!readOnly ? (e) => {
            // Handle pasting images into the editor
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
              if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                  const imageUrl = URL.createObjectURL(file);
                  const newBlock: ContentBlock = {
                    id: crypto.randomUUID(),
                    type: 'image',
                    content: file.name,
                    imageUrl,
                    alignment: 'center',
                    fontSize: 'normal',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    width: 'medium',
                    margin: 'normal',
                    isSelected: false
                  };
                  const newContent = [...content, newBlock];
                  setContent(newContent);
                  onContentChange(newContent);
                  e.preventDefault();
                  break;
                }
              }
            }
          } : undefined}
        >
          {content.map((block, index) => renderBlock(block, index))}
          
          {/* Related Products Display */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Related Products
              </h4>
              <div className="flex flex-wrap gap-2">
                {relatedProducts.map((productName, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                    <span className="text-sm font-medium">{productName}</span>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newName = prompt('Edit product name:', productName);
                          if (newName && newName.trim() && newName !== productName) {
                            const newProducts = [...relatedProducts];
                            newProducts[index] = newName.trim();
                            onRelatedProductsChange?.(newProducts);
                          }
                        }}
                        className="h-5 w-5 p-0 hover:bg-blue-100"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newProducts = relatedProducts.filter((_, i) => i !== index);
                          onRelatedProductsChange?.(newProducts);
                        }}
                        className="h-5 w-5 p-0 hover:bg-red-100 text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Links Display */}
          {relatedLinks && relatedLinks.length > 0 && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Link className="h-5 w-5" />
                Related Links
              </h4>
              <div className="space-y-2">
                {relatedLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{link.title}</div>
                      <div className="text-xs text-gray-500">{link.url}</div>
                      {link.description && (
                        <div className="text-xs text-gray-600 mt-1">{link.description}</div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(link.url, '_blank')}
                      className="cursor-pointer"
                    >
                      Visit Link
                    </Button>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newTitle = prompt('Edit link title:', link.title);
                          const newUrl = prompt('Edit link URL:', link.url);
                          const newDesc = prompt('Edit link description:', link.description || '');
                          if (newTitle && newUrl) {
                            const newLinks = [...relatedLinks];
                            newLinks[index] = { 
                              title: newTitle.trim(), 
                              url: newUrl.trim(), 
                              description: newDesc || undefined 
                            };
                            onRelatedLinksChange?.(newLinks);
                          }
                        }}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newLinks = relatedLinks.filter((_, i) => i !== index);
                          onRelatedLinksChange?.(newLinks);
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Buttons Display */}
          {customButtons && customButtons.length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Custom Buttons
              </h4>
              <div className="flex flex-wrap gap-3">
                {customButtons.map((button, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Button 
                      variant={button.variant || 'default'} 
                      size="sm"
                      onClick={() => window.open(button.url, '_blank')}
                      className="cursor-pointer"
                    >
                      {button.text}
                    </Button>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newText = prompt('Edit button text:', button.text);
                          const newUrl = prompt('Edit button URL:', button.url);
                          if (newText && newUrl) {
                            const newButtons = [...customButtons];
                            newButtons[index] = { 
                              text: newText.trim(), 
                              url: newUrl.trim(), 
                              variant: button.variant 
                            };
                            onCustomButtonsChange?.(newButtons);
                          }
                        }}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newButtons = customButtons.filter((_, i) => i !== index);
                          onCustomButtonsChange?.(newButtons);
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add new block button */}
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => createNewBlock('paragraph')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Block
            </Button>
          </div>
        </div>

        {/* Related Content Sections */}
        {!readOnly && (
          <div className="mt-8 space-y-6">
            {/* Related Products */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Related Products
              </h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {relatedProducts?.map((productName, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg hover:bg-muted/80 transition-colors">
                      <span className="text-sm cursor-pointer hover:text-blue-600" 
                            onClick={() => {
                              const newName = prompt('Edit product name:', productName);
                              if (newName && newName.trim() && newName !== productName) {
                                const newProducts = [...(relatedProducts || [])];
                                newProducts[index] = newName.trim();
                                onRelatedProductsChange?.(newProducts);
                              }
                            }}>
                        {productName}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newProducts = relatedProducts?.filter((_, i) => i !== index) || [];
                          onRelatedProductsChange?.(newProducts);
                        }}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Product Selector */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowProductSelector(!showProductSelector)}
                    className="w-full"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {showProductSelector ? 'Hide Product Selector' : 'Show Product Selector'}
                  </Button>
                  
                  {showProductSelector && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <Input
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="mb-3"
                      />
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {products
                          .filter(product => 
                            product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                            product.category.toLowerCase().includes(productSearch.toLowerCase())
                          )
                          .map(product => (
                            <div
                              key={product.id}
                              className="flex items-center gap-3 p-2 bg-white rounded border hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                if (!relatedProducts?.includes(product.name)) {
                                  const newProducts = [...(relatedProducts || []), product.name];
                                  onRelatedProductsChange?.(newProducts);
                                }
                              }}
                            >
                              {product.image_url && (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{product.name}</div>
                                <div className="text-xs text-gray-500 truncate">{product.category}</div>
                              </div>
                              {relatedProducts?.includes(product.name) && (
                                <Badge variant="secondary" className="text-xs">
                                  Added
                                </Badge>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Related Links */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Link className="h-5 w-5" />
                Related Links
              </h3>
              <div className="space-y-4">
                {relatedLinks?.map((link, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate cursor-pointer hover:text-blue-600" 
                           onClick={() => {
                             const newTitle = prompt('Edit link title:', link.title);
                             if (newTitle && newTitle.trim() && newTitle !== link.title) {
                               const newLinks = [...(relatedLinks || [])];
                               newLinks[index] = { ...link, title: newTitle.trim() };
                               onRelatedLinksChange?.(newLinks);
                             }
                           }}>
                        {link.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate cursor-pointer hover:text-blue-600" 
                           onClick={() => {
                             const newUrl = prompt('Edit link URL:', link.url);
                             if (newUrl && newUrl.trim() && newUrl !== link.url) {
                               const newLinks = [...(relatedLinks || [])];
                               newLinks[index] = { ...link, url: newUrl.trim() };
                               onRelatedLinksChange?.(newLinks);
                             }
                           }}>
                        {link.url}
                      </div>
                      {link.description && (
                        <div className="text-xs text-gray-600 mt-1 cursor-pointer hover:text-blue-600" 
                             onClick={() => {
                               const newDesc = prompt('Edit link description:', link.description);
                               if (newDesc !== link.description) {
                                 const newLinks = [...(relatedLinks || [])];
                                 newLinks[index] = { ...link, description: newDesc || undefined };
                                 onRelatedLinksChange?.(newLinks);
                               }
                             }}>
                          {link.description}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newLinks = relatedLinks?.filter((_, i) => i !== index) || [];
                        onRelatedLinksChange?.(newLinks);
                      }}
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="space-y-3">
                  <Input placeholder="Link title..." className="h-10" id={`link-title-${Date.now()}`} />
                  <Input placeholder="URL..." className="h-10" id={`link-url-${Date.now()}`} />
                  <Input placeholder="Description (optional)..." className="h-10" id={`link-desc-${Date.now()}`} />
                  <Button 
                    onClick={() => {
                      const titleInput = document.getElementById(`link-title-${Date.now()}`) as HTMLInputElement;
                      const urlInput = document.getElementById(`link-url-${Date.now()}`) as HTMLInputElement;
                      const descInput = document.getElementById(`link-desc-${Date.now()}`) as HTMLInputElement;
                      
                      if (titleInput?.value && urlInput?.value) {
                        const newLinks = [...(relatedLinks || []), {
                          title: titleInput.value,
                          url: urlInput.value,
                          description: descInput?.value || undefined
                        }];
                        onRelatedLinksChange?.(newLinks);
                        titleInput.value = '';
                        urlInput.value = '';
                        descInput.value = '';
                      }
                    }} 
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Link
                  </Button>
                </div>
              </div>
            </div>


          </div>
        )}

        {/* Hidden file input for image uploads - Hidden in read-only mode */}
        {!readOnly && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (selectedBlock) {
                handleImageUpload(e, selectedBlock);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
