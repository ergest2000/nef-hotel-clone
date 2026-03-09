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
import { AdminRegistrations } from "@/components/admin/AdminRegistrations";
import { AdminFormBuilder } from "@/components/admin/AdminFormBuilder";
import { AdminSlugManager } from "@/components/admin/AdminSlugManager";
import { AdminDesignSettings } from "@/components/admin/AdminDesignSettings";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  home: "Faqja Kryesore",
  company: "Company",
  clients: "Clients",
  "tailor-made": "Tailor Made",
  contact: "Contact",
  blog: "Blog",
  "blog-posts": "Blog Posts",
  media: "Media",
  menus: "Menu Management",
  "clients-logos": "Clients Logos",
  "certifications-logos": "Certifications Logos",
  registrations: "Registrations",
  "registration-form": "Registration Form",
  slugs: "URL Slugs",
  design: "Design Settings",
  settings: "Settings",
};

const cmsPages = ["home", "company", "clients", "tailor-made", "contact", "blog"];

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [lang, setLang] = useState<"al" | "en">("al");
  const [activePage, setActivePage] = useState("dashboard");

  const { data: content, isLoading: loadingContent } = useAllContent();
  const { data: sections, isLoading: loadingSections } = useAllSections();
  const { data: blogPosts, isLoading: loadingBlog } = useBlogPosts();
  const upsertContent = useUpsertContent();
  const updateOrder = useUpdateSectionOrder();
  const toggleVisibility = useToggleSectionVisibility();
  const upsertBlogPost = useUpsertBlogPost();
  const deleteBlogPost = useDeleteBlogPost();

  const translateText = useCallback(async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    if (!text.trim() || sourceLang === targetLang) return text;
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sourceLang, targetLang }),
      });
      if (!response.ok) throw new Error("Translation failed");
      const data = await response.json();
      return data.translated || text;
    } catch (e) {
      console.error("Translation error:", e);
      return "";
    }
  }, []);

  const handleSaveField = useCallback(
    async (item: SiteContent, newValue: string) => {
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
          onSuccess: async () => {
            toast({ title: "U ruajt!", description: `${item.field_key} u përditësua.` });
            if (item.content_type === "text" || item.content_type === "html") {
              const targetLang = item.lang === "al" ? "en" : "al";
              const translated = await translateText(newValue, item.lang, targetLang);
              if (translated) {
                upsertContent.mutate({
                  page: item.page,
                  section_key: item.section_key,
                  field_key: item.field_key,
                  lang: targetLang,
                  content_type: item.content_type,
                  value: translated,
                  sort_order: item.sort_order,
                }, {
                  onSuccess: () => toast({ title: "Përkthimi u ruajt!", description: `${item.field_key} (${targetLang.toUpperCase()})` }),
                });
              }
            }
          },
          onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
        }
      );
    },
    [upsertContent, toast, translateText]
  );

  const handleUploadImage = useCallback(
    async (item: SiteContent, file: File) => {
      try {
        const path = `${item.page}/${item.section_key}/${Date.now()}-${file.name}`;
        const url = await uploadCmsImage(file, path);
        handleSaveField(item, url);
        toast({ title: "Imazhi u ngarkua!" });
      } catch (e: any) {
        toast({ title: "Gabim", description: e.message, variant: "destructive" });
      }
    },
    [handleSaveField, toast]
  );

  const handleToggleVisibility = useCallback(
    (id: string, visible: boolean) => {
      toggleVisibility.mutate({ id, visible });
    },
    [toggleVisibility]
  );

  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !sections) return;
      const pageSections = sections.filter((s) => s.page === activePage);
      const oldIndex = pageSections.findIndex((s) => s.id === active.id);
      const newIndex = pageSections.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = [...pageSections];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      const updates = reordered.map((s, i) => ({ id: s.id, sort_order: i }));
      updateOrder.mutate(updates);
    },
    [sections, activePage, updateOrder]
  );

  const isLoading = loadingContent || loadingSections || loadingBlog;
  const pageSections = sections?.filter((s) => s.page === activePage) ?? [];
  const pageContent = content?.filter((c) => c.page === activePage) ?? [];
  const uniquePages = new Set(sections?.map((s) => s.page) ?? []);

  const renderContent = () => {
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
            totalSections={sections?.length ?? 0}
            totalContent={content?.length ?? 0}
            totalBlogPosts={blogPosts?.length ?? 0}
            totalPages={uniquePages.size}
            onNavigate={setActivePage}
          />
        );
      case "blog-posts":
        return (
          <AdminBlogManager
            posts={blogPosts ?? []}
            lang={lang}
            onSave={(post) =>
              upsertBlogPost.mutate(post, {
                onSuccess: () => toast({ title: "Postimi u ruajt!" }),
                onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
              })
            }
            onDelete={(id) =>
              deleteBlogPost.mutate(id, {
                onSuccess: () => toast({ title: "Postimi u fshi!" }),
                onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
              })
            }
            onUploadImage={async (file: File) => {
              const path = `blog/${Date.now()}-${file.name}`;
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
        return <AdminFormBuilder />;
      case "slugs":
        return <AdminSlugManager />;
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
                <p className="text-sm text-foreground mt-1">{user?.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gjuha aktive</label>
                <p className="text-sm text-foreground mt-1">{lang === "al" ? "Shqip" : "English"}</p>
              </div>
            </div>
          </div>
        );
      default:
        // CMS page editor + SEO
        const showSeo = cmsPages.includes(activePage);
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
            {showSeo && <AdminSeoEditor page={activePage} />}
          </div>
        );
    }
  };

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
          <main className="flex-1 p-6 md:p-8 bg-muted/30 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
