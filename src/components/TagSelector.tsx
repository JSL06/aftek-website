import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';
import { ArticleTag } from '@/services/articleService';

interface TagSelectorProps {
  selectedTags: ArticleTag[];
  availableTags: ArticleTag[];
  onTagsChange: (tags: ArticleTag[]) => void;
  maxTags?: number;
  placeholder?: string;
}

export default function TagSelector({
  selectedTags,
  availableTags,
  onTagsChange,
  maxTags = 10,
  placeholder = "Select tags..."
}: TagSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.some(selected => selected.id === tag.id)
  );

  const handleTagToggle = (tag: ArticleTag, checked: boolean) => {
    if (checked) {
      if (selectedTags.length < maxTags) {
        onTagsChange([...selectedTags, tag]);
      }
    } else {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    }
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId));
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <div className="relative">
      {/* Selected Tags Display */}
      <div className="min-h-[40px] p-2 border border-gray-300 rounded-md bg-white">
        {selectedTags.length === 0 ? (
          <span className="text-gray-500 text-sm">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 text-sm"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => removeTag(tag.id)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleDropdown}
          className="mt-2 w-full justify-between"
        >
          <span>Add Tags</span>
          <span className="text-xs text-gray-500">
            {selectedTags.length}/{maxTags}
          </span>
        </Button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60">
          {/* Search */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Tags List */}
          <ScrollArea className="max-h-48">
            <div className="p-2">
              {filteredTags.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  {searchTerm ? 'No tags found' : 'No more tags available'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTags.map(tag => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag.id}
                        checked={false}
                        onCheckedChange={(checked) => handleTagToggle(tag, checked as boolean)}
                        disabled={selectedTags.length >= maxTags}
                      />
                      <Label
                        htmlFor={tag.id}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{filteredTags.length} tags available</span>
              <span>{selectedTags.length}/{maxTags} selected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
