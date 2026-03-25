import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Trash2, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportToPDF } from "@/lib/exportPdf";

export const AdminNewsletter = () => {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["newsletter_from_registrations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data.filter((r: any) => (r.data as any)?.type === "newsletter");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["newsletter_from_registrations"] });
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

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Newsletter Subscribers</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{subscribers?.length ?? 0} total</span>
          {subscribers && subscribers.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => exportToPDF("Newsletter", subscribers.map((s: any) => [
              { label: "Email", value: (s.data as any)?.email || "—" },
              { label: "Data", value: new Date(s.created_at).toLocaleString("sq-AL") },
            ]))}>
              <Download className="h-4 w-4 mr-2" /> Shkarko PDF
            </Button>
          )}
        </div>
      </div>

      {!subscribers || subscribers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <Mail size={40} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nuk ka abonentë ende.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Kur dikush abonohet në newsletter, do shfaqet këtu.</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs tracking-brand text-muted-foreground uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs tracking-brand text-muted-foreground uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs tracking-brand text-muted-foreground uppercase">Data</th>
                <th className="text-right px-4 py-3 text-xs tracking-brand text-muted-foreground uppercase">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub: any, i: number) => {
                const d = sub.data as any;
                return (
                  <tr key={sub.id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{d?.email || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(sub.created_at).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDeleteId(sub.id)} className="text-destructive hover:text-destructive/80 transition-colors"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
