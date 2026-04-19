import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadCmsImage } from "@/hooks/useCms";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy, Trash2, Upload, Search, FolderOpen, Image as ImageIcon,
  Check, RefreshCw, X
} from "lucide-react";

type MediaFile = {
  name: string;
  path: string;
  url: string;
  size?: number;
  updated_at?: string;
};

const BUCKET = "cms-images";
const FOLDERS = ["products", "collections", "categories", "gallery", "home", "logos", "blog", "company", "certifications", "tailor-made"];

export const AdminMediaLibrary = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFolder, setActiveFolder] = useState("products");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadFiles = useCallback(async (folder: string) => {
    setLoading(true);
    setFiles([]);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(folder, { limit: 500, sortBy: { column: "updated_at", order: "desc" } });

      if (error) throw error;

      const mediaFiles: MediaFile[] = (data || [])
        .filter((f) => f.id) // vetëm file-et, jo folder-at
        .map((f) => {
          const path = `${folder}/${f.name}`;
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
          return {
            name: f.name,
            path,
            url: urlData.publicUrl,
            size: f.metadata?.size,
            updated_at: f.updated_at,
          };
        });

      setFiles(mediaFiles);
    } catch (e: any) {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadFiles(activeFolder);
  }, [activeFolder, loadFiles]);

  const handleUpload = async (fileList: FileList) => {
    setUploading(true);
    let count = 0;
    for (const file of Array.from(fileList)) {
      const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${activeFolder}/${Date.now()}-${safeName}`;
      try {
        await uploadCmsImage(file, path);
        count++;
      } catch (e: any) {
        toast({ title: `Gabim: ${file.name}`, description: e.message, variant: "destructive" });
      }
    }
    setUploading(false);
    if (count > 0) {
      toast({ title: `U ngarkuan ${count} file!` });
      loadFiles(activeFolder);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Fshi "${file.name}"?`)) return;
    setDeleting(file.path);
    const { error } = await supabase.storage.from(BUCKET).remove([file.path]);
    setDeleting(null);
    if (error) {
      toast({ title: "Gabim", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "U fshi!" });
      setFiles((prev) => prev.filter((f) => f.path !== file.path));
      if (selected === file.path) setSelected(null);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedFile = files.find((f) => f.path === selected);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0 overflow-hidden rounded-lg border border-border">
      {/* Sidebar folders */}
      <div className="w-44 shrink-0 border-r border-border bg-muted/30 flex flex-col">
        <div className="p-3 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Folder-at</p>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {FOLDERS.map((folder) => (
            <button
              key={folder}
              onClick={() => { setActiveFolder(folder); setSelected(null); setSearch(""); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left ${
                activeFolder === folder
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <FolderOpen className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate capitalize">{folder}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b border-border bg-background">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko..."
              className="pl-8 h-8 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} file</span>
          <Button
            variant="ghost" size="icon" className="h-8 w-8"
            onClick={() => loadFiles(activeFolder)}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          {/* Upload button */}
          <label className="cursor-pointer">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              uploading ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}>
              <Upload className="h-3.5 w-3.5" />
              {uploading ? "Duke ngarkuar..." : "Ngarko"}
            </div>
            <input
              type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files?.length) handleUpload(e.target.files); }}
            />
          </label>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Grid */}
          <div
            className={`flex-1 overflow-y-auto p-3 ${dragOver ? "bg-primary/5 ring-2 ring-inset ring-primary" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files);
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                <ImageIcon className="h-10 w-10 opacity-20" />
                <p className="text-sm">Nuk ka file në këtë folder</p>
                <p className="text-xs">Tërhiq foto këtu për t'i ngarkuar</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {filtered.map((file) => (
                  <div
                    key={file.path}
                    onClick={() => setSelected(selected === file.path ? null : file.path)}
                    className={`group relative aspect-square rounded overflow-hidden cursor-pointer border-2 transition-all ${
                      selected === file.path
                        ? "border-primary shadow-md scale-[1.02]"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover bg-muted"
                      loading="lazy"
                    />
                    {selected === file.path && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selectedFile && (
            <div className="w-56 shrink-0 border-l border-border bg-background flex flex-col overflow-y-auto">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold">Detaje</p>
                <button onClick={() => setSelected(null)}>
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-3 space-y-3">
                <div className="aspect-square rounded overflow-hidden bg-muted border border-border">
                  <img src={selectedFile.url} alt={selectedFile.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium break-all">{selectedFile.name}</p>
                  {selectedFile.size && (
                    <p className="text-[10px] text-muted-foreground">{formatSize(selectedFile.size)}</p>
                  )}
                  {selectedFile.updated_at && (
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(selectedFile.updated_at).toLocaleDateString("sq-AL")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">URL</p>
                  <div className="flex items-start gap-1">
                    <p className="text-[10px] break-all text-muted-foreground flex-1 bg-muted rounded p-1.5">{selectedFile.url}</p>
                  </div>
                  <Button
                    size="sm" variant="outline" className="w-full h-7 text-xs gap-1.5"
                    onClick={() => handleCopy(selectedFile.url)}
                  >
                    {copied === selectedFile.url ? (
                      <><Check className="h-3 w-3" /> U kopjua!</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Kopjo URL</>
                    )}
                  </Button>
                  <Button
                    size="sm" variant="destructive" className="w-full h-7 text-xs gap-1.5"
                    onClick={() => handleDelete(selectedFile)}
                    disabled={deleting === selectedFile.path}
                  >
                    <Trash2 className="h-3 w-3" />
                    {deleting === selectedFile.path ? "Duke fshirë..." : "Fshi"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
