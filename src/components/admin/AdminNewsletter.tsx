import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";

export const AdminNewsletter = () => {
  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["newsletter_from_registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.filter((r: any) => {
        const d = r.data as any;
        return d?.type === "newsletter";
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
        <h2 className="text-xl font-semibold text-foreground">Newsletter Subscribers</h2>
        <span className="text-sm text-muted-foreground">{subscribers?.length ?? 0} total</span>
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
