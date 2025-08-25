import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Image as ImageIcon, 
  Upload, 
  Move, 
  Trash2, 
  Copy, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Eye,
  Edit,
  Plus,
  GripVertical,
  Settings,
  Palette,
  Type,
  Layout,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  ImagePlus,
  FileText,
  Calendar,
  User,
  Clock
} from 'lucide-react';

export interface ArticleImageBlock {
  id: string;
  type: 'image' | 'text' | 'image-text' | 'gallery' | 'header';
  content: string;
  imageUrl?: string;
  caption?: string;
  altText?: string;
  alignment: 'left' | 'center' | 'right';
  width: 'small' | 'medium' | 'large' | 'full';
  textContent?: string;
  textPosition?: 'left' | 'right' | 'top' | 'bottom';
  spacing: 'tight' | 'normal' | 'loose';
  position: { x: number; y: number };
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  textFormat?: 'paragraph' | 'h1' | 'h2' | 'h3' | 'title' | 'caption';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  color?: string;
}

interface ArticleImageManagerProps {
  blocks: ArticleImageBlock[];
  onBlocksChange: (blocks: ArticleImageBlock[]) => void;
  onPreview?: () => void;
  articleTitle?: string;
  articleExcerpt?: string;
  articleContent?: string;
  featuredImage?: string;
  author?: string;
  category?: string;
  publishedAt?: string;
  readTime?: number;
}

const imageWidths = [
  { value: 'small', label: 'Small (25%)', class: 'w-1/4' },
  { value: 'medium', label: 'Medium (50%)', class: 'w-1/2' },
  { value: 'large', label: 'Large (75%)', class: 'w-3/4' },
  { value: 'full', label: 'Full Width', class: 'w-full' }
];

const alignments = [
  { value: 'left', label: 'Left', icon: AlignLeft },
  { value: 'center', label: 'Center', icon: AlignCenter },
  { value: 'right', label: 'Right', icon: AlignRight }
];

const spacingOptions = [
  { value: 'tight', label: 'Tight', class: 'my-2' },
  { value: 'normal', label: 'Normal', class: 'my-4' },
  { value: 'loose', label: 'Loose', class: 'my-8' }
];

const fontSizeOptions = [
  { value: 'xs', label: 'Extra Small', class: 'text-xs' },
  { value: 'sm', label: 'Small', class: 'text-sm' },
  { value: 'base', label: 'Base', class: 'text-base' },
  { value: 'lg', label: 'Large', class: 'text-lg' },
  { value: 'xl', label: 'Extra Large', class: 'text-xl' },
  { value: '2xl', label: '2XL', class: 'text-2xl' },
  { value: '3xl', label: '3XL', class: 'text-3xl' },
  { value: '4xl', label: '4XL', class: 'text-4xl' }
];

const textFormatOptions = [
  { value: 'paragraph', label: 'Paragraph', icon: Pilcrow },
  { value: 'h1', label: 'Heading 1', icon: Heading1 },
  { value: 'h2', label: 'Heading 2', icon: Heading2 },
  { value: 'h3', label: 'Heading 3', icon: Heading3 },
  { value: 'title', label: 'Title', icon: Type },
  { value: 'caption', label: 'Caption', icon: FileText }
];

const fontWeightOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semibold' },
  { value: 'bold', label: 'Bold' }
];

export default function ArticleImageManager({ 
  blocks, 
  onBlocksChange, 
  onPreview,
  articleTitle = 'Article Title',
  articleExcerpt = 'Article excerpt goes here...',
  articleContent = '',
  featuredImage,
  author,
  category,
  publishedAt,
  readTime
}: ArticleImageManagerProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(true);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Initialize with article header if no blocks exist
  useEffect(() => {
    if (blocks.length === 0) {
      const headerBlock: ArticleImageBlock = {
        id: crypto.randomUUID(),
        type: 'header',
        content: 'Article Header',
        alignment: 'center',
        width: 'full',
        spacing: 'normal',
        position: { x: 0, y: 0 },
        textFormat: 'h1',
        fontSize: '3xl',
        fontWeight: 'bold'
      };
      onBlocksChange([headerBlock]);
    }
  }, [blocks.length, onBlocksChange]);

  const addBlock = useCallback((type: ArticleImageBlock['type']) => {
    const newBlock: ArticleImageBlock = {
      id: crypto.randomUUID(),
      type,
      content: '',
      alignment: 'center',
      width: 'medium',
      spacing: 'normal',
      textContent: type === 'text' ? 'Double-click to edit text...' : '',
      textPosition: type === 'image-text' ? 'right' : 'top',
      position: { x: 100, y: 100 },
      fontSize: 'base',
      textFormat: 'paragraph',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#000000'
    };
    onBlocksChange([...blocks, newBlock]);
    setSelectedBlock(newBlock.id);
  }, [blocks, onBlocksChange]);

  const updateBlock = useCallback((id: string, updates: Partial<ArticleImageBlock>) => {
    const updatedBlocks = blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    );
    onBlocksChange(updatedBlocks);
  }, [blocks, onBlocksChange]);

  const deleteBlock = useCallback((id: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== id);
    onBlocksChange(updatedBlocks);
    setSelectedBlock(null);
  }, [blocks, onBlocksChange]);

  const duplicateBlock = useCallback((id: string) => {
    const blockToDuplicate = blocks.find(block => block.id === id);
    if (blockToDuplicate) {
      const duplicatedBlock: ArticleImageBlock = {
        ...blockToDuplicate,
        id: crypto.randomUUID(),
        position: { 
          x: (blockToDuplicate.position?.x || 0) + 20, 
          y: (blockToDuplicate.position?.y || 0) + 20 
        }
      };
      onBlocksChange([...blocks, duplicatedBlock]);
    }
  }, [blocks, onBlocksChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent, blockId: string) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('.block-content')) {
      return; // Only drag on the block container, not inputs or content
    }
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setSelectedBlock(blockId);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedBlock) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const block = blocks.find(b => b.id === selectedBlock);
    if (block) {
      const newPosition = {
        x: (block.position?.x || 0) + deltaX,
        y: (block.position?.y || 0) + deltaY
      };
      
      updateBlock(selectedBlock, { position: newPosition });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, selectedBlock, dragStart, blocks, updateBlock]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback((blockId: string, currentText: string) => {
    setEditingBlockId(blockId);
    setEditingText(currentText);
    setTimeout(() => textInputRef.current?.focus(), 100);
  }, []);

  const handleTextSave = useCallback(() => {
    if (editingBlockId && editingText !== null) {
      updateBlock(editingBlockId, { textContent: editingText });
      setEditingBlockId(null);
      setEditingText(null);
    }
  }, [editingBlockId, editingText, updateBlock]);

  const handleTextCancel = useCallback(() => {
    setEditingBlockId(null);
    setEditingText(null);
  }, []);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      updateBlock(blockId, { imageUrl, content: file.name });
    }
  }, [updateBlock]);

  const getTextClasses = (block: ArticleImageBlock) => {
    const classes = [];
    
    // Font size
    if (block.fontSize) {
      const fontSizeClass = fontSizeOptions.find(f => f.value === block.fontSize)?.class;
      if (fontSizeClass) classes.push(fontSizeClass);
    }
    
    // Font weight
    if (block.fontWeight) {
      classes.push(`font-${block.fontWeight}`);
    }
    
    // Font style
    if (block.fontStyle === 'italic') {
      classes.push('italic');
    }
    
    // Text decoration
    if (block.textDecoration === 'underline') {
      classes.push('underline');
    }
    
    // Text format
    if (block.textFormat === 'h1') {
      classes.push('text-4xl font-bold');
    } else if (block.textFormat === 'h2') {
      classes.push('text-3xl font-semibold');
    } else if (block.textFormat === 'h3') {
      classes.push('text-2xl font-semibold');
    } else if (block.textFormat === 'title') {
      classes.push('text-2xl font-bold');
    } else if (block.textFormat === 'caption') {
      classes.push('text-sm text-gray-600');
    }
    
    return classes.join(' ');
  };

  const renderBlockInPreview = (block: ArticleImageBlock) => {
    const widthClass = imageWidths.find(w => w.value === block.width)?.class || 'w-1/2';
    const spacingClass = spacingOptions.find(s => s.value === block.spacing)?.class || 'my-4';
    const isSelected = selectedBlock === block.id;
    const isEditing = editingBlockId === block.id;

    const blockStyle = {
      transform: `translate(${block.position?.x || 0}px, ${block.position?.y || 0}px)`,
      cursor: isDragging && isSelected ? 'grabbing' : 'grab',
      position: 'absolute' as const,
      zIndex: isSelected ? 10 : 1
    };

    switch (block.type) {
      case 'header':
        return (
          <div
            key={block.id}
            className={`${spacingClass} ${block.alignment === 'center' ? 'left-1/2 -translate-x-1/2' : ''} ${block.alignment === 'right' ? 'right-0' : ''}`}
            style={blockStyle}
            onMouseDown={(e) => handleMouseDown(e, block.id)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div className={`${widthClass} ${block.alignment === 'right' ? 'ml-auto' : ''} relative`}>
              <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
                {/* Featured Image */}
                {featuredImage && (
                  <div className="w-full h-48 mb-6">
                    <img 
                      src={featuredImage} 
                      alt="Featured image"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* Article Meta */}
                <div className="flex items-center gap-3 mb-4">
                  {category && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                      {category}
                    </span>
                  )}
                  {readTime && (
                    <span className="text-gray-500 text-sm flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {readTime} min read
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {articleTitle || 'Article Title'}
                </h1>
                
                {/* Excerpt */}
                {articleExcerpt && (
                  <p className="text-xl text-gray-600 leading-relaxed mb-6">
                    {articleExcerpt}
                  </p>
                )}

                {/* Author and Date */}
                <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-200 pt-4">
                  {author && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>By {author}</span>
                    </div>
                  )}
                  {publishedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(publishedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              {isSelected && (
                <div className="absolute -inset-2 border-2 border-blue-500 rounded-lg pointer-events-none" />
              )}
            </div>
          </div>
        );

      case 'image':
        return (
          <div
            key={block.id}
            className={`${spacingClass} ${block.alignment === 'center' ? 'left-1/2 -translate-x-1/2' : ''} ${block.alignment === 'right' ? 'right-0' : ''}`}
            style={blockStyle}
            onMouseDown={(e) => handleMouseDown(e, block.id)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div className={`${widthClass} ${block.alignment === 'right' ? 'ml-auto' : ''} relative group`}>
              {block.imageUrl ? (
                <div className="relative">
                  <img 
                    src={block.imageUrl} 
                    alt={block.altText || block.caption || 'Article image'}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  {block.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 rounded-b-lg text-sm">
                      {block.caption}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              {isSelected && (
                <div className="absolute -inset-2 border-2 border-blue-500 rounded-lg pointer-events-none" />
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div
            key={block.id}
            className={`${spacingClass} ${block.alignment === 'center' ? 'left-1/2 -translate-x-1/2' : ''} ${block.alignment === 'right' ? 'right-0' : ''}`}
            style={blockStyle}
            onMouseDown={(e) => handleMouseDown(e, block.id)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div className={`${widthClass} ${block.alignment === 'right' ? 'ml-auto' : ''} relative`}>
              {isEditing ? (
                <div className="bg-white rounded-lg shadow-lg border-2 border-blue-500 p-4">
                  <Input
                    ref={textInputRef}
                    value={editingText || ''}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={handleTextSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTextSave();
                      if (e.key === 'Escape') handleTextCancel();
                    }}
                    className="text-lg border-0 focus:ring-0 p-0"
                    autoFocus
                  />
                </div>
              ) : (
                <div 
                  className="block-content bg-white rounded-lg shadow-lg border p-4 min-h-[60px] cursor-text"
                  onDoubleClick={() => handleDoubleClick(block.id, block.textContent || '')}
                >
                  <p className={`${getTextClasses(block)} leading-relaxed`}>
                    {block.textContent || 'Double-click to edit text...'}
                  </p>
                </div>
              )}
              {isSelected && !isEditing && (
                <div className="absolute -inset-2 border-2 border-blue-500 rounded-lg pointer-events-none" />
              )}
            </div>
          </div>
        );

      case 'image-text':
        const isTextLeft = block.textPosition === 'left';
        const isTextTop = block.textPosition === 'top';
        
        return (
          <div
            key={block.id}
            className={`${spacingClass} ${block.alignment === 'center' ? 'left-1/2 -translate-x-1/2' : ''} ${block.alignment === 'right' ? 'right-0' : ''}`}
            style={blockStyle}
            onMouseDown={(e) => handleMouseDown(e, block.id)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div className={`${widthClass} ${block.alignment === 'right' ? 'ml-auto' : ''} relative`}>
              <div className="bg-white rounded-lg shadow-lg border p-4">
                <div className={`flex ${isTextTop ? 'flex-col' : 'flex-row'} gap-4 ${isTextLeft && !isTextTop ? 'flex-row-reverse' : ''}`}>
                  <div className={`${isTextTop ? 'w-full' : 'w-1/2'}`}>
                    {block.imageUrl ? (
                      <img 
                        src={block.imageUrl} 
                        alt={block.altText || block.caption || 'Article image'}
                        className="w-full h-auto rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className={`${isTextTop ? 'w-full' : 'w-1/2'} flex flex-col justify-center`}>
                    {isEditing ? (
                      <Input
                        ref={textInputRef}
                        value={editingText || ''}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={handleTextSave}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleTextSave();
                          if (e.key === 'Escape') handleTextCancel();
                        }}
                        className="text-lg border-0 focus:ring-0 p-0"
                        autoFocus
                      />
                    ) : (
                      <p 
                        className={`${getTextClasses(block)} leading-relaxed cursor-text block-content`}
                        onDoubleClick={() => handleDoubleClick(block.id, block.textContent || '')}
                      >
                        {block.textContent || 'Double-click to edit text...'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {isSelected && (
                <div className="absolute -inset-2 border-2 border-blue-500 rounded-lg pointer-events-none" />
              )}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div
            key={block.id}
            className={`${spacingClass} ${block.alignment === 'center' ? 'left-1/2 -translate-x-1/2' : ''} ${block.alignment === 'right' ? 'right-0' : ''}`}
            style={blockStyle}
            onMouseDown={(e) => handleMouseDown(e, block.id)}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div className={`${widthClass} ${block.alignment === 'right' ? 'ml-auto' : ''} relative`}>
              <div className="grid grid-cols-2 gap-4 bg-white rounded-lg shadow-lg border p-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                ))}
              </div>
              {isSelected && (
                <div className="absolute -inset-2 border-2 border-blue-500 rounded-lg pointer-events-none" />
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Canva-Style Article Designer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => addBlock('header')} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Add Header
            </Button>
            <Button 
              onClick={() => addBlock('image')} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Add Image
            </Button>
            <Button 
              onClick={() => addBlock('text')} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Type className="h-4 w-4" />
              Add Text
            </Button>
            <Button 
              onClick={() => addBlock('image-text')} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Image + Text
            </Button>
            <Button 
              onClick={() => addBlock('gallery')} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Gallery
            </Button>
            <Button 
              onClick={() => setShowToolbar(!showToolbar)} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 ml-auto"
            >
              <Settings className="h-4 w-4" />
              {showToolbar ? 'Hide' : 'Show'} Toolbar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Canvas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Article Preview - Drag blocks to reposition them
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={previewRef}
            className="relative w-full min-h-[800px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
            style={{ backgroundImage: 'radial-gradient(circle, #f3f4f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Content blocks - draggable */}
            {blocks.map((block) => renderBlockInPreview(block))}

            {/* Empty state */}
            {blocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No content blocks yet</h3>
                  <p className="text-gray-500 mb-4">
                    Start building your article by adding blocks above
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button onClick={() => addBlock('header')} variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Add Header
                    </Button>
                    <Button onClick={() => addBlock('image')} variant="outline" size="sm">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                    <Button onClick={() => addBlock('text')} variant="outline" size="sm">
                      <Type className="h-4 w-4 mr-2" />
                      Add Text
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Block Properties Panel */}
      {showToolbar && selectedBlock && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Block Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const block = blocks.find(b => b.id === selectedBlock);
              if (!block) return null;

              return (
                <div className="space-y-4">
                  {/* Block Controls */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Alignment */}
                    <div>
                      <label className="block text-xs font-medium mb-1">Alignment</label>
                      <Select 
                        value={block.alignment} 
                        onValueChange={(value: any) => updateBlock(block.id, { alignment: value })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {alignments.map(align => (
                            <SelectItem key={align.value} value={align.value}>
                              <div className="flex items-center gap-2">
                                <align.icon className="h-3 w-3" />
                                {align.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Width */}
                    <div>
                      <label className="block text-xs font-medium mb-1">Width</label>
                      <Select 
                        value={block.width} 
                        onValueChange={(value: any) => updateBlock(block.id, { width: value })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {imageWidths.map(width => (
                            <SelectItem key={width.value} value={width.value}>
                              {width.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Spacing */}
                    <div>
                      <label className="block text-xs font-medium mb-1">Spacing</label>
                      <Select 
                        value={block.spacing} 
                        onValueChange={(value: any) => updateBlock(block.id, { spacing: value })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {spacingOptions.map(spacing => (
                            <SelectItem key={spacing.value} value={spacing.value}>
                              {spacing.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Text Position (for image-text blocks) */}
                    {block.type === 'image-text' && (
                      <div>
                        <label className="block text-xs font-medium mb-1">Text Position</label>
                        <Select 
                          value={block.textPosition || 'right'} 
                          onValueChange={(value: any) => updateBlock(block.id, { textPosition: value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                            <SelectItem value="top">Top</SelectItem>
                            <SelectItem value="bottom">Bottom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Text Formatting Options */}
                  {(block.type === 'text' || block.type === 'image-text') && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">Text Formatting</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Text Format */}
                        <div>
                          <label className="block text-xs font-medium mb-1">Format</label>
                          <Select 
                            value={block.textFormat || 'paragraph'} 
                            onValueChange={(value: any) => updateBlock(block.id, { textFormat: value })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {textFormatOptions.map(format => (
                                <SelectItem key={format.value} value={format.value}>
                                  <div className="flex items-center gap-2">
                                    <format.icon className="h-3 w-3" />
                                    {format.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Font Size */}
                        <div>
                          <label className="block text-xs font-medium mb-1">Font Size</label>
                          <Select 
                            value={block.fontSize || 'base'} 
                            onValueChange={(value: any) => updateBlock(block.id, { fontSize: value })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fontSizeOptions.map(size => (
                                <SelectItem key={size.value} value={size.value}>
                                  {size.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Font Weight */}
                        <div>
                          <label className="block text-xs font-medium mb-1">Weight</label>
                          <Select 
                            value={block.fontWeight || 'normal'} 
                            onValueChange={(value: any) => updateBlock(block.id, { fontWeight: value })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fontWeightOptions.map(weight => (
                                <SelectItem key={weight.value} value={weight.value}>
                                  {weight.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Font Style */}
                        <div>
                          <label className="block text-xs font-medium mb-1">Style</label>
                          <div className="flex gap-1">
                            <Button
                              variant={block.fontStyle === 'italic' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateBlock(block.id, { 
                                fontStyle: block.fontStyle === 'italic' ? 'normal' : 'italic' 
                              })}
                              className="h-8 px-2"
                            >
                              <Italic className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={block.textDecoration === 'underline' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => updateBlock(block.id, { 
                                textDecoration: block.textDecoration === 'underline' ? 'none' : 'underline' 
                              })}
                              className="h-8 px-2"
                            >
                              <Underline className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Block-specific inputs */}
                  {block.type === 'image' && (
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="text-sm font-medium">Image Settings</h4>
                      <div>
                        <label className="block text-sm font-medium mb-2">Image</label>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Image URL or upload file"
                            value={block.imageUrl || ''}
                            onChange={(e) => updateBlock(block.id, { imageUrl: e.target.value })}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, block.id)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Alt Text</label>
                          <Input
                            placeholder="Image description"
                            value={block.altText || ''}
                            onChange={(e) => updateBlock(block.id, { altText: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Caption</label>
                          <Input
                            placeholder="Image caption"
                            value={block.caption || ''}
                            onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Block Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateBlock(block.id)}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBlock(block.id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
