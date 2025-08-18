import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { AdminLanguageProvider } from "./contexts/AdminLanguageContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import Projects from "./pages/Projects";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import NewContact from "./pages/NewContact";
import NotFound from "./pages/NotFound";
import FlexProPU from "./pages/products/FlexProPU";
import ProductDetail from "./pages/ProductDetail";
import CaseStudies from "./pages/CaseStudies";
import Resources from "./pages/Resources";
import Media from "./pages/Media";
import Guide from "./pages/Guide";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/Products";
import AdminProjects from "./pages/admin/Projects";
import CategoryManager from "./pages/admin/CategoryManager";
import AdminArticles from "./pages/admin/Articles";
import MediaManager from "./pages/admin/MediaManager";
import FeaturedProductsManager from "./pages/admin/FeaturedProductsManager";
import UnifiedProducts from "./pages/admin/UnifiedProducts";
import GuideManager from "./pages/admin/GuideManager";
import WebsiteTextEditor from './pages/admin/WebsiteTextEditor';
import ProtectedPage from './components/ProtectedPage';
import WebsiteTextManager from './pages/admin/WebsiteTextManager';
import TranslationDashboard from './pages/admin/TranslationDashboard';
import ProductEdit from './pages/admin/ProductEdit';
import AdminLayout from './components/admin/AdminLayout';

const queryClient = new QueryClient();

// Get basename for GitHub Pages
const basename = import.meta.env.PROD ? '/aftek-website' : '';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={basename}>
          <CompanyProvider>
            <Routes>
              {/* Company-specific Routes */}
              <Route path="/aftek" element={<Layout />}>
                <Route index element={<ProtectedPage pageName="home"><Home /></ProtectedPage>} />
                <Route path="about" element={<ProtectedPage pageName="about"><About /></ProtectedPage>} />
                <Route path="products" element={<ProtectedPage pageName="products"><Products /></ProtectedPage>} />
                <Route path="projects" element={<ProtectedPage pageName="projects"><Projects /></ProtectedPage>} />
                <Route path="articles" element={<ProtectedPage pageName="articles"><Articles /></ProtectedPage>} />
                <Route path="articles/:slug" element={<ProtectedPage pageName="articles"><ArticleDetail /></ProtectedPage>} />
                <Route path="guide" element={<ProtectedPage pageName="guide"><Guide /></ProtectedPage>} />
                <Route path="contact" element={<ProtectedPage pageName="contact"><NewContact /></ProtectedPage>} />
                <Route path="products/flex-pro-pu" element={<ProtectedPage pageName="products"><FlexProPU /></ProtectedPage>} />
                <Route path="products/:productId" element={<ProtectedPage pageName="products"><ProductDetail /></ProtectedPage>} />
                <Route path="case-studies" element={<ProtectedPage pageName="projects"><CaseStudies /></ProtectedPage>} />
                <Route path="resources" element={<ProtectedPage pageName="articles"><Resources /></ProtectedPage>} />
                <Route path="media" element={<ProtectedPage pageName="articles"><Media /></ProtectedPage>} />
              </Route>

              <Route path="/rla" element={<Layout />}>
                <Route index element={<ProtectedPage pageName="home"><Home /></ProtectedPage>} />
                <Route path="about" element={<ProtectedPage pageName="about"><About /></ProtectedPage>} />
                <Route path="products" element={<ProtectedPage pageName="products"><Products /></ProtectedPage>} />
                <Route path="projects" element={<ProtectedPage pageName="projects"><Projects /></ProtectedPage>} />
                <Route path="articles" element={<ProtectedPage pageName="articles"><Articles /></ProtectedPage>} />
                <Route path="articles/:slug" element={<ProtectedPage pageName="articles"><ArticleDetail /></ProtectedPage>} />
                <Route path="guide" element={<ProtectedPage pageName="guide"><Guide /></ProtectedPage>} />
                <Route path="contact" element={<ProtectedPage pageName="contact"><NewContact /></ProtectedPage>} />
                <Route path="products/flex-pro-pu" element={<ProtectedPage pageName="products"><FlexProPU /></ProtectedPage>} />
                <Route path="products/:productId" element={<ProtectedPage pageName="products"><ProductDetail /></ProtectedPage>} />
                <Route path="case-studies" element={<ProtectedPage pageName="projects"><CaseStudies /></ProtectedPage>} />
                <Route path="resources" element={<ProtectedPage pageName="articles"><Resources /></ProtectedPage>} />
                <Route path="media" element={<ProtectedPage pageName="articles"><Media /></ProtectedPage>} />
              </Route>

              <Route path="/itls" element={<Layout />}>
                <Route index element={<ProtectedPage pageName="home"><About /></ProtectedPage>} />
                <Route path="about" element={<ProtectedPage pageName="about"><About /></ProtectedPage>} />
                <Route path="products" element={<ProtectedPage pageName="products"><Products /></ProtectedPage>} />
                <Route path="projects" element={<ProtectedPage pageName="projects"><Projects /></ProtectedPage>} />
                <Route path="articles" element={<ProtectedPage pageName="articles"><Articles /></ProtectedPage>} />
                <Route path="articles/:slug" element={<ProtectedPage pageName="articles"><ArticleDetail /></ProtectedPage>} />
                <Route path="guide" element={<ProtectedPage pageName="guide"><Guide /></ProtectedPage>} />
                <Route path="contact" element={<ProtectedPage pageName="contact"><NewContact /></ProtectedPage>} />
                <Route path="products/flex-pro-pu" element={<ProtectedPage pageName="products"><FlexProPU /></ProtectedPage>} />
                <Route path="products/:productId" element={<ProtectedPage pageName="products"><ProductDetail /></ProtectedPage>} />
                <Route path="case-studies" element={<ProtectedPage pageName="projects"><CaseStudies /></ProtectedPage>} />
                <Route path="resources" element={<ProtectedPage pageName="articles"><Resources /></ProtectedPage>} />
                <Route path="media" element={<ProtectedPage pageName="articles"><Media /></ProtectedPage>} />
              </Route>

              {/* Default Routes (Aftek) */}
              <Route path="/" element={<Layout />}>
                <Route index element={<ProtectedPage pageName="home"><Home /></ProtectedPage>} />
                <Route path="about" element={<ProtectedPage pageName="about"><About /></ProtectedPage>} />
                <Route path="products" element={<ProtectedPage pageName="products"><Products /></ProtectedPage>} />
                <Route path="projects" element={<ProtectedPage pageName="projects"><Projects /></ProtectedPage>} />
                <Route path="articles" element={<ProtectedPage pageName="articles"><Articles /></ProtectedPage>} />
                <Route path="articles/:slug" element={<ProtectedPage pageName="articles"><ArticleDetail /></ProtectedPage>} />
                <Route path="guide" element={<ProtectedPage pageName="guide"><Guide /></ProtectedPage>} />
                <Route path="contact" element={<ProtectedPage pageName="contact"><NewContact /></ProtectedPage>} />
                <Route path="products/flex-pro-pu" element={<ProtectedPage pageName="products"><FlexProPU /></ProtectedPage>} />
                <Route path="products/:productId" element={<ProtectedPage pageName="products"><ProductDetail /></ProtectedPage>} />
                <Route path="case-studies" element={<ProtectedPage pageName="projects"><CaseStudies /></ProtectedPage>} />
                <Route path="resources" element={<ProtectedPage pageName="articles"><Resources /></ProtectedPage>} />
                <Route path="media" element={<ProtectedPage pageName="articles"><Media /></ProtectedPage>} />
              </Route>
              
              {/* Admin Routes (Shared across all companies) */}
              <Route path="/admin" element={
                <AdminLanguageProvider>
                  <AdminLayout />
                </AdminLanguageProvider>
              }>
                <Route path="login" element={<AdminLogin />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<UnifiedProducts />} />
                <Route path="products/edit/:productId" element={<ProductEdit />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="category-manager" element={<CategoryManager />} />
                <Route path="unified-products" element={<UnifiedProducts />} />
                <Route path="guide-manager" element={<GuideManager />} />
                <Route path="featured-products" element={<FeaturedProductsManager />} />
                <Route path="articles" element={<AdminArticles />} />
                <Route path="media" element={<MediaManager />} />
                <Route path="website-text" element={<WebsiteTextEditor />} />
                <Route path="website-text-editor" element={<WebsiteTextEditor />} />
                <Route path="website-text-manager" element={<WebsiteTextManager />} />
                <Route path="translation-dashboard" element={<TranslationDashboard />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CompanyProvider>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App; 