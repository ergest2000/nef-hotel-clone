import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Mail, MapPin, MessageSquare, Building2, User, Trash2, Eye, Download } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { exportToPDF } from "@/lib/exportPdf";

const toFields = (sub: any) => {
  const d = sub.data as any;
  const fields: { label: string; value: string }[] = [];
  if (d.fullName) fields.push({ label: "Emri", value: d.fullName });
  if (d.business) fields.push({ label: "Biznesi", value: d.business });
  if (d.email) fields.push({ label: "Email", value: d.email });
  if (d.phone) fields.push({ label: "Telefoni", value: d.phone });
  if (d.city) fields.push({ label: "Qyteti", value: d.city });
  if (d.message) fields.push({ label: "Mesazhi", value: d.message });
  fields.push({ label: "Data", value: new Date(sub.created_at).toLocaleString("sq-AL") });
  return fields;
};

export const AdminContactSubmissions = () => {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewRecord, setViewRecord] = useState<any | null>(null);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["contact_submissions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data.filter((r: any) => (r.data as any)?.type === "contact");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact_submissions"] });
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
          <DialogHeader><DialogTitle>Detajet e Kontaktit</DialogTitle></DialogHeader>
          {viewRecord && (
            <div className="space-y-3">
              {Object.entries(viewRecord.data as Record<string, any>).filter(([k]) => k !== "type").map(([key, val]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{key}</p>
                  <p className="text-sm text-foreground whitespace-pre-line">{String(val) || "—"}</p>
                </div>
              ))}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Data</p>
                <p className="text-sm text-foreground">{new Date(viewRecord.created_at).toLocaleString("sq-AL")}</p>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => exportToPDF("Kontakt", [toFields(viewRecord)])}>
                <Download className="h-4 w-4 mr-2" /> Shkarko PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Kontaktet</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{submissions?.length ?? 0} total</span>
          {submissions && submissions.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => exportToPDF("Kontaktet", submissions.map(toFields))}>
              <Download className="h-4 w-4 mr-2" /> Shkarko PDF
            </Button>
          )}
        </div>
      </div>

      {!submissions || submissions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <MessageSquare size={40} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nuk ka kontakte ende.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Kur dikush plotëson formularin e kontaktit, do shfaqet këtu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub: any) => {
            const d = sub.data as any;
            if (!d) return null;
            return (
              <div key={sub.id} className="border border-border rounded-lg p-5 bg-background hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <User size={14} className="text-primary shrink-0" /> {d.fullName || "—"}
                      </p>
                      {d.business && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 size={12} /> {d.business}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                      {d.email && <a href={`mailto:${d.email}`} className="text-xs
