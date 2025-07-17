import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import HomeTest from "./pages/Home-test";
import About from "./pages/About";
import Products from "./pages/Products";
import Projects from "./pages/Projects";
import Articles from "./pages/Articles";
import ExplodedView from "./pages/ExplodedView";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import FlexProPU from "./pages/products/FlexProPU";
import ProductDetail from "./pages/ProductDetail";
import CaseStudies from "./pages/CaseStudies";
import Resources from "./pages/Resources";
import IndustryNews from "./pages/IndustryNews";
import Media from "./pages/Media";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductEditor from "./pages/admin/ProductEditor";
import AdminProducts from "./pages/admin/Products";
import AdminProjects from "./pages/admin/Projects";
import FilterManager from "./pages/admin/FilterManager";
import AdminArticles from "./pages/admin/Articles";
import MediaManager from "./pages/admin/MediaManager";
import FeaturedProductsManager from "./pages/admin/FeaturedProductsManager";
import UnifiedProducts from "./pages/admin/UnifiedProducts";
import Chatbot from "./components/Chatbot";
import WebsiteTextEditor from './pages/admin/WebsiteTextEditor';
import ProtectedPage from './components/ProtectedPage';
import WebsiteTextManager from './pages/admin/WebsiteTextManager';

const queryClient = new QueryClient();

// Component to conditionally render Chatbot
const ConditionalChatbot = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  
  return !isAdmin ? <Chatbot /> : null;
};

// Get basename for GitHub Pages
const basename = import.meta.env.PROD ? '/aftek-website' : '';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={basename}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<ProtectedPage pageName="home"><Home /></ProtectedPage>} />
              <Route path="test" element={<ProtectedPage pageName="home"><HomeTest /></ProtectedPage>} />
              <Route path="about" element={<ProtectedPage pageName="about"><About /></ProtectedPage>} />
              <Route path="products" element={<ProtectedPage pageName="products"><Products /></ProtectedPage>} />
              <Route path="projects" element={<ProtectedPage pageName="projects"><Projects /></ProtectedPage>} />
              <Route path="articles" element={<ProtectedPage pageName="articles"><Articles /></ProtectedPage>} />
              <Route path="articles/:category" element={<ProtectedPage pageName="articles"><Articles /></ProtectedPage>} />
              <Route path="exploded-view" element={<ProtectedPage pageName="home"><ExplodedView /></ProtectedPage>} />
              <Route path="contact" element={<ProtectedPage pageName="contact"><Contact /></ProtectedPage>} />
              <Route path="products/flex-pro-pu" element={<ProtectedPage pageName="products"><FlexProPU /></ProtectedPage>} />
              <Route path="products/:productId" element={<ProtectedPage pageName="products"><ProductDetail /></ProtectedPage>} />
              <Route path="case-studies" element={<ProtectedPage pageName="projects"><CaseStudies /></ProtectedPage>} />
              <Route path="resources" element={<ProtectedPage pageName="articles"><Resources /></ProtectedPage>} />
              <Route path="industry-news" element={<ProtectedPage pageName="articles"><IndustryNews /></ProtectedPage>} />
              <Route path="media" element={<ProtectedPage pageName="articles"><Media /></ProtectedPage>} />
            </Route>
            
            {/* Admin Routes - Temporarily unprotected for testing */}
            <Route path="/admin" element={<Layout />}>
              <Route path="login" element={<AdminLogin />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<UnifiedProducts />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="filter-manager" element={<FilterManager />} />
              <Route path="unified-products" element={<UnifiedProducts />} />
              <Route path="featured-products" element={<FeaturedProductsManager />} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="media" element={<MediaManager />} />
              <Route path="website-text" element={<WebsiteTextEditor />} />
              <Route path="website-text-manager" element={<WebsiteTextManager />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ConditionalChatbot />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
