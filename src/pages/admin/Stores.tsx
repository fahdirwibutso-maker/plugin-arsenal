import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import type { Store } from "@/hooks/useStores";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const AdminStores = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Store> | null>(null);

  const { data: stores = [] } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("*").order("name");
      if (error) throw error;
      return data as Store[];
    },
  });
  const { data: counts = {} } = useQuery({
    queryKey: ["admin-store-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("store_id");
      const c: Record<string, number> = {};
      (data ?? []).forEach((p) => { if (p.store_id) c[p.store_id] = (c[p.store_id] || 0) + 1; });
      return c;
    },
  });

  const refresh = () => ["admin-stores", "stores", "admin-store-counts"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));

  const save = useMutation({
    mutationFn: async (s: Partial<Store>) => {
      const row = {
        name: s.name!, slug: s.slug || slugify(s.name!), logo: s.logo || null, description: s.description || null,
        location: s.location || null, map_url: s.map_url || null, phone: s.phone || null,
        opening_hours: s.opening_hours || null, is_active: s.is_active ?? true,
      };
      const { error } = s.id
        ? await supabase.from("stores").update(row).eq("id", s.id)
        : await supabase.from("stores").insert(row);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Store saved"); setEditing(null); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Store deleted"); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const field = (k: keyof Store, label: string, multiline = false) => (
    <div>
      <Label>{label}</Label>
      {multiline ? (
        <Textarea value={(editing?.[k] as string) ?? ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} />
      ) : (
        <Input value={(editing?.[k] as string) ?? ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} />
      )}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Stores</h1>
          <Button onClick={() => setEditing({ is_active: true })}><Plus className="h-4 w-4 mr-1" /> Add store</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead><TableHead>Location</TableHead><TableHead>Products</TableHead>
              <TableHead>Active</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.location ?? "—"}</TableCell>
                <TableCell>{counts[s.id] ?? 0}</TableCell>
                <TableCell>{s.is_active ? "Yes" : "No"}</TableCell>
                <TableCell className="space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm(`Delete ${s.name}?`) && remove.mutate(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit store" : "Add store"}</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (editing?.name) save.mutate(editing); }}>
            {field("name", "Name")}
            {field("slug", "Web address name (optional)")}
            {field("logo", "Logo image link")}
            {field("description", "Description", true)}
            {field("location", "Location")}
            {field("map_url", "Map link")}
            {field("phone", "Phone")}
            {field("opening_hours", "Opening hours")}
            <div className="flex items-center gap-2">
              <Switch checked={editing?.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              <Label>Active</Label>
            </div>
            <Button type="submit" className="w-full" disabled={save.isPending}>Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminStores;
