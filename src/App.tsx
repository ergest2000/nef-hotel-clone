import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { DesignProvider } from "@/hooks/useDesignSettings";
import Index from "./pages/Index";
import BlogPost from "./pages/BlogPost";
import Collections from "./pages/Collections";
import ProductDetail from "./pages/ProductDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";
import SlugRouter from "./components/SlugRouter";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <DesignProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/koleksionet" element={<Collections />} />
              <Route path="/koleksionet/:slug" element={<Collections />} />
              <Route path="/koleksionet/:slug/:productId" element={<ProductDetail />} />
              {/* Blog post with nested slug */}
              <Route path="/:slug/:id" element={<BlogPost />} />
              {/* Dynamic slug-based routing for all pages */}
              <Route path="/:slug" element={<SlugRouter />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DesignProvider>
    </LanguageProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;
