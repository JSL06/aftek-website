import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, ArrowLeft, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import ArticleFilter, { ArticleFilters } from '@/components/ArticleFilter';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  category?: string;
  published_at?: string;
  is_published?: boolean;
  created_at?: string;
}

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ArticleFilters>({ 
    search: '', 
    category: []
  });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    is_published: true
  });

  // Article categories
  const categories = [
    { value: 'Industry News', label: 'Industry News' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Sustainability', label: 'Sustainability' },
    { value: 'Case Studies', label: 'Case Studies' },
    { value: 'Product Updates', label: 'Product Updates' },
    { value: 'Company News', label: 'Company News' }
  ];

  // Fetch articles from Supabase
  useEffect(() => {
    fetchArticles();
  }, []);

  // Apply filters whenever articles or filters change
  useEffect(() => {
    let filtered = [...articles];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchLower)) ||
        article.content.toLowerCase().includes(searchLower) ||
        (article.author && article.author.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(article =>
        article.category && filters.category.includes(article.category)
      );
    }

    setFilteredArticles(filtered);
  }, [articles, filters]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching articles:', error);
      } else {
        setArticles(data || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (newFilters: ArticleFilters) => {
    setFilters(newFilters);
  };

  const handleAddNew = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      author: '',
      category: '',
      is_published: true
    });
    setShowForm(true);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      author: article.author || '',
      category: article.category || '',
      is_published: article.is_published !== false
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (!formData.title || !formData.content) {
        alert('Title and content are required.');
        setLoading(false);
        return;
      }
      if (editingArticle && editingArticle.id) {
        // Update existing article
        const { error } = await supabase
          .from('articles')
          .update({
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt,
            author: formData.author,
            category: formData.category,
            is_published: formData.is_published,
            published_at: formData.is_published ? new Date().toISOString() : null
          })
          .eq('id', editingArticle.id);
        if (error) {
          alert('Error updating article');
        } else {
          alert('Article updated successfully!');
        }
      } else {
        // Add new article
        const { error } = await supabase
          .from('articles')
          .insert([{
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt,
            author: formData.author,
            category: formData.category,
            is_published: formData.is_published,
            published_at: formData.is_published ? new Date().toISOString() : null
          }]);
        if (error) {
          alert('Error adding article');
        } else {
          alert('Article added successfully!');
        }
      }
      await fetchArticles();
      setShowForm(false);
      setEditingArticle(null);
    } catch (error) {
      alert('Error saving article');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      if (error) {
        alert('Error deleting article');
      } else {
        alert('Article deleted successfully!');
        await fetchArticles();
      }
    } catch (error) {
      alert('Error deleting article');
    }
    setLoading(false);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto p-8">
          <div className="mb-6">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
                {editingArticle ? 'Edit Article' : 'Add New Article'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Article Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter article title"
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Enter author name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Enter article excerpt"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter article content"
                  rows={10}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                />
                <Label htmlFor="is_published">Published</Label>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Article'}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const displayArticles = filteredArticles;

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto">
          <Link to="/admin/dashboard">
            <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Manage Articles</h1>
        </div>
      </div>
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Articles Management</h1>
            <p className="text-muted-foreground">Manage your articles</p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Article
          </Button>
        </div>

        {/* Article Filter */}
        <ArticleFilter onFilterChange={handleFilterChange} />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{article.title}</h3>
                      <Badge variant={article.is_published ? "default" : "secondary"}>
                        {article.is_published ? "Published" : "Draft"}
                      </Badge>
                      {article.category && (
                        <Badge variant="outline" className="ml-2">
                          {article.category}
                        </Badge>
                      )}
                      <p className="text-muted-foreground text-sm mb-2 mt-2 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <p className="text-xs text-muted-foreground">Author: {article.author}</p>
                      <p className="text-xs text-muted-foreground">{article.published_at ? `Published: ${new Date(article.published_at).toLocaleDateString()}` : ''}</p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(article)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={article.is_published ? "destructive" : "default"}
                        className={article.is_published ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"}
                        onClick={async () => {
                          setLoading(true);
                          await supabase
                            .from('articles')
                            .update({ is_published: !article.is_published, published_at: !article.is_published ? new Date().toISOString() : null })
                            .eq('id', article.id);
                          await fetchArticles();
                          setLoading(false);
                        }}
                      >
                        {article.is_published ? (
                          <>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {displayArticles.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first article.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Article
              </Button>
            </CardContent>
          </Card>
        )}
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Showing {displayArticles.length} of {articles.length} articles
          </p>
        </div>
      </div>
    </div>
  );
};

export default Articles;