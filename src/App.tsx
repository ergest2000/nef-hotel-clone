import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { DesignProvider } from "@/hooks/useDesignSettings";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import BlogPost from "./pages/BlogPost";
import Collections from "./pages/Collections";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import MyAccount from "./pages/MyAccount";
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
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  {/* ── Faqja kryesore ── */}
                  <Route path="/" element={<Index />} />

                  {/* ── Admin ── */}
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* ── Koleksionet — EKSPLICITE, para /:slug/:id ── */}
                  <Route path="/koleksionet" element={<Collections />} />
                  <Route path="/koleksionet/:slug" element={<Collections />} />
                  <Route path="/koleksionet/:slug/:productId" element={<ProductDetail />} />

                  {/* ── Faqe të tjera eksplicite ── */}
                  <Route path="/shporta" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/my-account" element={<MyAccount />} />

                  {/* ── Blog post — EKSPLICITE me /blog/ prefix ──
                      Kjo route duhet të jetë PARA /:slug/:id
                      që të mos kapet nga slug i gabuar            */}
                  <Route path="/blog/:id" element={<BlogPost />} />

                  {/* ── Routing dinamik me slug nga DB ──
                      /:slug/:id kap VETËM blog posts me slug të ndryshëm nga /blog
                      (p.sh. nëse slug i blogut ndryshohet në shqip nga admin) */}
                  <Route path="/:slug/:id" element={<BlogPost />} />

                  {/* ── Faqe dinamike me slug nga DB (company, clients, etj.) ── */}
                  <Route path="/:slug" element={<SlugRouter />} />

                  {/* ── 404 ── */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </DesignProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
