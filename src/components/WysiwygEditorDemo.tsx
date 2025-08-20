import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ModernWysiwygEditor from './ModernWysiwygEditor';
import './ModernWysiwygEditor.css';

const WysiwygEditorDemo: React.FC = () => {
  const [content, setContent] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHtmlOutput(newContent);
  };

  const sampleContent = `
<h1>Welcome to the Modern WYSIWYG Editor</h1>
<p>This is a <strong>powerful</strong> and <em>feature-rich</em> text editor that provides:</p>
<ul>
<li><strong>Direct inline editing</strong> - See exactly how your content will look</li>
<li><strong>Rich formatting</strong> - Bold, italic, underline, and more</li>
<li><strong>Professional typography</strong> - Multiple heading levels and font options</li>
<li><strong>Image support</strong> - Upload or link images with Supabase integration</li>
<li><strong>Code blocks</strong> - Perfect for technical documentation</li>
</ul>

<h2>Key Features</h2>
<blockquote>
This editor supports all modern web standards and provides a seamless writing experience.
</blockquote>

<h3>Formatting Options</h3>
<p>You can use the toolbar to:</p>
<ol>
<li>Change <span style={{color: '#9e1717'}}>text colors</span></li>
<li>Apply <span style={{backgroundColor: '#ffff00'}}>background highlighting</span></li>
<li>Align text left, center, right, or justify</li>
<li>Create lists and indentation</li>
<li>Insert links and images</li>
</ol>

<h3>Code Example</h3>
<pre><code>function helloWorld() {
  console.log("Hello, WYSIWYG Editor!");
  return "Success!";
}</code></pre>

<p>Try editing this content directly in the editor below!</p>
  `;

  const loadSampleContent = () => {
    setContent(sampleContent);
    setHtmlOutput(sampleContent);
  };

  const clearContent = () => {
    setContent('');
    setHtmlOutput('');
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Modern WYSIWYG Editor Demo</h1>
        <p className="text-xl text-muted-foreground">
          A production-ready, feature-rich text editor for your website
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>WYSIWYG Editor</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadSampleContent}>
                    Load Sample
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearContent}>
                    Clear
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Edit content directly in the preview area. All formatting is applied in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModernWysiwygEditor
                value={content}
                onChange={handleContentChange}
                placeholder="Start writing your content here..."
                height="500px"
                showToolbar={true}
                showWordCount={true}
                showFullscreen={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Features & Output Section */}
        <div className="space-y-6">
          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>Everything you need for rich text editing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Direct inline editing</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Undo/Redo (Ctrl+Z/Y)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Bold, Italic, Underline</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Font size & family</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Text & background colors</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Text alignment</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Lists & indentation</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Headings (H1-H6)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Links & images</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Code blocks</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Blockquotes</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Supabase integration</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Fullscreen mode</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Keyboard shortcuts</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Responsive design</span>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>Speed up your editing workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Bold</span>
                <Badge variant="outline">Ctrl+B</Badge>
              </div>
              <div className="flex justify-between">
                <span>Italic</span>
                <Badge variant="outline">Ctrl+I</Badge>
              </div>
              <div className="flex justify-between">
                <span>Underline</span>
                <Badge variant="outline">Ctrl+U</Badge>
              </div>
              <div className="flex justify-between">
                <span>Insert Link</span>
                <Badge variant="outline">Ctrl+K</Badge>
              </div>
              <div className="flex justify-between">
                <span>Undo</span>
                <Badge variant="outline">Ctrl+Z</Badge>
              </div>
              <div className="flex justify-between">
                <span>Redo</span>
                <Badge variant="outline">Ctrl+Y</Badge>
              </div>
            </CardContent>
          </Card>

          {/* HTML Output */}
          <Card>
            <CardHeader>
              <CardTitle>HTML Output</CardTitle>
              <CardDescription>Clean, semantic HTML for your website</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div 
                    className="prose prose-sm max-w-none p-4 border rounded-lg bg-muted/30"
                    dangerouslySetInnerHTML={{ __html: htmlOutput || '<p class="text-muted-foreground">No content to preview</p>' }}
                  />
                </TabsContent>
                <TabsContent value="html" className="mt-4">
                  <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                    <code>{htmlOutput || '<!-- No content -->'}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Usage Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
          <CardDescription>Integration guide for your website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Import the Component</h3>
              <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                <code>{`import ModernWysiwygEditor from '@/components/ModernWysiwygEditor';
import '@/components/ModernWysiwygEditor.css';`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">2. Use in Your Component</h3>
              <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                <code>{`const [content, setContent] = useState('');

<ModernWysiwygEditor
  value={content}
  onChange={setContent}
  placeholder="Start writing..."
  height="400px"
  showToolbar={true}
  showWordCount={true}
  showFullscreen={true}
/>`}</code>
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">3. Supabase Storage Setup</h3>
              <p className="text-muted-foreground mb-2">
                Create a storage bucket named "editor-images" in your Supabase project for image uploads.
              </p>
              <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                <code>{`-- In Supabase SQL Editor:
-- Create storage bucket for editor images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('editor-images', 'editor-images', true);

-- Set up RLS policies
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'editor-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'editor-images' AND auth.role() = 'authenticated');`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WysiwygEditorDemo;
