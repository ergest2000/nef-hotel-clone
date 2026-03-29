import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, Upload, ChevronDown, ChevronRight } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { BlogPost } from "@/hooks/useBlogPosts";

interface AdminBlogManagerProps {
  posts: BlogPost[];
  lang: "al" | "en";
  onSave: (post: Partial<BlogPost> & { slug: string }) => void;
  onDelete: (id: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}

export const AdminBlogManager = ({ posts, lang, onSave, onDelete, onUploadImage }: AdminBlogManagerProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg tracking-wide-brand text-foreground font-light uppercase">Blog Posts</h2>
        <Button size="sm" onClick={() => { setCreating(true); setEditingId(null); }} className="text-xs tracking-brand">
          <Plus size={14} className="mr-1" /> Postim i ri
        </Button>
      </div>

      {creating && (
        <BlogPostForm
          lang={lang}
          onSave={(post) => { onSave(post); setCreating(false); }}
          onCancel={() => setCreating(false)}
          onUploadImage={onUploadImage}
        />
      )}

      <div className="space-y-2">
        {posts.map((post) => (
          <div key={post.id} className="border border-border bg-background rounded-md">
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => setEditingId(editingId === post.id ? null : post.id)} className="flex-1 flex items-center gap-2 text-left">
                {editingId === post.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="text-xs text-foreground font-medium">
                  {post.title_al || post.title_en}
                </span>
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-2 py-0.5 rounded ${post.published ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                  {post.published ? "Publikuar" : "Draft"}
                </span>
                <Button variant="ghost" size="sm" onClick={() => onDelete(post.id)} className="text-destructive hover:text-destructive h-8 w-8 p-0">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            {editingId === post.id && (
              <div className="border-t border-border px-4 py-4">
                <BlogPostForm
                  post={post}
                  lang={lang}
                  onSave={(updated) => { onSave(updated); setEditingId(null); }}
                  onCancel={() => setEditingId(null)}
                  onUploadImage={onUploadImage}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BlogPostForm = ({
  post,
  lang,
  onSave,
  onCancel,
  onUploadImage,
}: {
  post?: BlogPost;
  lang: "al" | "en";
  onSave: (post: Partial<BlogPost> & { slug: string }) => void;
  onCancel: () => void;
  onUploadImage: (file: File) => Promise<string>;
}) => {
  const [form, setForm] = useState({
    slug: post?.slug || "",
    title_al: post?.title_al || "",
    title_en: post?.title_en || "",
    excerpt_al: post?.excerpt_al || "",
    excerpt_en: post?.excerpt_en || "",
    content_al: post?.content_al || "",
    content_en: post?.content_en || "",
    image: post?.image || "",
    author: post?.author || "EGJEU Team",
    published: post?.published ?? false,
    sort_order: post?.sort_order ?? 0,
  });
  const [uploading, setUploading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      update("image", url);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    let finalSlug = form.slug;
    if (!finalSlug || !post?.id) {
      // Generate from Albanian title for new posts or empty slug
      let base = form.title_al.toLowerCase()
        .replace(/ë/g, "e").replace(/ç/g, "c").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ä/g, "a")
        .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (!base) base = "post";
      finalSlug = base + "-" + Date.now().toString(36).slice(-5);
    }
    onSave({ ...form, slug: finalSlug, ...(post?.id ? { id: post.id } : {}) });
  };

  return (
    <div className="space-y-4 bg-background border border-border rounded-md p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] tracking-brand text-muted-foreground uppercase">Slug (URL)</label>
          <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} className="text-xs h-9" placeholder="url-slug" />
          {post?.slug && form.slug !== post.slug && (
            <p className="text-[9px] text-amber-600">⚠ Ndryshimi i slug do ndryshojë URL-në e postimit</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] tracking-brand text-muted-foreground uppercase">Autori</label>
          <Input value={form.author} onChange={(e) => update("author", e.target.value)} className="text-xs h-9" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] tracking-brand text-muted-foreground uppercase">Titulli (AL)</label>
          <Input value={form.title_al} onChange={(e) => update("title_al", e.target.value)} className="text-xs h-9" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] tracking-brand text-muted-foreground uppercase">Titulli (EN)</label>
          <Input value={form.title_en} onChange={(e) => update("title_en", e.target.value)} className="text-xs h-9" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] tracking-brand text-muted-foreground uppercase">Përshkrimi (AL)</label>
          <Input value={form.excerpt_al} onChange={(e) => update("excerpt_al", e.target.value)} className="text-xs h-9" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] tracking-brand text-muted-foreground uppercase">Përshkrimi (EN)</label>
          <Input value={form.excerpt_en} onChange={(e) => update("excerpt_en", e.target.value)} className="text-xs h-9" />
        </div>
      </div>

      {/* Rich Text Content AL + EN side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] tracking-brand text-muted-foreground uppercase">Përmbajtja (AL)</label>
          <RichTextEditor
            content={form.content_al}
            onChange={(html) => update("content_al", html)}
            onUploadImage={onUploadImage}
            placeholder="Shkruani artikullin në Shqip..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] tracking-brand text-muted-foreground uppercase">Përmbajtja (EN)</label>
          <RichTextEditor
            content={form.content_en}
            onChange={(html) => update("content_en", html)}
            onUploadImage={onUploadImage}
            placeholder="Write article in English..."
          />
        </div>
      </div>

      {/* Image */}
      <div className="space-y-1">
        <label className="text-[10px] tracking-brand text-muted-foreground uppercase">Imazhi kryesor</label>
        <div className="flex items-center gap-3">
          {form.image && !form.image.startsWith("/src/") && (
            <img src={form.image} alt="" className="w-20 h-14 object-cover border border-border rounded" />
          )}
          <Input value={form.image} onChange={(e) => update("image", e.target.value)} className="text-xs h-9 flex-1" placeholder="URL e imazhit" />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
          <Button variant="outline" size="sm" className="h-9" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload size={14} />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Switch checked={form.published} onCheckedChange={(v) => update("published", v)} />
          <span className="text-xs text-muted-foreground">{form.published ? "Publikuar" : "Draft"}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">Anulo</Button>
          <Button size="sm" onClick={handleSubmit} className="text-xs">
            <Save size={14} className="mr-1" /> Ruaj
          </Button>
        </div>
      </div>
    </div>
  );
};
