import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Mail, MapPin, MessageSquare, Building2, User, Trash2 } from "lucide-react";
import { useState } from "react";

export const AdminContactSubmissions = () => {
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["contact_submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.filter((r: any) => {
        const d = r.data as any;
        return d?.type === "contact";
      });
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Kontaktet</h2>
        <span className="text-sm text-muted-foreground">{submissions?.length ?? 0} total</span>
      </div>

      {/* Delete confirmation */}
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
                        <User size={14} className="text-primary shrink-0" />
                        {d.fullName || "—"}
                      </p>
                      {d.business && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 size={12} /> {d.business}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                      {d.email && <a href={`mailto:${d.email}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"><Mail size={12} /> {d.email}</a>}
                      {d.phone && <a href={`tel:${d.phone}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"><Phone size={12} /> {d.phone}</a>}
                      {d.city && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={12} /> {d.city}</p>}
                    </div>
                    {d.message && (
                      <div className="mt-3 bg-muted/40 border border-border/50 rounded p-3">
                        <p className="text-xs text-muted-foreground whitespace-pre-line">{d.message}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <p className="text-xs text-muted-foreground">{new Date(sub.created_at).toLocaleDateString("sq-AL", { day: "numeric", month: "short", year: "numeric" })}</p>
                    <button onClick={() => setDeleteId(sub.id)} className="text-destructive hover:text-destructive/80 transition-colors"><Trash2 size={14} /></button>
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
