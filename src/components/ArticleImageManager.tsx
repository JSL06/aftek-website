import React, { useState, useRef, useCallback } from 'react';
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
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export interface ArticleImageBlock {
  id: string;
  type: 'image' | 'text' | 'image-text' | 'gallery';
  content: string;
  imageUrl?: string;
  caption?: string;
  altText?: string;
  alignment: 'left' | 'center' | 'right';
  width: 'small' | 'medium' | 'large' | 'full';
  textContent?: string;
  textPosition?: 'left' | 'right' | 'top' | 'bottom';
  spacing: 'tight' | 'normal' | 'loose';
}

interface ArticleImageManagerProps {
  blocks: ArticleImageBlock[];
  onBlocksChange: (blocks: ArticleImageBlock[]) => void;
  onPreview?: () => void;
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

export default function ArticleImageManager({ blocks, onBlocksChange, onPreview }: ArticleImageManagerProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addBlock = useCallback((type: ArticleImageBlock['type']) => {
    const newBlock: ArticleImageBlock = {
      id: crypto.randomUUID(),
      type,
      content: '',
      alignment: 'center',
      width: 'medium',
      spacing: 'normal',
      textContent: type === 'text' ? 'Enter your text here...' : '',
      textPosition: type === 'image-text' ? 'right' : 'top'
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
        id: crypto.randomUUID()
      };
      onBlocksChange([...blocks, duplicatedBlock]);
    }
  }, [blocks, onBlocksChange]);

  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(block => block.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];
    onBlocksChange(newBlocks);
  }, [blocks, onBlocksChange]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you'd upload to your storage service
      // For now, we'll create a local URL
      const imageUrl = URL.createObjectURL(file);
      updateBlock(blockId, { imageUrl, content: file.name });
    }
  }, [updateBlock]);

  const getBlockPreview = (block: ArticleImageBlock) => {
    const widthClass = imageWidths.find(w => w.value === block.width)?.class || 'w-1/2';
    const spacingClass = spacingOptions.find(s => s.value === block.spacing)?.class || 'my-4';

    switch (block.type) {
      case 'image':
        return (
          <div className={`${spacingClass} ${block.alignment === 'center' ? 'mx-auto' : ''}`}>
            <div className={`${widthClass} ${block.alignment === 'right' ? 'ml-auto' : ''}`}>
              {block.imageUrl ? (
                <div className="relative group">
                  <img 
                    src={block.imageUrl} 
                    alt={block.altText || block.caption || 'Article image'}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                  {block.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg text-sm">
                      {block.caption}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`${spacingClass} ${block.alignment === 'center' ? 'text-center' : ''} ${block.alignment === 'right' ? 'text-right' : ''}`}>
            <div className={`${widthClass} ${block.alignment === 'right' ? 'ml-auto' : ''}`}>
              <p className="text-gray-700 leading-relaxed">{block.textContent}</p>
            </div>
          </div>
        );

      case 'image-text':
        const isTextLeft = block.textPosition === 'left';
        const isTextTop = block.textPosition === 'top';
        
        return (
          <div className={`${spacingClass} ${block.alignment === 'center' ? 'mx-auto' : ''}`}>
            <div className={`${widthClass} ${block.alignment === 'right' ? 'ml-auto' : ''}`}>
              <div className={`flex ${isTextTop ? 'flex-col' : 'flex-row'} gap-4 ${isTextLeft && !isTextTop ? 'flex-row-reverse' : ''}`}>
                <div className={`${isTextTop ? 'w-full' : 'w-1/2'}`}>
                  {block.imageUrl ? (
                    <img 
                      src={block.imageUrl} 
                      alt={block.altText || block.caption || 'Article image'}
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className={`${isTextTop ? 'w-full' : 'w-1/2'} flex flex-col justify-center`}>
                  <p className="text-gray-700 leading-relaxed">{block.textContent}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className={`${spacingClass} ${block.alignment === 'center' ? 'mx-auto' : ''}`}>
            <div className={`${widthClass} ${block.alignment === 'right' ? 'ml-auto' : ''}`}>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                ))}
              </div>
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
            <ImageIcon className="h-5 w-5" />
            Content Blocks Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
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
              <Edit className="h-4 w-4" />
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
            {onPreview && (
              <Button 
                onClick={onPreview} 
                variant="default" 
                size="sm"
                className="flex items-center gap-2 ml-auto"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Blocks */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id} className="relative">
            <Card className={`${selectedBlock === block.id ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {block.type.replace('-', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-500">Block {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Move controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveBlock(block.id, 'up')}
                        disabled={index === 0}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveBlock(block.id, 'down')}
                        disabled={index === blocks.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateBlock(block.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBlock(block.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
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

                {/* Block-specific inputs */}
                {block.type === 'image' && (
                  <div className="space-y-3">
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

                {block.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Text Content</label>
                    <Textarea
                      placeholder="Enter your text content..."
                      value={block.textContent || ''}
                      onChange={(e) => updateBlock(block.id, { textContent: e.target.value })}
                      rows={4}
                    />
                  </div>
                )}

                {block.type === 'image-text' && (
                  <div className="space-y-3">
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
                    <div>
                      <label className="block text-sm font-medium mb-2">Text Content</label>
                      <Textarea
                        placeholder="Enter your text content..."
                        value={block.textContent || ''}
                        onChange={(e) => updateBlock(block.id, { textContent: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Live Preview */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Live Preview</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[100px]">
                    {getBlockPreview(block)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {blocks.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content blocks yet</h3>
              <p className="text-gray-500 mb-4">
                Start building your article by adding images, text, or combined content blocks.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => addBlock('image')} variant="outline" size="sm">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
                <Button onClick={() => addBlock('text')} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
                <Button onClick={() => addBlock('image-text')} variant="outline" size="sm">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image + Text
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
