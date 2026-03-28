import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  useAllContent,
  useAllSections,
  useUpsertContent,
  useUpdateSectionOrder,
  useToggleSectionVisibility,
  uploadCmsImage,
} from "@/hooks/useCms";
import { useBlogPosts, useUpsertBlogPost, useDeleteBlogPost } from "@/hooks/useBlogPosts";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminPageEditor } from "@/components/admin/AdminPageEditor";
import { AdminBlogManager } from "@/components/admin/AdminBlogManager";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDashboardOverview } from "@/components/admin/AdminDashboardOverview";
import { AdminSeoEditor } from "@/components/admin/AdminSeoEditor";
import { AdminMenuManager } from "@/components/admin/AdminMenuManager";
import { AdminLogoManager } from "@/components/admin/AdminLogoManager";
import { AdminGalleryManager } from "@/components/admin/AdminGalleryManager";
import { AdminRegistrations } from "@/components/admin/AdminRegistrations";
import { AdminFormBuilder } from "@/components/admin/AdminFormBuilder";
import { AdminSlugManager } from "@/components/admin/AdminSlugManager";
import { AdminDesignSettings } from "@/components/admin/AdminDesignSettings";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminAuthLogs } from "@/components/admin/AdminAuthLogs";
import { AdminAuthTexts } from "@/components/admin/AdminAuthTexts";
import { AdminCollectionsManager } from "@/components/admin/AdminCollectionsManager";
import { AdminProductsManager } from "@/components/admin/AdminProductsManager";
import { AdminColorsManager } from "@/components/admin/AdminColorsManager";
import { AdminSuggestedProducts } from "@/components/admin/AdminSuggestedProducts";
import { AdminHomepageCategories } from "@/components/admin/AdminHomepageCategories";
import { AdminStaticPages } from "@/components/admin/AdminStaticPages";
import { AdminNewsletter } from "@/components/admin/AdminNewsletter";
import { AdminOfferRequests } from "@/components/admin/AdminOfferRequests";
import { AdminContactSubmissions } from "@/components/admin/AdminContactSubmissions";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

var pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  home: "Faqja Kryesore",
  company: "Rreth Nesh",
  clients: "Klientët",
  "tailor-made": "Tekstile të Personalizuara",
  certifications: "Certifikimet",
  contact: "Kontakti",
  blog: "Blog",
  "blog-posts": "Blog Posts",
  media: "Media",
  menus: "Menaxhimi i Menuve",
  "clients-logos": "Logot e Klientëve",
  "certifications-logos": "Logot e Certifikimeve",
  registrations: "Regjistrimet",
  "registration-form": "Kontaktet",
  users: "Përdoruesit",
  "auth-logs": "Auth Logs",
  "auth-texts": "Tekstet e Autentikimit",
  slugs: "URL Slugs",
  collections: "Koleksionet",
  products: "Produktet",
  colors: "Ngjyrat e Produktit",
  "suggested-products": "Sugjerime Homepage",
  "homepage-categories": "Kategoritë Homepage",
  "static-pages": "Faqet Statike",
  design: "Design Settings",
  settings: "Settings",
  newsletter: "Newsletter",
  offers: "Kërkesat për Oferta",
};

var cmsPages = ["home", "company", "clients", "tailor-made", "certifications", "contact", "blog"];

function AdminDashboard() {
  var authHook = useAuth();
  var signOut = authHook.signOut;
  var user = authHook.user;
  var role = authHook.role;
  var toastHook = useToast();
  var toast = toastHook.toast;
  var langState = useState<"al" | "en">(function () {
    return (localStorage.getItem("admin_lang") as "al" | "en") || "al";
  });
  var lang = langState[0];
  var setLangRaw = langState[1];

  function setLang(l: "al" | "en") {
    localStorage.setItem("admin_lang", l);
    setLangRaw(l);
  }
  var activePageState = useState(function () {
    return localStorage.getItem("admin_active_page") || "registrations";
  });
  var activePage = activePageState[0];
  var setActivePageRaw = activePageState[1];

  function setActivePage(page: string) {
    localStorage.setItem("admin_active_page", page);
    setActivePageRaw(page);
  }

  var contentData = useAllContent();
  var content = contentData.data;
  var loadingContent = contentData.isLoading;
  var sectionsData = useAllSections();
  var sections = sectionsData.data;
  var loadingSections = sectionsData.isLoading;
  var blogData = useBlogPosts();
  var blogPosts = blogData.data;
  var loadingBlog = blogData.isLoading;
  var upsertContent = useUpsertContent();
  var updateOrder = useUpdateSectionOrder();
  var toggleVisibility = useToggleSectionVisibility();
  var upsertBlogPost = useUpsertBlogPost();
  var deleteBlogPost = useDeleteBlogPost();

  var translateText = useCallback(async function (text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text.trim() || sourceLang === targetLang) return text;
    try {
      var response = await fetch(import.meta.env.VITE_SUPABASE_URL + "/functions/v1/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text, sourceLang: sourceLang, targetLang: targetLang }),
      });
      if (!response.ok) throw new Error("Translation failed");
      var data = await response.json();
      return data.translated || text;
    } catch (e) {
      console.error("Translation error:", e);
      return "";
    }
  }, []);

  var handleSaveField = useCallback(
    async function (item: SiteContent, newValue: string) {
      upsertContent.mutate(
        {
          page: item.page,
          section_key: item.section_key,
          field_key: item.field_key,
          lang: item.lang,
          content_type: item.content_type,
          value: newValue,
          sort_order: item.sort_order,
        },
        {
          onSuccess: async function () {
            toast({ title: "U ruajt!", description: item.field_key + " u përditësua." });
            if (item.content_type === "text" || item.content_type === "html") {
              var targetLang = item.lang === "al" ? "en" : "al";
              var translated = await translateText(newValue, item.lang, targetLang);
              if (translated) {
                upsertContent.mutate(
                  {
                    page: item.page,
                    section_key: item.section_key,
                    field_key: item.field_key,
                    lang: targetLang,
                    content_type: item.content_type,
                    value: translated,
                    sort_order: item.sort_order,
                  },
                  {
                    onSuccess: function () {
                      toast({ title: "Përkthimi u ruajt!", description: item.field_key + " (" + targetLang.toUpperCase() + ")" });
                    },
                  }
                );
              }
            }
          },
          onError: function (e: any) { toast({ title: "Gabim", description: e.message, variant: "destructive" }); },
        }
      );
    },
    [upsertContent, toast, translateText]
  );

  var handleUploadImage = useCallback(
    async function (item: SiteContent, file: File) {
      try {
        var path = item.page + "/" + item.section_key + "/" + Date.now() + "-" + file.name;
        var url = await uploadCmsImage(file, path);
        handleSaveField(item, url);
        toast({ title: "Imazhi u ngarkua!" });
      } catch (e: any) {
        toast({ title: "Gabim", description: e.message, variant: "destructive" });
      }
    },
    [handleSaveField, toast]
  );

  var handleToggleVisibility = useCallback(
    function (id: string, visible: boolean) {
      toggleVisibility.mutate({ id: id, visible: visible });
    },
    [toggleVisibility]
  );

  var handleDragEnd = useCallback(
    function (event: any) {
      var active = event.active;
      var over = event.over;
      if (!over || active.id === over.id || !sections) return;
      var pageSections = sections.filter(function (s) { return s.page === activePage; });
      var oldIndex = pageSections.findIndex(function (s) { return s.id === active.id; });
      var newIndex = pageSections.findIndex(function (s) { return s.id === over.id; });
      if (oldIndex === -1 || newIndex === -1) return;
      var reordered = pageSections.slice();
      var moved = reordered.splice(oldIndex, 1)[0];
      reordered.splice(newIndex, 0, moved);
      var updates = reordered.map(function (s, i) { return { id: s.id, sort_order: i }; });
      updateOrder.mutate(updates);
    },
    [sections, activePage, updateOrder]
  );

  var isLoading = loadingContent || loadingSections || loadingBlog;
  var pageSections = sections ? sections.filter(function (s) { return s.page === activePage; }) : [];
  var pageContent = content ? content.filter(function (c) { return c.page === activePage; }) : [];
  var uniquePages = new Set(sections ? sections.map(function (s) { return s.page; }) : []);

  function renderContent() {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Duke ngarkuar...</p>
          </div>
        </div>
      );
    }

    switch (activePage) {
      case "dashboard":
        return (
          <AdminDashboardOverview
            totalSections={sections ? sections.length : 0}
            totalContent={content ? content.length : 0}
            totalBlogPosts={blogPosts ? blogPosts.length : 0}
            totalPages={uniquePages.size}
            onNavigate={setActivePage}
          />
        );
      case "blog-posts":
        return (
          <AdminBlogManager
            posts={blogPosts || []}
            lang={lang}
            onSave={function (post: any) {
              upsertBlogPost.mutate(post, {
                onSuccess: function () { toast({ title: "Postimi u ruajt!" }); },
                onError: function (e: any) { toast({ title: "Gabim", description: e.message, variant: "destructive" }); },
              });
            }}
            onDelete={function (id: string) {
              deleteBlogPost.mutate(id, {
                onSuccess: function () { toast({ title: "Postimi u fshi!" }); },
                onError: function (e: any) { toast({ title: "Gabim", description: e.message, variant: "destructive" }); },
              });
            }}
            onUploadImage={async function (file: File) {
              var path = "blog/" + Date.now() + "-" + file.name;
              return await uploadCmsImage(file, path);
            }}
          />
        );
      case "menus":
        return <AdminMenuManager />;
      case "clients-logos":
        return <AdminLogoManager category="clients" title="Clients Logos" />;
      case "certifications-logos":
        return <AdminLogoManager category="certifications" title="Certifications Logos" />;
      case "registrations":
        return <AdminRegistrations />;
      case "registration-form":
        if (role === "manager") {
          return <AdminContactSubmissions />;
        }
        return <AdminFormBuilder />;
      case "users":
        return <AdminUsers />;
      case "auth-logs":
        return <AdminAuthLogs />;
      case "auth-texts":
        return <AdminAuthTexts />;
      case "slugs":
        return <AdminSlugManager />;
      case "collections":
        return <AdminCollectionsManager />;
      case "products":
        return <AdminProductsManager />;
      case "colors":
        return <AdminColorsManager />;
      case "suggested-products":
        return <AdminSuggestedProducts />;
      case "homepage-categories":
        return <AdminHomepageCategories />;
      case "static-pages":
        return <AdminStaticPages />;
      case "design":
        return <AdminDesignSettings />;
      case "newsletter":
        return <AdminNewsletter />;
      case "offers":
        return <AdminOfferRequests />;
      case "media":
        return (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Media Library</h2>
            <div className="mt-6 border-2 border-dashed border-border rounded-lg p-12 text-center">
              <p className="text-sm text-muted-foreground">Media library do të shtohet së shpejti.</p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Settings</h2>
            <div className="bg-background border border-border rounded-lg p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email i administratorit</label>
                <p className="text-sm text-foreground mt-1">{user ? user.email : ""}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gjuha aktive</label>
                <p className="text-sm text-foreground mt-1">{lang === "al" ? "Shqip" : "English"}</p>
              </div>
            </div>
          </div>
        );
      default:
        var showSeo = cmsPages.includes(activePage);
        return (
          <div className="space-y-6">
            <AdminPageEditor
              page={activePage}
              sections={pageSections}
              content={pageContent}
              lang={lang}
              onSaveField={handleSaveField}
              onUploadImage={handleUploadImage}
              onToggleVisibility={handleToggleVisibility}
              onDragEnd={handleDragEnd}
            />
            {activePage === "company" && (
              <>
                <AdminGalleryManager galleryKey="company" title="Foto Carousel (Rreth Nesh)" />
                <AdminLogoManager category="clients" title="Brandet Tona" />
                <AdminLogoManager category="certifications" title="Certifikimet" />
              </>
            )}
            {showSeo && <AdminSeoEditor page={activePage} />}
          </div>
        );
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar activePage={activePage} onPageChange={setActivePage} />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            user={user}
            lang={lang}
            onLangChange={setLang}
            onSignOut={signOut}
            pageTitle={pageTitles[activePage] || activePage}
          />
          <main className="flex-1 p-6 md:p-8 bg-muted/30 overflow-auto">{renderContent()}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AdminDashboard;
