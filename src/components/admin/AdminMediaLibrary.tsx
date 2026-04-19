import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadCmsImage } from "@/hooks/useCms";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy, Trash2, Upload, Search, FolderOpen, Image as ImageIcon,
  Check, RefreshCw, X, CheckSquare, Square
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
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectMode, setSelectMode] = useState(false);

  const loadFiles = useCallback(async (folder: string) => {
    setLoading(true);
    setFiles([]);
    setSelectedPaths(new Set());
    setPreviewFile(null);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(folder, { limit: 500, sortBy: { column: "updated_at", order: "desc" } });
      if (error) throw error;
      const mediaFiles: MediaFile[] = (data || [])
        .filter((f) => f.id)
        .map((f) => {
          const path = `${folder}/${f.name}`;
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
          return { name: f.name, path, url: urlData.publicUrl, size: f.metadata?.size, updated_at: f.updated_at };
        });
      setFiles(mediaFiles);
    } catch (e: any) {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { loadFiles(activeFolder); }, [activeFolder, loadFiles]);

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
    if (count > 0) { toast({ title: `U ngarkuan ${count} file!` }); loadFiles(activeFolder); }
  };

  const handleBulkDelete = async () => {
    if (selectedPaths.size === 0) return;
    if (!confirm(`Fshi ${selectedPaths.size} file të zgjedhura?`)) return;
    setBulkDeleting(true);
    const paths = Array.from(selectedPaths);
    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    setBulkDeleting(false);
    if (error) {
      toast({ title: "Gabim", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `U fshinë ${paths.length} file!` });
      setFiles((prev) => prev.filter((f) => !selectedPaths.has(f.path)));
      setSelectedPaths(new Set());
      setPreviewFile(null);
      setSelectMode(false);
    }
  };

  const handleDeleteOne = async (file: MediaFile) => {
    if (!confirm(`Fshi "${file.name}"?`)) return;
    const { error } = await supabase.storage.from(BUCKET).remove([file.path]);
    if (error) {
      toast({ title: "Gabim", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "U fshi!" });
      setFiles((prev) => prev.filter((f) => f.path !== file.path));
      if (previewFile?.path === file.path) setPreviewFile(null);
      setSelectedPaths((prev) => { const n = new Set(prev); n.delete(file.path); return n; });
    }
  };

  const toggleSelect = (path: string) => {
    setSelectedPaths((prev) => {
      const n = new Set(prev);
      n.has(path) ? n.delete(path) : n.add(path);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPaths.size === filtered.length) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(filtered.map((f) => f.path)));
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

  const filtered = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  const allSelected = filtered.length > 0 && selectedPaths.size === filtered.length;

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0 overflow-hidden rounded-lg border border-border">
      {/* Sidebar */}
      <div className="w-44 shrink-0 border-r border-border bg-muted/30 flex flex-col">
        <div className="p-3 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Folder-at</p>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {FOLDERS.map((folder) => (
            <button
              key={folder}
              onClick={() => { setActiveFolder(folder); setSelectMode(false); setSearch(""); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left ${
                activeFolder === folder ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              <FolderOpen className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate capitalize">{folder}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b border-border bg-background flex-wrap">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kërko..." className="pl-8 h-8 text-sm" />
            {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
          </div>

          <span className="text-xs text-muted-foreground">{filtered.length} file</span>

          {/* Select mode toggle */}
          <Button
            variant={selectMode ? "default" : "outline"} size="sm" className="h-8 text-xs gap-1.5"
            onClick={() => { setSelectMode(!selectMode); setSelectedPaths(new Set()); }}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Zgjidh
          </Button>

          {/* Select all - shown only in select mode */}
          {selectMode && filtered.length > 0 && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={toggleSelectAll}>
              {allSelected ? <><CheckSquare className="h-3.5 w-3.5" /> Hiq të gjitha</> : <><Square className="h-3.5 w-3.5" /> Zgjidh të gjitha</>}
            </Button>
          )}

          {/* Bulk delete */}
          {selectMode && selectedPaths.size > 0 && (
            <Button variant="destructive" size="sm" className="h-8 text-xs gap-1.5" onClick={handleBulkDelete} disabled={bulkDeleting}>
              <Trash2 className="h-3.5 w-3.5" />
              {bulkDeleting ? "Duke fshirë..." : `Fshi ${selectedPaths.size}`}
            </Button>
          )}

          <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={() => loadFiles(activeFolder)} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <label className="cursor-pointer">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              uploading ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}>
              <Upload className="h-3.5 w-3.5" />
              {uploading ? "Duke ngarkuar..." : "Ngarko"}
            </div>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) handleUpload(e.target.files); }} />
          </label>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Grid */}
          <div
            className={`flex-1 overflow-y-auto p-3 transition-colors ${dragOver ? "bg-primary/5 ring-2 ring-inset ring-primary" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files); }}
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
                {filtered.map((file) => {
                  const isSelected = selectedPaths.has(file.path);
                  const isPreview = previewFile?.path === file.path;
                  return (
                    <div
                      key={file.path}
                      onClick={() => {
                        if (selectMode) {
                          toggleSelect(file.path);
                        } else {
                          setPreviewFile(isPreview ? null : file);
                        }
                      }}
                      className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "ring-2 ring-primary ring-offset-1 scale-[0.97]"
                          : isPreview
                          ? "ring-2 ring-primary"
                          : "hover:ring-1 hover:ring-border"
                      }`}
                    >
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover bg-muted" loading="lazy" />

                      {/* Overlay on hover */}
                      <div className={`absolute inset-0 transition-colors ${
                        isSelected ? "bg-primary/20" : "bg-black/0 group-hover:bg-black/15"
                      }`} />

                      {/* Checkbox */}
                      {(selectMode || isSelected) && (
                        <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded flex items-center justify-center transition-all ${
                          isSelected ? "bg-primary" : "bg-white/80 border border-border"
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      )}

                      {/* Delete on hover (non-select mode) */}
                      {!selectMode && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteOne(file); }}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <Trash2 className="h-3 w-3 text-white" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Preview panel */}
          {previewFile && !selectMode && (
            <div className="w-56 shrink-0 border-l border-border bg-background flex flex-col overflow-y-auto">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold">Detaje</p>
                <button onClick={() => setPreviewFile(null)}>
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <div className="p-3 space-y-3">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                  <img src={previewFile.url} alt={previewFile.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium break-all leading-snug">{previewFile.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {previewFile.size && <span>{formatSize(previewFile.size)}</span>}
                    {previewFile.updated_at && <span>{new Date(previewFile.updated_at).toLocaleDateString("sq-AL")}</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">URL</p>
                  <p className="text-[10px] break-all text-muted-foreground bg-muted rounded p-2 leading-relaxed">{previewFile.url}</p>
                  <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1.5" onClick={() => handleCopy(previewFile.url)}>
                    {copied === previewFile.url ? <><Check className="h-3 w-3" /> U kopjua!</> : <><Copy className="h-3 w-3" /> Kopjo URL</>}
                  </Button>
                  <Button size="sm" variant="destructive" className="w-full h-8 text-xs gap-1.5" onClick={() => handleDeleteOne(previewFile)}>
                    <Trash2 className="h-3 w-3" /> Fshi
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
