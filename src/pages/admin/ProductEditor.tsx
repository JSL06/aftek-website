import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UploadedFile {
  url: string;
  title: string;
  description: string;
  public_id?: string;
}

const languageList = [
  { code: 'en', label: 'English' },
  { code: 'zh-Hans', label: '简体中文' },
  { code: 'zh-Hant', label: '繁體中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tiếng Việt' },
];

const ProductEditor = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showLangFields, setShowLangFields] = useState(false);
  const [names, setNames] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // Fetch products from Supabase on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Simulate fetching all products for related dropdown (replace with real fetch in production)
  useEffect(() => {
    setAllProducts(products);
  }, [products]);

  const categories = [
    'Waterproofing',
    'Sealants & Adhesives',
    'Redi-Mix G&M',
    'Flooring Systems',
    'Others (Insulation, Coatings)'
  ];

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSave = async () => {
    setLoading(true);
    // Compose product data
    const productData = {
      name: editingProduct?.name || '',
      category: editingProduct?.category || '',
      description: editingProduct?.description || '',
      specifications: editingProduct?.specifications || '',
      image: editingProduct?.image || '',
      datasheet: editingProduct?.datasheet || '',
      names: Object.keys(names).length > 0 ? names : null,
      related_products: relatedProducts.length > 0 ? relatedProducts : null,
      isActive: editingProduct?.isActive !== false,
    };
    try {
      if (editingProduct && editingProduct.id) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
      }
      // Refresh products
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      setProducts(data || []);
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      alert('Error saving product: ' + (err.message || err));
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      // Refresh products
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      setProducts(data || []);
    } catch (err) {
      alert('Error deleting product: ' + (err.message || err));
    }
    setLoading(false);
  };

  const toggleActive = (id) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { ...product, isActive: !product.isActive } : product
    );
    setProducts(updatedProducts);
  };

  const handleCloudinaryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      formData.append('upload_preset', 'unsigned_upload');
      const res = await fetch('https://api.cloudinary.com/v1_1/dalfag0y1/auto/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        newFiles.push({
          url: data.secure_url,
          title: files[i].name,
          description: '',
          public_id: data.public_id
        });
      }
    }
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleEditFile = (idx: number) => {
    setEditIndex(idx);
    setEditTitle(uploadedFiles[idx].title);
    setEditDescription(uploadedFiles[idx].description);
  };

  const handleSaveFile = (idx: number) => {
    setUploadedFiles(prev => prev.map((file, i) =>
      i === idx ? { ...file, title: editTitle, description: editDescription } : file
    ));
    setEditIndex(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleDeleteFile = async (idx: number) => {
    const file = uploadedFiles[idx];
    // Optionally delete from Cloudinary (requires API key/secret, so just remove from UI for now)
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  if (showForm) {
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
            <h1 className="text-2xl font-bold">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h1>
          </div>
        </div>

        <div className="container mx-auto p-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Product Name (Language)"
                  defaultValue={editingProduct?.name}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="toggle-lang">Add names in other languages?</Label>
                <Switch id="toggle-lang" checked={showLangFields} onCheckedChange={setShowLangFields} className="ml-2" />
              </div>
              {showLangFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {languageList.map(lang => (
                    <div key={lang.code}>
                      <Label htmlFor={`name-${lang.code}`}>Product Name ({lang.label})</Label>
                      <Input
                        id={`name-${lang.code}`}
                        placeholder={`Product Name (${lang.label})`}
                        value={names[lang.code] || ''}
                        onChange={e => setNames({ ...names, [lang.code]: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={editingProduct?.category}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product description..."
                  defaultValue={editingProduct?.description}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="specifications">Technical Specifications</Label>
                <Textarea
                  id="specifications"
                  placeholder="Technical specifications..."
                  defaultValue={editingProduct?.specifications}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="image">Product Image</Label>
                <Input
                  id="image"
                  placeholder="[PRODUCT_IMAGE_PLACEHOLDER_NAME]"
                  defaultValue={editingProduct?.image}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="datasheet">Datasheet PDF</Label>
                <Input
                  id="datasheet"
                  placeholder="[PDF_DATASHEET_PLACEHOLDER_NAME]"
                  defaultValue={editingProduct?.datasheet}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="related-products">Related Products</Label>
                <select
                  id="related-products"
                  multiple
                  className="mt-1 w-full border rounded p-2"
                  value={relatedProducts}
                  onChange={e => {
                    const options = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
                    setRelatedProducts(options);
                  }}
                >
                  {allProducts.filter(p => !editingProduct || p.id !== editingProduct.id).map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</p>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} className="bg-primary hover:bg-primary-hover">
                  <Save className="mr-2 h-4 w-4" />
                  Save Product
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

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="bg-gradient-hero text-primary-foreground p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <Link to="/admin/dashboard">
              <Button variant="secondary" className="mb-4 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Manage Products</h1>
            <p className="text-primary-foreground/80">Add, edit, and organize your product catalog</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-8 font-[Playfair Display]">
        <h1 className="text-2xl font-bold mb-6">Admin: Products</h1>
        <div className="mb-6">
          <label className="block text-sm font-medium text-primary mb-1" htmlFor="upload-product">Upload Product Files</label>
          <input
            id="upload-product"
            type="file"
            className="block w-full text-sm text-primary border border-primary rounded-lg cursor-pointer bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 p-2 font-[Playfair Display]"
            multiple
            onChange={handleCloudinaryUpload}
            style={{fontFamily: 'Playfair Display, serif'}}
          />
          <p className="text-xs text-muted-foreground mt-1">Drag and drop files here or click to select.</p>
        </div>
        {uploadedFiles.length > 0 && (
          <div className="mt-2">
            <div className="text-sm font-semibold mb-1">Uploaded Files:</div>
            <table className="w-full text-sm border mt-2">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Preview</th>
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.map((file, idx) => (
                  <tr key={file.url} className="border-b">
                    <td className="p-2">
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="underline text-primary">
                        {file.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img src={file.url} alt={file.title} className="h-12 w-12 object-contain" />
                        ) : (
                          'View File'
                        )}
                      </a>
                    </td>
                    <td className="p-2">
                      {editIndex === idx ? (
                        <input
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        file.title
                      )}
                    </td>
                    <td className="p-2">
                      {editIndex === idx ? (
                        <input
                          value={editDescription}
                          onChange={e => setEditDescription(e.target.value)}
                          className="border rounded p-1 w-full"
                        />
                      ) : (
                        file.description
                      )}
                    </td>
                    <td className="p-2 space-x-2">
                      {editIndex === idx ? (
                        <>
                          <button onClick={() => handleSaveFile(idx)} className="text-green-700 font-bold">Save</button>
                          <button onClick={() => setEditIndex(null)} className="text-gray-500">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditFile(idx)} className="text-primary font-bold">Edit</button>
                          <button onClick={() => handleDeleteFile(idx)} className="text-red-700 font-bold">Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="grid gap-6">
          {products.map(product => (
            <Card key={product.id} className="bg-card border-border shadow-card hover:shadow-elegant transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
                      <Badge variant="secondary">{product.category}</Badge>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{product.description}</p>
                    <div className="space-y-2 text-sm">
                      <div><strong>Image:</strong> <span className="text-muted-foreground">{product.image}</span></div>
                      <div><strong>Datasheet:</strong> <span className="text-muted-foreground">{product.datasheet}</span></div>
                      <div><strong>Specs:</strong> <span className="text-muted-foreground">{product.specifications}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleEdit(product)}
                      size="sm"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => toggleActive(product.id)}
                      size="sm"
                      variant="outline"
                      className={product.isActive ? "border-green-500 text-green-500 hover:bg-green-500 hover:text-white" : "border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"}
                    >
                      {product.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductEditor;