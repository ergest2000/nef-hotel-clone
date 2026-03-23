import { useState, useRef } from "react";
import { useAllGalleryImages, useUpsertGalleryImage, useDeleteGalleryImage } from "@/hooks/useGalleryImages";
import { uploadCmsImage } from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Upload, Eye, EyeOff } from "lucide-react";

export const AdminGalleryManager = () => {
  const { data: images, isLoading } = useAllGalleryImages("tailor-made");
  const upsert = useUpsertGalleryImage();
  const remove = useDeleteGalleryImage();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    try {
      const path = `gallery/${Date.now()}-${file.name}`;
      const url = await uploadCmsImage(file, path);
      upsert.mutate(
        { gallery_key: "tailor-made", image_url: url, alt_text: file.name, sort_order: (images?.length ?? 0) },
        { onSuccess: () => toast({ title: "Imazhi u shtua!" }) }
      );
    } catch (e: any) {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Duke ngarkuar...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Galeria - Tekstile të Personalizuara</h2>
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          <Button size="sm" onClick={() => fileRef.current?.click()}>
            <Plus size={14} className="mr-1" /> Shto Imazh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images?.map((img) => (
          <div key={img.id} className="border border-border rounded overflow-hidden group relative">
            <img src={img.image_url} alt={img.alt_text} className="w-full aspect-[4/3] object-cover" />
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7"
                onClick={() => upsert.mutate(
                  { id: img.id, gallery_key: "tailor-made", visible: !img.visible },
                  { onSuccess: () => toast({ title: img.visible ? "U fsheh!" : "U aktivizua!" }) }
                )}
              >
                {img.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-7 w-7"
                onClick={() => remove.mutate(img.id, { onSuccess: () => toast({ title: "U fshi!" }) })}
              >
                <Trash2 size={12} />
              </Button>
            </div>
            {!img.visible && <div className="absolute inset-0 bg-background/60" />}
          </div>
        ))}
      </div>

      {(!images || images.length === 0) && (
        <p className="text-sm text-muted-foreground text-center py-8">Nuk ka imazhe. Shtoni imazhe për galerinë.</p>
      )}
    </div>
  );
};
