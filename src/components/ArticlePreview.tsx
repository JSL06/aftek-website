import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Eye, Download } from 'lucide-react';
import { ArticleImageBlock } from './ArticleImageManager';

interface ArticlePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  excerpt: string;
  content: string;
  blocks: ArticleImageBlock[];
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

const spacingOptions = [
  { value: 'tight', label: 'Tight', class: 'my-2' },
  { value: 'normal', label: 'Normal', class: 'my-4' },
  { value: 'loose', label: 'Loose', class: 'my-8' }
];

export default function ArticlePreview({
  isOpen,
  onClose,
  title,
  excerpt,
  content,
  blocks,
  featuredImage,
  author,
  category,
  publishedAt,
  readTime
}: ArticlePreviewProps) {
  const renderBlock = (block: ArticleImageBlock) => {
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
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  {block.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 rounded-b-lg text-sm">
                      {block.caption}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`${spacingClass} ${block.alignment === 'center' ? 'text-center' : ''} ${block.alignment === 'right' ? 'text-right' : ''}`}>
            <div className={`${widthClass} ${block.alignment === 'right' ? 'ml-auto' : ''}`}>
              <p className="text-gray-700 leading-relaxed text-lg">{block.textContent}</p>
            </div>
          </div>
        );

      case 'image-text':
        const isTextLeft = block.textPosition === 'left';
        const isTextTop = block.textPosition === 'top';
        
        return (
          <div className={`${spacingClass} ${block.alignment === 'center' ? 'mx-auto' : ''}`}>
            <div className={`${widthClass} ${block.alignment === 'right' ? 'ml-auto' : ''}`}>
              <div className={`flex ${isTextTop ? 'flex-col' : 'flex-row'} gap-6 ${isTextLeft && !isTextTop ? 'flex-row-reverse' : ''}`}>
                <div className={`${isTextTop ? 'w-full' : 'w-1/2'}`}>
                  {block.imageUrl ? (
                    <img 
                      src={block.imageUrl} 
                      alt={block.altText || block.caption || 'Article image'}
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <div className={`${isTextTop ? 'w-full' : 'w-1/2'} flex flex-col justify-center`}>
                  <p className="text-gray-700 leading-relaxed text-lg">{block.textContent}</p>
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
                    <span className="text-gray-500">Gallery {i}</span>
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Article Preview
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="article-preview bg-white">
          {/* Featured Image */}
          {featuredImage && (
            <div className="w-full h-64 mb-8">
              <img 
                src={featuredImage} 
                alt="Featured image"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              {category && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                  {category}
                </span>
              )}
              {readTime && (
                <span className="text-gray-500 text-sm">
                  {readTime} min read
                </span>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {title || 'Article Title'}
            </h1>
            
            {excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {excerpt}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-200 pt-4">
              {author && (
                <div className="flex items-center gap-2">
                  <span>By {author}</span>
                </div>
              )}
              {publishedAt && (
                <div className="flex items-center gap-2">
                  <span>{new Date(publishedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            {/* Rich text content */}
            {content && (
              <div 
                className="mb-8"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}

            {/* Content blocks */}
            {blocks.map((block) => (
              <div key={block.id}>
                {renderBlock(block)}
              </div>
            ))}
          </div>
        </div>

        {/* Preview Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-gray-500">
            This is how your article will appear to readers
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
