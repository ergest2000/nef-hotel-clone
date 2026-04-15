import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

const convertToWebP = (url: string): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Conversion failed"))),
        "image/webp",
        0.85
      );
    };
    img.onerror = () => reject(new Error("Image load failed: " + url));
    img.src = url;
  });

const extractStoragePath = (url: string): string | null => {
  const match = url.match(/cms-images\/(.+)$/);
  return match ? match[1] : null;
};

type ResultItem = { table: string; url: string; status: "ok" | "skip" | "error"; msg?: string };

export const AdminWebpConverter = () => {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [done, setDone] = useState(false);

  const processUrl = async (
    table: string,
    id: string,
    field: string,
    url: string
  ): Promise<ResultItem> => {
    if (!url || url.includes(".webp")) {
      return { table, url, status: "skip" };
    }

    const storagePath = extractStoragePath(url);
    if (!storagePath) return { table, url, status: "skip" };

    try {
      const blob = await convertToWebP(url);
      const webpPath = storagePath.replace(/\.[^.]+$/, "") + ".webp";
      const file = new File([blob], webpPath.split("/").pop()!, { type: "image/webp" });

      const { error: uploadError } = await supabase.storage
        .from("cms-images")
        .upload(webpPath, file, { upsert: true, contentType: "image/webp" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("cms-images").getPublicUrl(webpPath);
      const newUrl = urlData.publicUrl;

      const { error: updateError } = await (supabase.from(table as any) as any)
        .update({ [field]: newUrl })
        .eq("id", id);

      if (updateError) throw updateError;

      return { table, url, status: "ok" };
    } catch (e: any) {
      return { table, url, status: "error", msg: e.message };
    }
  };

  const run = async () => {
    setRunning(true);
    setResults([]);
    setDone(false);
    const all: ResultItem[] = [];

    // products
    setProgress("Duke lexuar produktet...");
    const { data: products } = await supabase.from("products").select("id, image_url");
    for (const row of products || []) {
      if (row.image_url) {
        setProgress(`Produktet: ${row.id}`);
        all.push(await processUrl("products", row.id, "image_url", row.image_url));
      }
    }

    // product_images
    setProgress("Duke lexuar imazhet e produkteve...");
    const { data: pImages } = await supabase.from("product_images").select("id, image_url");
    for (const row of pImages || []) {
      if (row.image_url) {
        setProgress(`Product images: ${row.id}`);
        all.push(await processUrl("product_images", row.id, "image_url", row.image_url));
      }
    }

    // product_colors
    setProgress("Duke lexuar ngjyrat...");
    const { data: colors } = await supabase.from("product_colors").select("id, image_url");
    for (const row of colors || []) {
      if (row.image_url) {
        setProgress(`Ngjyrat: ${row.id}`);
        all.push(await processUrl("product_colors", row.id, "image_url", row.image_url));
      }
    }

    // collections
    setProgress("Duke lexuar koleksionet...");
    const { data: collections } = await supabase.from("collections").select("id, image_url");
    for (const row of collections || []) {
      if (row.image_url) {
        setProgress(`Koleksionet: ${row.id}`);
        all.push(await processUrl("collections", row.id, "image_url", row.image_url));
      }
    }

    // gallery_images
    setProgress("Duke lexuar galerinë...");
    const { data: gallery } = await supabase.from("gallery_images").select("id, image_url");
    for (const row of gallery || []) {
      if (row.image_url) {
        setProgress(`Galeria: ${row.id}`);
        all.push(await processUrl("gallery_images", row.id, "image_url", row.image_url));
      }
    }

    // homepage_categories
    setProgress("Duke lexuar kategoritë...");
    const { data: cats } = await supabase.from("homepage_categories").select("id, image_url");
    for (const row of cats || []) {
      if (row.image_url) {
        setProgress(`Kategoritë: ${row.id}`);
        all.push(await processUrl("homepage_categories", row.id, "image_url", row.image_url));
      }
    }

    setResults(all);
    setDone(true);
    setRunning(false);
    setProgress("");

    const ok = all.filter((r) => r.status === "ok").length;
    const errors = all.filter((r) => r.status === "error").length;
    toast({
      title: "U krye!",
      description: `${ok} imazhe u konvertuan. ${errors} gabime.`,
    });
  };

  const ok = results.filter((r) => r.status === "ok").length;
  const errors = results.filter((r) => r.status === "error").length;
  const skipped = results.filter((r) => r.status === "skip").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Konverto Imazhet në WebP</h2>
        <p className="text-sm text-muted-foreground">
          Konverton të gjitha imazhet ekzistuese (PNG, JPG, etj.) në WebP për performancë më të mirë.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-800">
        ⚠️ Ky proces nuk mund të kthehet mbrapsht. Imazhet e vjetra do të zëvendësohen me WebP. Bëj backup nëse është e nevojshme.
      </div>

      <Button
        onClick={run}
        disabled={running}
        className="gap-2"
        style={{ backgroundColor: "#163058" }}
      >
        <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />
        {running ? "Duke konvertuar..." : "Fillo Konvertimin"}
      </Button>

      {running && progress && (
        <p className="text-sm text-muted-foreground">{progress}</p>
      )}

      {done && (
        <div className="space-y-3">
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 font-medium">✓ {ok} konvertuar</span>
            <span className="text-muted-foreground">⟳ {skipped} kaluar (tashmë WebP)</span>
            {errors > 0 && <span className="text-red-600 font-medium">✗ {errors} gabime</span>}
          </div>

          {errors > 0 && (
            <div className="border border-red-200 rounded p-3 space-y-1 max-h-48 overflow-y-auto">
              {results.filter((r) => r.status === "error").map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{r.table}: {r.msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
