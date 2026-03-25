import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gift, User, Mail, Phone, MapPin, Package, Building2, Trash2, Eye, Download } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { exportToPDF } from "@/lib/exportPdf";

const toFields = (req: any) => {
  const d = req.data as any;
  const fields: { label: string; value: string }[] = [];
  if (d.fullName) fields.push({ label: "Emri", value: d.fullName });
  if (d.business) fields.push({ label: "Biznesi", value: d.business });
  if (d.email) fields.push({ label: "Email", value: d.email });
  if (d.phone) fields.push({ label: "Telefoni", value: d.phone });
  if (d.city) fields.push({ label: "Qyteti", value: d.city });
  if (d.message) fields.push({ label: "Mesazhi", value: d.message });
  if (d.items && Array.isArray(d.items) && d.items.length > 0) {
    const itemsList = d.items.map((item: any) =>
      `• ${item.title || "Produkt"} ${item.code ? `(${item.code})` : ""} ${item.color ? `— ${item.color}` : ""} ${item.boxes ? `× ${item.boxes} kuti` : ""}`
    ).join("\n");
    fields.push({ label: "Produktet", value: itemsList });
  }
  fields.push({ label: "Data", value: new Date(req.created_at).toLocaleString("sq-AL") });
  return fields;
};

export const AdminOfferRequests = () => {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewRecord, setViewRecord] = useState<any | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ["offer_requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data.filter((r: any) => {
        const d = r.data as any;
        return d?.type === "offer_request" || d?.source === "checkout";
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offer_requests"] });
      setDeleteId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-sm font-semibold text-foreground mb-2">Jeni i sigurt?</h3>
            <p className="text-xs text-muted-foreground mb-4">Ky veprim nuk mund të kthehet mbrapa.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 text-xs border border-border rounded hover:bg-muted transition-colors">Anulo</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="flex-1 px-4 py-2 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors">
                {deleteMutation.isPending ? "..." : "Fshi"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detajet e Kërkesës</DialogTitle></DialogHeader>
          {viewRecord && (() => {
            const d = viewRecord.data as any;
            return (
              <div className="space-y-3">
                {d.fullName && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Emri</p><p className="text-sm text-foreground">{d.fullName}</p></div>}
                {d.business && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Biznesi</p><p className="text-sm text-foreground">{d.business}</p></div>}
                {d.email && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p><p className="text-sm text-foreground">{d.email}</p></div>}
                {d.phone && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Telefoni</p><p className="text-sm text-foreground">{d.phone}</p></div>}
                {d.city && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Qyteti</p><p className="text-sm text-foreground">{d.city}</p></div>}
                {d.message && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Mesazhi</p><p className="text-sm text-foreground whitespace-pre-line">{d.message}</p></div>}
                {d.items && Array.isArray(d.items) && d.items.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Produktet</p>
                    {d.items.map((item: any, i: number) => (
                      <p key={i} className="text-sm text-foreground">
                        • {item.title || "Produkt"} {item.code ? `(${item.code})` : ""} {item.color ? `— ${item.color}` : ""} {item.boxes ? `× ${item.boxes} kuti` : ""}
                      </p>
                    ))}
                  </div>
                )}
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Data</p><p className="text-sm text-foreground">{new Date(viewRecord.created_at).toLocaleString("sq-AL")}</p></div>
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => exportToPDF("Kerkese-Oferte", [toFields(viewRecord)])}>
                  <Download className="h-4 w-4 mr-2" /> Shkarko PDF
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Kërkesat për Oferta</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{requests?.length ?? 0} total</span>
          {requests && requests.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => exportToPDF("Kerkesat-per-Oferta", requests.map(toFields))}>
              <Download className="h-4 w-4 mr-2" /> Shkarko PDF
            </Button>
          )}
        </div>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <Gift size={40} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nuk ka kërkesa për oferta ende.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Kur dikush kërkon ofertë nga checkout, do shfaqet këtu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => {
            const d = req.data as any;
            if (!d) return null;
            return (
              <div key={req.id} className="border border-border rounded-lg p-5 bg-background hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <User size={14} className="text-primary shrink-0" /> {d.fullName || d.business || d.email || "Pa emër"}
                      </p>
                      {d.business && <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 size={12} /> {d.business}</p>}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                      {d.email && <a href={`mailto:${d.email}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"><Mail size={12} /> {d.email}</a>}
                      {d.phone && <a href={`tel:${d.phone}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"><Phone size={12} /> {d.phone}</a>}
                      {d.city && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {d.city}</p>}
                    </div>
                    {d.message && (
                      <div className="mt-3 bg-muted/40 border border-border/50 rounded p-3">
                        <p className="text-xs text-muted-foreground whitespace-pre-line">{d.message}</p>
                      </div>
                    )}
                    {d.items && Array.isArray(d.items) && d.items.length > 0 && (
                      <div className="mt-3 bg-primary/5 border border-primary/10 rounded p-3">
                        <p className="text-xs font-medium text-foreground flex items-center gap-1 mb-1"><Package size={12} /> Produktet:</p>
                        {d.items.map((item: any, i: number) => (
                          <p key={i} className="text-xs text-muted-foreground pl-4">
                            • {item.title || "Produkt"} {item.code ? `(${item.code})` : ""} {item.color ? `— ${item.color}` : ""} {item.boxes ? `× ${item.boxes} kuti` : ""} {item.pieces ? `(${item.pieces} copë)` : ""}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString("sq-AL", { day: "numeric", month: "short", year: "numeric" })}</p>
                    <p className="text-[10px] text-muted-foreground/60">{new Date(req.created_at).toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}</p>
                    <div className="flex gap-1">
                      <button onClick={() => setViewRecord(req)} className="text-muted-foreground hover:text-primary transition-colors"><Eye size={14} /></button>
                      <button onClick={() => setDeleteId(req.id)} className="text-destructive hover:text-destructive/80 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
