import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF } from "@/lib/exportPdf";

interface Registration {
  id: string;
  data: Record<string, string>;
  created_at: string;
}

function regToFields(r: Registration) {
  var d = r.data;
  var fields: { label: string; value: string }[] = [];
  if (d.fullName || d.full_name) fields.push({ label: "Emri", value: d.fullName || d.full_name || "" });
  if (d.business) fields.push({ label: "Biznesi", value: d.business });
  if (d.email) fields.push({ label: "Email", value: d.email });
  if (d.phone) fields.push({ label: "Telefoni", value: d.phone });
  if (d.city) fields.push({ label: "Qyteti", value: d.city });
  if (d.message) fields.push({ label: "Mesazhi", value: d.message });
  if (d.type) fields.push({ label: "Lloji", value: d.type });
  fields.push({ label: "Data", value: new Date(r.created_at).toLocaleString("sq-AL") });
  return fields;
}

export const AdminRegistrations = function () {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Registration | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ["registrations"],
    queryFn: async function () {
      const { data, error } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Registration[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async function (id: string) {
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: function () {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast({ title: "Regjistrimi u fshi!" });
      setDeleteId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-sm font-semibold text-foreground mb-2">Jeni i sigurt?</h3>
            <p className="text-xs text-muted-foreground mb-4">Ky veprim nuk mund të kthehet mbrapa.</p>
            <div className="flex gap-3">
              <button onClick={function () { setDeleteId(null); }} className="flex-1 px-4 py-2 text-xs border border-border rounded hover:bg-muted transition-colors">Anulo</button>
              <button onClick={function () { deleteMutation.mutate(deleteId); }} disabled={deleteMutation.isPending} className="flex-1 px-4 py-2 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors">
                {deleteMutation.isPending ? "..." : "Fshi"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Regjistrimet ({registrations.length})</h2>
        {registrations.length > 0 && (
          <Button variant="outline" size="sm" onClick={function () { exportToPDF("Regjistrimet", registrations.map(regToFields)); }}>
            <Download className="h-4 w-4 mr-2" /> Shkarko PDF
          </Button>
        )}
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
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nuk ka regjistrime.</TableCell>
              </TableRow>
            ) : (
              registrations.map(function (r) {
                var badgeClass = "bg-muted text-muted-foreground";
                if (r.data.type === "newsletter") badgeClass = "bg-blue-100 text-blue-800";
                if (r.data.type === "contact") badgeClass = "bg-amber-100 text-amber-800";
                if (r.data.type === "offer_request") badgeClass = "bg-green-100 text-green-800";
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <span className={"text-[10px] px-2 py-0.5 rounded uppercase tracking-wide " + badgeClass}>
                        {r.data.type || "register"}
                      </span>
                    </TableCell>
                    <TableCell>{r.data.fullName || r.data.full_name || "—"}</TableCell>
                    <TableCell>{r.data.email || "—"}</TableCell>
                    <TableCell>{r.data.phone || "—"}</TableCell>
                    <TableCell>{r.data.business || r.data.city || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Date(r.created_at).toLocaleDateString("sq-AL")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={function () { setSelected(r); }}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={function () { setDeleteId(r.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={selected !== null} onOpenChange={function () { setSelected(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detajet e Regjistrimit</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              {Object.entries(selected.data).map(function (entry) {
                return (
                  <div key={entry[0]}>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{entry[0]}</p>
                    <p className="text-sm text-foreground whitespace-pre-line">{entry[1] || "—"}</p>
                  </div>
                );
              })}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Data</p>
                <p className="text-sm text-foreground">{new Date(selected.created_at).toLocaleString("sq-AL")}</p>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={function () { exportToPDF("Regjistrim", [regToFields(selected)]); }}>
                <Download className="h-4 w-4 mr-2" /> Shkarko PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
