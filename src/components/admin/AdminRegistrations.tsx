import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Registration {
  id: string;
  data: Record<string, string>;
  created_at: string;
}

export const AdminRegistrations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Registration | null>(null);

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ["registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Registration[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast({ title: "Regjistrimi u fshi!" });
    },
  });

  const exportCSV = () => {
    if (!registrations.length) return;
    const allKeys = new Set<string>();
    registrations.forEach((r) => Object.keys(r.data).forEach((k) => allKeys.add(k)));
    const headers = ["Data", ...Array.from(allKeys)];
    const rows = registrations.map((r) => [
      new Date(r.created_at).toLocaleDateString("sq-AL"),
      ...Array.from(allKeys).map((k) => `"${(r.data[k] || "").replace(/"/g, '""')}"`),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Registrations ({registrations.length})</h2>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={!registrations.length}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lloji</TableHead>
              <TableHead>Emri</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefoni</TableHead>
              <TableHead>Biznesi/Qyteti</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[100px]">Veprime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nuk ka regjistrime.</TableCell></TableRow>
            ) : (
              registrations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.data.business || "—"}</TableCell>
                  <TableCell>{r.data.fullName || "—"}</TableCell>
                  <TableCell>{r.data.email || "—"}</TableCell>
                  <TableCell>{r.data.phone || "—"}</TableCell>
                  <TableCell>{r.data.city || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(r.created_at).toLocaleDateString("sq-AL")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(r)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detajet e Regjistrimit</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              {Object.entries(selected.data).map(([key, val]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{key}</p>
                  <p className="text-sm text-foreground">{val || "—"}</p>
                </div>
              ))}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Data</p>
                <p className="text-sm text-foreground">{new Date(selected.created_at).toLocaleString("sq-AL")}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
