import { useState, useRef } from "react";
import { useAllGalleryImages, useUpsertGalleryImage, useDeleteGalleryImage } from "@/hooks/useGalleryImages";
import { uploadCmsImage } from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Eye, EyeOff, Edit2, Check, X } from "lucide-react";

interface GalleryManagerProps {
  galleryKey?: string;
  title?: string;
}

export function AdminGalleryManager({ galleryKey = "tailor-made", title }: GalleryManagerProps = {}) {
  var displayTitle = title || (galleryKey === "tailor-made" ? "Galeria - Tekstile të Personalizuara" : "Foto Carousel");
  var imagesData = useAllGalleryImages(galleryKey);
  var images = imagesData.data;
  var isLoading = imagesData.isLoading;
  var upsert = useUpsertGalleryImage();
  var remove = useDeleteGalleryImage();
  var toastHook = useToast();
  var toast = toastHook.toast;
  var fileRef = useRef<HTMLInputElement>(null);
  var editingState = useState<string | null>(null);
  var editingId = editingState[0];
  var setEditingId = editingState[1];
  var editTextState = useState("");
  var editText = editTextState[0];
  var setEditText = editTextState[1];
  var deleteIdState = useState<string | null>(null);
  var deleteId = deleteIdState[0];
  var setDeleteId = deleteIdState[1];

  async function handleUpload(file: File) {
    try {
      var path = "gallery/" + galleryKey + "/" + Date.now() + "-" + file.name;
      var url = await uploadCmsImage(file, path);
      upsert.mutate(
        { gallery_key: galleryKey, image_url: url, alt_text: file.name.replace(/\.[^.]+$/, ""), sort_order: (images ? images.length : 0), visible: true },
        { onSuccess: function () { toast({ title: "Imazhi u shtua!" }); } }
      );
    } catch (e: any) {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    }
  }

  function startEdit(id: string, currentText: string) {
    setEditingId(id);
    setEditText(currentText);
  }

  function saveEdit(id: string) {
    upsert.mutate(
      { id: id, gallery_key: galleryKey, alt_text: editText },
      { onSuccess: function () { toast({ title: "U ruajt!" }); setEditingId(null); } }
    );
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-sm font-semibold text-foreground mb-2">Jeni i sigurt?</h3>
            <p className="text-xs text-muted-foreground mb-4">Imazhi do fshihet përgjithmonë.</p>
            <div className="flex gap-3">
              <button onClick={function () { setDeleteId(null); }} className="flex-1 px-4 py-2 text-xs border border-border rounded hover:bg-muted transition-colors">Anulo</button>
              <button onClick={function () { remove.mutate(deleteId, { onSuccess: function () { toast({ title: "U fshi!" }); setDeleteId(null); } }); }} className="flex-1 px-4 py-2 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors">Fshi</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{displayTitle}</h2>
          <p className="text-xs text-muted-foreground mt-1">{images ? images.length : 0} imazhe (max 10)</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={function (e: any) { var f = e.target.files ? e.target.files[0] : null; if (f) handleUpload(f); }} />
          <Button size="sm" onClick={function () { if (fileRef.current) fileRef.current.click(); }} disabled={images ? images.length >= 10 : false}>
            <Plus size={14} className="mr-1" /> Shto Imazh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images && images.map(function (img) {
          return (
            <div key={img.id} className="border border-border rounded overflow-hidden group relative">
              <img src={img.image_url} alt={img.alt_text} className="w-full aspect-[4/3] object-cover" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="icon" className="h-7 w-7" onClick={function () { upsert.mutate({ id: img.id, gallery_key: galleryKey, visible: !img.visible }, { onSuccess: function () { toast({ title: img.visible ? "U fsheh!" : "U aktivizua!" }); } }); }}>
                  {img.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </Button>
                <Button variant="secondary" size="icon" className="h-7 w-7" onClick={function () { startEdit(img.id, img.alt_text); }}>
                  <Edit2 size={12} />
                </Button>
                <Button variant="destructive" size="icon" className="h-7 w-7" onClick={function () { setDeleteId(img.id); }}>
                  <Trash2 size={12} />
                </Button>
              </div>
              {!img.visible && <div className="absolute inset-0 bg-background/60 pointer-events-none" />}
              <div className="p-2 bg-background">
                {editingId === img.id ? (
                  <div className="flex gap-1">
                    <Input value={editText} onChange={function (e: any) { setEditText(e.target.value); }} className="h-7 text-xs" />
                    <Button size="icon" className="h-7 w-7 shrink-0" onClick={function () { saveEdit(img.id); }}><Check size={12} /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={function () { setEditingId(null); }}><X size={12} /></Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground truncate">{img.alt_text || "Pa përshkrim"}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(!images || images.length === 0) && (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Nuk ka imazhe.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Shtoni imazhe për galerinë (max 10).</p>
        </div>
      )}
    </div>
  );
}
