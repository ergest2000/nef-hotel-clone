import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthLog {
  id: string;
  user_email: string;
  event_type: string;
  metadata: Record<string, any>;
  created_at: string;
}

const eventLabels: Record<string, string> = {
  login: "Login",
  password_reset_request: "Password Reset Request",
  password_reset_complete: "Password Reset Complete",
  register: "Registration",
};

const eventColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  login: "default",
  password_reset_request: "secondary",
  password_reset_complete: "outline",
  register: "default",
};

export const AdminAuthLogs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["auth-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auth_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as AuthLog[];
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      const ids = logs.map((l) => l.id);
      if (!ids.length) return;
      const { error } = await supabase.from("auth_logs").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-logs"] });
      toast({ title: "Loget u pastruan!" });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Auth Logs ({logs.length})</h2>
        <Button variant="outline" size="sm" onClick={() => clearMutation.mutate()} disabled={!logs.length}>
          <Trash2 className="h-4 w-4 mr-2" /> Pastro Loget
        </Button>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lloji</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Detaje</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nuk ka loge.</TableCell></TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant={eventColors[log.event_type] || "outline"} className="text-[10px]">
                      {eventLabels[log.event_type] || log.event_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.user_email}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.metadata && Object.keys(log.metadata).length > 0
                      ? Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(log.created_at).toLocaleString("sq-AL")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
