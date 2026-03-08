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
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [lang, setLang] = useState<"al" | "en">("al");
  const [activePage, setActivePage] = useState("home");

  const { data: content, isLoading: loadingContent } = useAllContent(lang);
  const { data: sections, isLoading: loadingSections } = useAllSections();
  const { data: blogPosts, isLoading: loadingBlog } = useBlogPosts();
  const upsertContent = useUpsertContent();
  const updateOrder = useUpdateSectionOrder();
  const toggleVisibility = useToggleSectionVisibility();
  const upsertBlogPost = useUpsertBlogPost();
  const deleteBlogPost = useDeleteBlogPost();

  const handleSaveField = useCallback(
    (item: SiteContent, newValue: string) => {
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
          onSuccess: () => toast({ title: "U ruajt!", description: `${item.field_key} u përditësua.` }),
          onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
        }
      );
    },
    [upsertContent, toast]
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-warm-gray">
        <AdminSidebar activePage={activePage} onPageChange={setActivePage} />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            user={user}
            lang={lang}
            onLangChange={setLang}
            onSignOut={signOut}
          />
          <main className="flex-1 p-6 overflow-auto">
            {isLoading ? (
              <div className="text-center py-20">
                <p className="text-sm text-muted-foreground tracking-brand">Duke ngarkuar...</p>
              </div>
            ) : activePage === "blog-posts" ? (
              <AdminBlogManager
                posts={blogPosts ?? []}
                lang={lang}
                onSave={(post) => upsertBlogPost.mutate(post, {
                  onSuccess: () => toast({ title: "Postimi u ruajt!" }),
                  onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
                })}
                onDelete={(id) => deleteBlogPost.mutate(id, {
                  onSuccess: () => toast({ title: "Postimi u fshi!" }),
                  onError: (e) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
                })}
                onUploadImage={async (file: File) => {
                  const path = `blog/${Date.now()}-${file.name}`;
                  return await uploadCmsImage(file, path);
                }}
              />
            ) : (
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
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
