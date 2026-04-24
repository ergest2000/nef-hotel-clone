import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadCmsImage } from "@/hooks/useCms";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useCollections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy, Trash2, Upload, Search, FolderOpen, Image as ImageIcon,
  Check, RefreshCw, X, CheckSquare, Square, Package, ChevronDown,
  ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react";

type MediaFile = {
  name: string;
  path: string;
  url: string;
  size?: number;
  updated_at?: string;
  folder: string;
};

type SortKey = "date_desc" | "date_asc" | "name_asc" | "name_desc" | "size_desc" | "size_asc";

const BUCKET = "cms-images";
const FOLDERS = ["products", "collections", "categories", "gallery", "home", "logos", "blog", "company", "certifications", "tailor-made"];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date_desc", label: "Më të rejat" },
  { value: "date_asc", label: "Më të vjetrat" },
  { value: "name_asc", label: "Emri A-Z" },
  { value: "name_desc", label: "Emri Z-A" },
  { value: "size_desc", label: "Madhësia ↓" },
  { value: "size_asc", label: "Madhësia ↑" },
];

export const AdminMediaLibrary = () => {
  const { toast } = useToast();
  const { data: allProducts } = useProducts();

  const [allFiles, setAllFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string>("__all__");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date_desc");
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [productFilter, setProductFilter] = useState<string | null>(null);
  const [productFilterName, setProductFilterName] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Cache: folder -> files
  const cacheRef = useRef<Record<string, MediaFile[]>>({});

  const loadFiles = useCallback(async (folder: string, force = false) => {
    setSelectedPaths(new Set());
    setPreviewFile(null);

    // Serve nga cache nëse ka
    if (!force && cacheRef.current[folder]) {
      setAllFiles(cacheRef.current[folder]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setAllFiles([]);

    try {
      const folders = folder === "__all__" ? FOLDERS : [folder];

      // Ngarko të gjithë folder-at top-level paralelisht
      const topLevelResults = await Promise.all(
        folders.map(async (f) => {
          const { data } = await supabase.storage
            .from(BUCKET)
            .list(f, { limit: 1000, sortBy: { column: "updated_at", order: "desc" } });

          const topFiles: MediaFile[] = [];
          const subfolders: string[] = [];

          for (const item of data || []) {
            if (!item.id) {
              subfolders.push(item.name);
            } else {
              const path = `${f}/${item.name}`;
              const { data: u } = supabase.storage.from(BUCKET).getPublicUrl(path);
              topFiles.push({
                name: item.name, path, url: u.publicUrl,
                size: item.metadata?.size, updated_at: item.updated_at, folder: f,
              });
            }
          }
          return { f, topFiles, subfolders };
        })
      );

      // Mblidh të gjithë nënfolderët dhe ngarkoji paralel
      const allSubfolderRequests: Promise<MediaFile[]>[] = [];
      for (const { f, subfolders } of topLevelResults) {
        for (const sf of subfolders) {
          allSubfolderRequests.push(
            supabase.storage.from(BUCKET).list(`${f}/${sf}`, { limit: 200 })
              .then(({ data: sub }) =>
                (sub || []).filter((i) => i.id).map((subItem) => {
                  const path = `${f}/${sf}/${subItem.name}`;
                  const { data: u } = supabase.storage.from(BUCKET).getPublicUrl(path);
                  return {
                    name: subItem.name, path, url: u.publicUrl,
                    size: subItem.metadata?.size, updated_at: subItem.updated_at, folder: f,
                  } as MediaFile;
                })
              )
              .catch(() => [] as MediaFile[])
          );
        }
      }

      const initialFiles = topLevelResults.flatMap((r) => r.topFiles);

      // Prit që të gjitha të mbarojnë, pastaj setoj NJË HERË (që scroll position të mos rezetohet)
      if (allSubfolderRequests.length > 0) {
        const subResults = await Promise.all(allSubfolderRequests);
        const allFinalFiles = [...initialFiles, ...subResults.flat()];
        setAllFiles(allFinalFiles);
        cacheRef.current[folder] = allFinalFiles;
      } else {
        cacheRef.current[folder] = initialFiles;
      }
    } catch (e: any) {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { loadFiles(activeFolder); }, [activeFolder, loadFiles]);

  // Filter by product
  const filteredByProduct = useMemo(() => {
    if (!productFilter) return allFiles;
    return allFiles.filter((f) => f.path.includes(productFilter));
  }, [allFiles, productFilter]);

  // Filter by search
  const filteredBySearch = useMemo(() => {
    if (!search) return filteredByProduct;
    return filteredByProduct.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  }, [filteredByProduct, search]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filteredBySearch];
    switch (sortKey) {
      case "date_desc": return arr.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
      case "date_asc": return arr.sort((a, b) => (a.updated_at || "").localeCompare(b.updated_at || ""));
      case "name_asc": return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc": return arr.sort((a, b) => b.name.localeCompare(a.name));
      case "size_desc": return arr.sort((a, b) => (b.size || 0) - (a.size || 0));
      case "size_asc": return arr.sort((a, b) => (a.size || 0) - (b.size || 0));
      default: return arr;
    }
  }, [filteredBySearch, sortKey]);

  // Product dropdown filter
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    const q = productSearch.toLowerCase();
    return allProducts.filter((p) =>
      (p.title_al || "").toLowerCase().includes(q) ||
      (p.title_en || "").toLowerCase().includes(q)
    ).slice(0, 20);
  }, [allProducts, productSearch]);

  const handleUpload = async (fileList: FileList) => {
    const uploadTo = activeFolder === "__all__" ? "home" : activeFolder;
    setUploading(true);
    let count = 0;
    for (const file of Array.from(fileList)) {
      const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${uploadTo}/${Date.now()}-${safeName}`;
      try { await uploadCmsImage(file, path); count++; }
      catch (e: any) { toast({ title: `Gabim: ${file.name}`, description: e.message, variant: "destructive" }); }
    }
    setUploading(false);
    if (count > 0) {
      toast({ title: `U ngarkuan ${count} file!` });
      cacheRef.current = {}; // invalidate cache
      loadFiles(activeFolder, true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPaths.size === 0) return;
    if (!confirm(`Fshi ${selectedPaths.size} file të zgjedhura?`)) return;
    setBulkDeleting(true);
    const { error } = await supabase.storage.from(BUCKET).remove(Array.from(selectedPaths));
    setBulkDeleting(false);
    if (error) { toast({ title: "Gabim", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: `U fshinë ${selectedPaths.size} file!` });
      setAllFiles((prev) => prev.filter((f) => !selectedPaths.has(f.path)));
      cacheRef.current = {}; // invalidate cache
      setSelectedPaths(new Set()); setPreviewFile(null); setSelectMode(false);
    }
  };

  const handleDeleteOne = async (file: MediaFile) => {
    if (!confirm(`Fshi "${file.name}"?`)) return;
    const { error } = await supabase.storage.from(BUCKET).remove([file.path]);
    if (error) { toast({ title: "Gabim", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "U fshi!" });
      setAllFiles((prev) => prev.filter((f) => f.path !== file.path));
      cacheRef.current = {}; // invalidate cache
      if (previewFile?.path === file.path) setPreviewFile(null);
      setSelectedPaths((prev) => { const n = new Set(prev); n.delete(file.path); return n; });
    }
  };

  const toggleSelect = (path: string) => {
    setSelectedPaths((prev) => { const n = new Set(prev); n.has(path) ? n.delete(path) : n.add(path); return n; });
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const allSelected = sorted.length > 0 && selectedPaths.size === sorted.length;
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortKey)?.label;

  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-background"
      style={{
        display: "grid",
        gridTemplateColumns: "176px 1fr",
        height: "calc(100vh - 160px)",
        minHeight: "500px",
      }}
    >
      {/* Sidebar */}
      <div className="border-r border-border bg-muted/30 flex flex-col min-h-0">
        <div className="p-3 border-b border-border shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Folder-at</p>
        </div>
        <div className="flex-1 overflow-y-auto py-1 min-h-0">
          <button
            onClick={() => { setActiveFolder("__all__"); setSelectMode(false); setSearch(""); setProductFilter(null); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left ${activeFolder === "__all__" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
          >
            <ImageIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">Të gjitha</span>
          </button>
          {FOLDERS.map((folder) => (
            <button
              key={folder}
              onClick={() => { setActiveFolder(folder); setSelectMode(false); setSearch(""); setProductFilter(null); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left ${activeFolder === folder ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
            >
              <FolderOpen className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate capitalize">{folder}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: "auto 1fr",
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b border-border bg-background flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[140px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kërko file..." className="pl-8 h-8 text-sm" />
            {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
          </div>

          {/* Product filter */}
          <div className="relative">
            <button
              onClick={() => { setShowProductDropdown(!showProductDropdown); setShowSortDropdown(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs transition-colors ${productFilter ? "border-primary bg-primary/5 text-primary" : "border-border bg-background hover:bg-muted"}`}
            >
              <Package className="h-3.5 w-3.5" />
              {productFilterName ? <span className="max-w-[100px] truncate">{productFilterName}</span> : "Produkt"}
              {productFilter ? <button onClick={(e) => { e.stopPropagation(); setProductFilter(null); setProductFilterName(null); setShowProductDropdown(false); }}><X className="h-3 w-3" /></button> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showProductDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
                <div className="p-2 border-b border-border">
                  <Input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Kërko produkt..." className="h-7 text-xs" autoFocus />
                </div>
                <div className="max-h-48 overflow-y-auto py-1">
                  {filteredProducts.map((p) => (
                    <button key={p.id} onClick={() => { setProductFilter(p.id); setProductFilterName(p.title_al || p.title_en || p.slug); setShowProductDropdown(false); setProductSearch(""); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left">
                      {p.image_url ? <img src={p.image_url} alt="" className="w-6 h-6 object-cover rounded shrink-0" /> : <div className="w-6 h-6 bg-muted rounded shrink-0" />}
                      <span className="truncate">{p.title_al || p.title_en || p.slug}</span>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && <p className="text-xs text-muted-foreground px-3 py-2">Nuk u gjet</p>}
                </div>
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => { setShowSortDropdown(!showSortDropdown); setShowProductDropdown(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-background hover:bg-muted text-xs transition-colors"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {activeSortLabel}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showSortDropdown && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-background border border-border rounded-lg shadow-lg z-50 py-1">
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { setSortKey(opt.value); setShowSortDropdown(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-muted transition-colors ${sortKey === opt.value ? "text-primary font-medium" : ""}`}>
                    {opt.label}
                    {sortKey === opt.value && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground">{sorted.length} file</span>

          {/* Select mode */}
          <Button variant={selectMode ? "default" : "outline"} size="sm" className="h-8 text-xs gap-1.5"
            onClick={() => { setSelectMode(!selectMode); setSelectedPaths(new Set()); }}>
            <CheckSquare className="h-3.5 w-3.5" /> Zgjidh
          </Button>

          {selectMode && sorted.length > 0 && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() =>
              setSelectedPaths(allSelected ? new Set() : new Set(sorted.map((f) => f.path)))}>
              {allSelected ? <><CheckSquare className="h-3.5 w-3.5" /> Hiq të gjitha</> : <><Square className="h-3.5 w-3.5" /> Të gjitha</>}
            </Button>
          )}

          {selectMode && selectedPaths.size > 0 && (
            <Button variant="destructive" size="sm" className="h-8 text-xs gap-1.5" onClick={handleBulkDelete} disabled={bulkDeleting}>
              <Trash2 className="h-3.5 w-3.5" />
              {bulkDeleting ? "Duke fshirë..." : `Fshi ${selectedPaths.size}`}
            </Button>
          )}

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => loadFiles(activeFolder, true)} disabled={loading} title="Rifresko">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <label className="cursor-pointer">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${uploading ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
              <Upload className="h-3.5 w-3.5" />
              {uploading ? "Duke ngarkuar..." : "Ngarko"}
            </div>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) handleUpload(e.target.files); }} />
          </label>
        </div>

        {/* Click outside to close dropdowns */}
        {(showProductDropdown || showSortDropdown) && (
          <div className="fixed inset-0 z-40" onClick={() => { setShowProductDropdown(false); setShowSortDropdown(false); }} />
        )}

        <div
          style={{
            position: "relative",
            minHeight: 0,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {/* Grid */}
          <div
            className={`absolute inset-0 overflow-y-auto p-3 transition-all ${dragOver ? "bg-primary/5 ring-2 ring-inset ring-primary" : ""}`}
            style={{
              minHeight: 0,
              minWidth: 0,
              paddingRight: previewFile && !selectMode ? "236px" : "12px",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files); }}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">Duke ngarkuar mediat...</p>
              </div>
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                <ImageIcon className="h-10 w-10 opacity-20" />
                <p className="text-sm">Nuk ka file</p>
                <p className="text-xs">Tërhiq foto këtu për t'i ngarkuar</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                {sorted.map((file) => {
                  const isSelected = selectedPaths.has(file.path);
                  const isPreview = previewFile?.path === file.path;
                  return (
                    <div
                      key={file.path}
                      onClick={() => selectMode ? toggleSelect(file.path) : setPreviewFile(isPreview ? null : file)}
                      className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer ${
                        isSelected ? "ring-2 ring-primary"
                          : isPreview ? "ring-2 ring-primary"
                          : "ring-1 ring-transparent hover:ring-border"
                      }`}
                    >
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover bg-muted" loading="lazy" />
                      <div className={`absolute inset-0 transition-colors ${isSelected ? "bg-primary/20" : "bg-black/0 group-hover:bg-black/15"}`} />
                      {(selectMode || isSelected) && (
                        <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded flex items-center justify-center transition-all ${isSelected ? "bg-primary" : "bg-white/80 border border-border"}`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      )}
                      {!selectMode && (
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteOne(file); }}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
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
            <div
              className="absolute top-0 right-0 bottom-0 border-l border-border bg-background flex flex-col overflow-y-auto shadow-lg"
              style={{ width: "224px", minHeight: 0, zIndex: 10 }}
            >
              <div className="p-3 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold">Detaje</p>
                <button onClick={() => setPreviewFile(null)}><X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" /></button>
              </div>
              <div className="p-3 space-y-3">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                  <img src={previewFile.url} alt={previewFile.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium break-all leading-snug">{previewFile.name}</p>
                  <div className="space-y-0.5 text-[10px] text-muted-foreground">
                    <p>📁 {previewFile.folder}</p>
                    <p>📦 {formatSize(previewFile.size)}</p>
                    {previewFile.updated_at && <p>📅 {new Date(previewFile.updated_at).toLocaleDateString("sq-AL")}</p>}
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
