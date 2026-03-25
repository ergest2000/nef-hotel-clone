import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gift, User, Mail, Phone, MapPin, Package, Building2 } from "lucide-react";

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
        return d?.type === "offer_request" || d?.type === "quote_request" || d?.source === "checkout";
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
                        <User size={14} className="text-primary shrink-0" />
                        {d.fullName || d.business || d.email || "Pa emër"}
                      </p>
                      {d.business && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 size={12} /> {d.business}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                      {d.email && (
                        <a href={`mailto:${d.email}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                          <Mail size={12} /> {d.email}
                        </a>
                      )}
                      {d.phone && (
                        <a href={`tel:${d.phone}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                          <Phone size={12} /> {d.phone}
                        </a>
                      )}
                      {d.city && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin size={12} /> {d.city}
                        </p>
                      )}
                    </div>
                    {d.message && (
                      <div className="mt-3 bg-muted/40 border border-border/50 rounded p-3">
                        <p className="text-xs text-muted-foreground whitespace-pre-line">{d.message}</p>
                      </div>
                    )}
                    {d.items && Array.isArray(d.items) && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Package size={12} /> Produktet:</p>
                        {d.items.map((item: any, i: number) => (
                          <p key={i} className="text-xs text-muted-foreground pl-4">• {item.title || item.name || JSON.stringify(item)}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString("sq-AL", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {new Date(req.created_at).toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}
                    </p>
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
