# Modern WYSIWYG Text Editor

A production-ready, feature-rich WYSIWYG (What You See Is What You Get) text editor built with React and TypeScript. This editor provides direct inline editing capabilities with a comprehensive toolbar and modern UI design.

## ✨ Features

### Core Functionality
- **Direct inline editing** - Edit text directly in the preview area
- **Real-time formatting** - See changes immediately as you type
- **Rich text support** - Bold, italic, underline, strikethrough
- **Typography** - Multiple heading levels (H1-H6), font sizes, font families
- **Color support** - Text color and background highlighting
- **Alignment** - Left, center, right, and justify text alignment
- **Lists** - Ordered and unordered lists with indentation
- **Links** - Insert and remove hyperlinks
- **Images** - Upload images to Supabase or insert from URLs
- **Code blocks** - Syntax-highlighted code sections
- **Blockquotes** - Styled quote blocks
- **Horizontal lines** - Visual separators

### Advanced Features
- **Undo/Redo** - Full undo/redo stack with keyboard shortcuts
- **Keyboard shortcuts** - Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline), etc.
- **Fullscreen mode** - Distraction-free editing experience
- **Word count** - Real-time word counting
- **Responsive design** - Works perfectly on all devices
- **Cross-browser compatibility** - Modern browsers support
- **Clean HTML output** - Semantic, clean HTML generation
- **Supabase integration** - Direct image uploads to cloud storage

## 🚀 Quick Start

### 1. Installation

The editor is already included in your project. Import it in your component:

```tsx
import ModernWysiwygEditor from '@/components/ModernWysiwygEditor';
import '@/components/ModernWysiwygEditor.css';
```

### 2. Basic Usage

```tsx
import React, { useState } from 'react';
import ModernWysiwygEditor from '@/components/ModernWysiwygEditor';

const MyComponent = () => {
  const [content, setContent] = useState('');

  return (
    <ModernWysiwygEditor
      value={content}
      onChange={setContent}
      placeholder="Start writing..."
      height="400px"
    />
  );
};
```

### 3. Supabase Storage Setup

For image uploads to work, create a storage bucket in your Supabase project:

```sql
-- Create storage bucket for editor images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('editor-images', 'editor-images', true);

-- Set up RLS policies
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'editor-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'editor-images' AND auth.role() = 'authenticated');
```

## 📖 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Current HTML content |
| `onChange` | `(value: string) => void` | - | Callback when content changes |
| `placeholder` | `string` | `'Start writing...'` | Placeholder text when empty |
| `className` | `string` | `''` | Additional CSS classes |
| `height` | `string` | `'400px'` | Editor height |
| `showToolbar` | `boolean` | `true` | Show/hide toolbar |
| `showWordCount` | `boolean` | `true` | Show/hide word count |
| `showFullscreen` | `boolean` | `true` | Show/hide fullscreen button |

### Methods

The editor provides several methods for programmatic control:

```tsx
const editorRef = useRef<HTMLDivElement>(null);

// Focus the editor
editorRef.current?.focus();

// Get current content
const html = editorRef.current?.innerHTML;

// Set content programmatically
editorRef.current.innerHTML = '<h1>New Content</h1>';
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+K` | Insert link |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+Shift+Z` | Redo (alternative) |

## 🎨 Customization

### Styling

The editor uses CSS custom properties and can be customized via CSS:

```css
/* Custom colors */
.wysiwyg-editor [contenteditable] {
  --editor-primary: #3b82f6;
  --editor-border: #e5e7eb;
  --editor-bg: #ffffff;
}

/* Custom toolbar styling */
.wysiwyg-editor .flex.flex-wrap {
  background: var(--editor-bg);
  border-color: var(--editor-border);
}
```

### Toolbar Configuration

You can customize which toolbar items are shown:

```tsx
<ModernWysiwygEditor
  showToolbar={true}
  showWordCount={true}
  showFullscreen={true}
  // ... other props
/>
```

## 🔧 Advanced Usage

### Custom Formatting

Add custom formatting options by extending the editor:

```tsx
const customFormatting = () => {
  // Your custom formatting logic
  document.execCommand('insertHTML', false, '<span class="custom-class">Custom Text</span>');
};
```

### Content Validation

Validate content before saving:

```tsx
const handleContentChange = (newContent: string) => {
  // Validate content
  if (newContent.length > 10000) {
    alert('Content too long');
    return;
  }
  
  setContent(newContent);
};
```

### Auto-save

Implement auto-save functionality:

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    if (content) {
      saveContent(content);
    }
  }, 2000); // Auto-save after 2 seconds of inactivity

  return () => clearTimeout(timer);
}, [content]);
```

## 📱 Responsive Design

The editor is fully responsive and works on all device sizes:

- **Desktop**: Full toolbar with all features
- **Tablet**: Optimized layout with grouped controls
- **Mobile**: Touch-friendly buttons and responsive toolbar

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚨 Troubleshooting

### Common Issues

1. **Images not uploading**
   - Check Supabase storage bucket configuration
   - Verify RLS policies are correct
   - Check browser console for errors

2. **Formatting not working**
   - Ensure `document.execCommand` is supported
   - Check for JavaScript errors in console
   - Verify CSS is properly loaded

3. **Content not saving**
   - Check `onChange` callback implementation
   - Verify state management in parent component
   - Check for validation errors

### Debug Mode

Enable debug logging:

```tsx
// Add to your component
useEffect(() => {
  console.log('Editor content changed:', content);
}, [content]);
```

## 📄 Examples

### Product Description Editor

```tsx
const ProductEditor = () => {
  const [description, setDescription] = useState('');

  return (
    <div className="product-editor">
      <h2>Product Description</h2>
      <ModernWysiwygEditor
        value={description}
        onChange={setDescription}
        placeholder="Describe your product..."
        height="300px"
        showWordCount={true}
      />
      <Button onClick={() => saveProduct(description)}>
        Save Description
      </Button>
    </div>
  );
};
```

### Article Editor

```tsx
const ArticleEditor = () => {
  const [article, setArticle] = useState('');

  return (
    <div className="article-editor">
      <ModernWysiwygEditor
        value={article}
        onChange={setArticle}
        placeholder="Write your article..."
        height="600px"
        showFullscreen={true}
      />
    </div>
  );
};
```

## 🔒 Security Considerations

- **XSS Protection**: Content is sanitized before rendering
- **File Upload Limits**: Image uploads are restricted to image types
- **Content Validation**: Implement server-side validation for user content
- **RLS Policies**: Use Row Level Security in Supabase for access control

## 📈 Performance

- **Lazy Loading**: Editor loads only when needed
- **Debounced Updates**: Content changes are optimized
- **Memory Management**: Undo/redo stack is limited to prevent memory leaks
- **Efficient Rendering**: Uses React's optimized rendering

## 🤝 Contributing

To extend the editor:

1. **Add new toolbar buttons** in the `ModernWysiwygEditor.tsx` file
2. **Extend formatting options** by adding new `execCommand` calls
3. **Customize styling** in `ModernWysiwygEditor.css`
4. **Add new features** by extending the component interface

## 📝 License

This editor is part of your AFTEK website project and follows the same licensing terms.

## 🆘 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Verify Supabase configuration
4. Check component props and state management

---

**Happy editing! 🎉**

The Modern WYSIWYG Editor provides everything you need for professional content creation with a beautiful, intuitive interface.
