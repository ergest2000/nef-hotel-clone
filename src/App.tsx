import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { DesignProvider } from "@/hooks/useDesignSettings";
import { CartProvider } from "@/hooks/useCart";
import ScrollToTop from "./components/ScrollToTop";

// Eager — faqja kryesore
import Index from "./pages/Index";

// Lazy — faqet e tjera
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Collections = lazy(() => import("./pages/Collections"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const MyAccount = lazy(() => import("./pages/MyAccount"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SlugRouter = lazy(() => import("./components/SlugRouter"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minuta — nuk refetch pa nevojë
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,    // nuk refetch kur kthehesh në tab
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <DesignProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Suspense fallback={null}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/koleksionet" element={<Collections />} />
                    <Route path="/koleksionet/:slug" element={<Collections />} />
                    <Route path="/koleksionet/:slug/:productSlug" element={<ProductDetail />} />
                    <Route path="/shporta" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/my-account" element={<MyAccount />} />
                    <Route path="/blog/:postSlug" element={<BlogPost />} />
                    <Route path="/:slug" element={<SlugRouter />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </DesignProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
