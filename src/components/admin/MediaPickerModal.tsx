import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FolderOpen, Search, RefreshCw, Check, X, Image as ImageIcon } from "lucide-react";

const MEDIA_BUCKET = "cms-images";
const MEDIA_FOLDERS = ["products", "collections", "categories", "gallery", "home", "logos"];

type PickedFile = { name: string; url: string };

export const MediaPickerModal = ({
  open, onClose, onSelect, defaultFolder = "products",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  defaultFolder?: string;
}) => {
  const [folder, setFolder] = useState(defaultFolder);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  // Cache për folder-at e ngarkuar më parë
  const cacheRef = useRef<Record<string, PickedFile[]>>({});

  // Rivendos defaultFolder kur modal-i hapet
  useEffect(() => { if (open) setFolder(defaultFolder); }, [open, defaultFolder]);

  const loadFolder = async (f: string, force = false) => {
    setPicked(new Set());

    // Serve nga cache nëse ekziston
    if (!force && cacheRef.current[f]) {
      setFiles(cacheRef.current[f]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFiles([]);

    try {
      const { data } = await supabase.storage.from(MEDIA_BUCKET).list(f, { limit: 500 });
      if (!data) { setFiles([]); setLoading(false); return; }

      // Ndaj file-at nga nënfolderët
      const topFiles: PickedFile[] = [];
      const subFolders: string[] = [];
      for (const item of data) {
        if (!item.id) {
          subFolders.push(item.name);
        } else {
          const path = `${f}/${item.name}`;
          const { data: u } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
          topFiles.push({ name: item.name, url: u.publicUrl });
        }
      }

      // Nëse ka nënfolderë, bëj kërkesat në paralel pastaj setoj njëherësh
      if (subFolders.length > 0) {
        const subResults = await Promise.all(
          subFolders.map((sf) =>
            supabase.storage.from(MEDIA_BUCKET).list(`${f}/${sf}`, { limit: 200 })
              .then(({ data: sub }) =>
                (sub || []).filter((i) => i.id).map((subItem) => {
                  const path = `${f}/${sf}/${subItem.name}`;
                  const { data: u } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
                  return { name: subItem.name, url: u.publicUrl } as PickedFile;
                })
              )
              .catch(() => [] as PickedFile[])
          )
        );

        const allFiles = [...topFiles, ...subResults.flat()];
        setFiles(allFiles);
        cacheRef.current[f] = allFiles;
      } else {
        setFiles(topFiles);
        cacheRef.current[f] = topFiles;
      }
    } catch (e) {
      console.error("Error loading folder:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (open) loadFolder(folder); }, [open, folder]);

  const filtered = files.filter((f) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    // Kërkim i dekoduar që të gjejë edhe foto me hapësira/simbole të enkoduara në URL
    const haystack = (f.name + " " + decodeURIComponent(f.url)).toLowerCase();
    return haystack.includes(q);
  });

  const togglePick = (file: PickedFile) => {
    setPicked((prev) => { const n = new Set(prev); n.has(file.url) ? n.delete(file.url) : n.add(file.url); return n; });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden"
        style={{ maxWidth: "min(1100px, 95vw)", width: "95vw", height: "90vh", display: "grid", gridTemplateRows: "auto 1fr" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Zgjidh nga Media</h3>
          <div className="flex items-center gap-2 mr-8">
            {picked.size > 0 && (
              <Button
                className="gap-1.5"
                onClick={() => { onSelect(Array.from(picked)); setPicked(new Set()); onClose(); }}
              >
                <Check className="h-4 w-4" /> Shto {picked.size} foto
              </Button>
            )}
          </div>
        </div>

        {/* Body: sidebar + main */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* Sidebar folders */}
          <div className="border-r border-border bg-muted/20 overflow-y-auto py-2">
            {MEDIA_FOLDERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => { setFolder(f); setSearch(""); }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
                  folder === f ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"
                }`}
              >
                <FolderOpen className="h-4 w-4 shrink-0" />
                <span className="truncate capitalize">{f}</span>
              </button>
            ))}
          </div>

          {/* Main area: toolbar + grid */}
          <div
            style={{
              display: "grid",
              gridTemplateRows: "auto 1fr",
              minHeight: 0,
              minWidth: 0,
            }}
          >
            {/* Toolbar */}
            <div className="flex items-center gap-3 p-3 border-b border-border bg-background">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Kërko imazhe..."
                  className="w-full pl-9 pr-3 h-9 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {search && (
                  <button type="button" onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{filtered.length} foto</span>
              <button type="button" onClick={() => loadFolder(folder, true)} className="p-1.5 hover:bg-muted rounded-lg transition-colors" title="Rifresko">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Image grid */}
            <div className="overflow-y-auto p-4" style={{ minHeight: 0 }}>
              {loading ? (
                <div className="flex items-center justify-center h-48 gap-3 flex-col">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Duke ngarkuar...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                  <ImageIcon className="h-10 w-10 opacity-20" />
                  <p className="text-sm">Nuk ka imazhe</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {filtered.map((file) => {
                    const isPicked = picked.has(file.url);
                    return (
                      <button
                        key={file.url}
                        type="button"
                        onClick={() => togglePick(file)}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer focus:outline-none ${
                          isPicked
                            ? "ring-2 ring-primary"
                            : "ring-1 ring-transparent hover:ring-border"
                        }`}
                      >
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover bg-muted pointer-events-none" loading="lazy" />
                        {isPicked && (
                          <div className="absolute inset-0 bg-primary/15 pointer-events-none">
                            <div className="absolute top-2 right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
