import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Eye, ShieldBan, ShieldCheck, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface UserItem {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  email_confirmed_at: string | null;
  profile: {
    full_name: string;
    business_name: string;
    phone: string;
    country: string;
    city: string;
  } | null;
  roles: string[];
}

const ROLE_OPTIONS = [
  { value: "user", label: "Client" },
  { value: "editor", label: "Editor" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  editor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  user: "bg-muted text-muted-foreground",
};

export const AdminUsers = () => {
  const { toast } = useToast();
  const { role: myRole } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<UserItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const callApi = async (body: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Action failed");
    }
    return res.json();
  };

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const json = await callApi({ action: "list" });
      return json.users as UserItem[];
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => callApi(body),
    onSuccess: (_, body) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      const action = body.action as string;
      const msgs: Record<string, string> = {
        ban: "Përdoruesi u bllokua!",
        unban: "Përdoruesi u aktivizua!",
        delete: "Përdoruesi u fshi!",
        set_role: "Roli u ndryshua!",
      };
      toast({ title: msgs[action] || "Sukses!" });
      setConfirmDelete(null);
    },
    onError: (e: Error) => {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    },
  });

  const getUserRole = (u: UserItem) => u.roles[0] || "user";
  const isBanned = (u: UserItem) => u.banned_until ? new Date(u.banned_until) > new Date() : false;
  const canManageRoles = myRole === "admin";

  const exportCSV = () => {
    if (!users.length) return;
    const headers = ["Email", "Full Name", "Business", "Country", "City", "Phone", "Role", "Status", "Registered", "Last Login"];
    const rows = users.map((u) => [
      u.email,
      u.profile?.full_name || "",
      u.profile?.business_name || "",
      u.profile?.country || "",
      u.profile?.city || "",
      u.profile?.phone || "",
      getUserRole(u),
      isBanned(u) ? "Blocked" : "Active",
      new Date(u.created_at).toLocaleDateString("sq-AL"),
      u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("sq-AL") : "Never",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Users ({users.length})</h2>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={!users.length}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Emri</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Biznesi</TableHead>
              <TableHead>Roli</TableHead>
              <TableHead>Statusi</TableHead>
              <TableHead>Regjistrimi</TableHead>
              <TableHead className="w-[120px]">Veprime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nuk ka përdorues.</TableCell></TableRow>
            ) : (
              users.map((u) => {
                const banned = isBanned(u);
                const userRole = getUserRole(u);
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.profile?.full_name || "—"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.profile?.business_name || "—"}</TableCell>
                    <TableCell>
                      {canManageRoles ? (
                        <Select
                          value={userRole}
                          onValueChange={(val) => actionMutation.mutate({ action: "set_role", userId: u.id, role: val })}
                        >
                          <SelectTrigger className="h-7 w-[110px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((r) => (
                              <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={`text-[10px] ${ROLE_COLORS[userRole] || ROLE_COLORS.user}`}>
                          {ROLE_OPTIONS.find((r) => r.value === userRole)?.label || "Client"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={banned ? "destructive" : "default"} className="text-[10px]">
                        {banned ? "Blocked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString("sq-AL")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(u)} title="Shiko">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {banned ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => actionMutation.mutate({ action: "unban", userId: u.id })} title="Aktivizo">
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-orange-500" onClick={() => actionMutation.mutate({ action: "ban", userId: u.id })} title="Blloko">
                            <ShieldBan className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {canManageRoles && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setConfirmDelete(u.id)} title="Fshi">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detajet e Përdoruesit</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p><p className="text-sm">{selected.email}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Emri</p><p className="text-sm">{selected.profile?.full_name || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Biznesi</p><p className="text-sm">{selected.profile?.business_name || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Telefoni</p><p className="text-sm">{selected.profile?.phone || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vendi</p><p className="text-sm">{selected.profile?.country || "—"}, {selected.profile?.city || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Roli</p><p className="text-sm font-medium">{ROLE_OPTIONS.find((r) => r.value === getUserRole(selected))?.label || "Client"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Statusi</p><p className="text-sm">{isBanned(selected) ? "🔴 Blocked" : "🟢 Active"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Regjistruar më</p><p className="text-sm">{new Date(selected.created_at).toLocaleString("sq-AL")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Login i fundit</p><p className="text-sm">{selected.last_sign_in_at ? new Date(selected.last_sign_in_at).toLocaleString("sq-AL") : "Asnjëherë"}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Konfirmo Fshirjen</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Jeni i sigurt që dëshironi ta fshini këtë përdorues? Ky veprim nuk mund të kthehet.</p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Anulo</Button>
            <Button variant="destructive" onClick={() => confirmDelete && actionMutation.mutate({ action: "delete", userId: confirmDelete })}>
              Fshi Përdoruesin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
