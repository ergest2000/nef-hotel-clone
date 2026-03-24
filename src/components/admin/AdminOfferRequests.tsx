import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gift } from "lucide-react";

export const AdminOfferRequests = () => {
  const { data: requests, isLoading } = useQuery({
    queryKey: ["offer_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.filter((r: any) => {
        const d = r.data as any;
        return d?.type === "offer_request" || d?.type === "quote_request" || d?.source === "checkout" || d?.type === "contact";
      });
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
        <h2 className="text-xl font-semibold text-foreground">Kërkesat për Oferta</h2>
        <span className="text-sm text-muted-foreground">{requests?.length ?? 0} total</span>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <Gift size={40} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nuk ka kërkesa për oferta ende.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Kur dikush kërkon ofertë ose dërgon formularin, do shfaqet këtu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => {
            const d = req.data as any;
            return (
              <div key={req.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.fullName || d.business || d.email || "Pa emër"}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {d.email && <p className="text-xs text-muted-foreground">✉ {d.email}</p>}
                      {d.phone && <p className="text-xs text-muted-foreground">☎ {d.phone}</p>}
                      {d.city && <p className="text-xs text-muted-foreground">📍 {d.city}</p>}
                    </div>
                    {d.message && <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">{d.message}</p>}
                    {d.type && (
                      <span className="inline-block mt-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-semibold">
                        {d.type === "contact" ? "Kontakt" : d.type === "offer_request" ? "Kërkesë Oferte" : d.type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0 ml-4">
                    {new Date(req.created_at).toLocaleDateString("sq-AL", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
