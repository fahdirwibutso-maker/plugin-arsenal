import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useMyStores } from "@/hooks/useStores";

type P = {
  id?: string; name?: string; price?: number; wholesale_price?: number | null; min_wholesale_qty?: number | null;
  category?: string; unit?: string; stock?: number; image?: string; description?: string | null; is_active?: boolean; store_id?: string | null;
};

const MyStore = () => {
  const qc = useQueryClient();
  const { data: stores = [], isLoading } = useMyStores();
  const [storeId, setStoreId] = useState<string | null>(null);
  const active = stores.find((s) => s.id === storeId) ?? stores[0];
  const [editing, setEditing] = useState<P | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["my-store-products", active?.id],
    enabled: !!active,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("store_id", active!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const refresh = () => { qc.invalidateQueries({ queryKey: ["my-store-products"] }); qc.invalidateQueries({ queryKey: ["products"] }); };

  const save = useMutation({
    mutationFn: async (p: P) => {
      let image = p.image || "";
      if (file) {
        const name = `${active!.id}/${Date.now()}.${file.name.split(".").pop() || "jpg"}`;
        const { error } = await supabase.storage.from("product-images").upload(name, file);
        if (error) throw error;
        image = supabase.storage.from("product-images").getPublicUrl(name).data.publicUrl;
      }
      if (!image) throw new Error("Please add a product photo");
      const row = {
        name: p.name!, price: Number(p.price) || 0, category: p.category || "General", unit: p.unit || "piece",
        stock: Number(p.stock) || 0, image, description: p.description || null, is_active: p.is_active ?? true,
        wholesale_price: p.wholesale_price ? Number(p.wholesale_price) : null,
        min_wholesale_qty: p.min_wholesale_qty ? Number(p.min_wholesale_qty) : null,
        store_id: active!.id,
      };
      const { error } = p.id ? await supabase.from("products").update(row).eq("id", p.id) : await supabase.from("products").insert(row);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Product saved"); setEditing(null); setFile(null); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("products").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Product deleted"); refresh(); },
    onError: (e: any) => toast.error(e.message),
  });

  const f = (k: keyof P, label: string, type = "text") => (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={(editing?.[k] as any) ?? ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container py-6 space-y-4">
        {isLoading ? <p className="text-muted-foreground">Loading…</p> : !active ? (
          <Card><CardContent className="py-10 text-center space-y-2">
            <StoreIcon className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-semibold">You don't own a store yet</p>
            <p className="text-sm text-muted-foreground">Ask the WellarShop team to set you as a store owner. <Link to="/stores" className="text-primary">Browse stores</Link></p>
          </CardContent></Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold">{active.name}</h1>
                <p className="text-sm text-muted-foreground">{products.length} products · changes go live instantly</p>
              </div>
              <div className="flex gap-2">
                {stores.length > 1 && (
                  <select className="bg-background border rounded-md px-2 text-sm" value={active.id} onChange={(e) => setStoreId(e.target.value)}>
                    {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}
                <Button onClick={() => setEditing({ is_active: true })}><Plus className="h-4 w-4 mr-1" />Add product</Button>
              </div>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">My products</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Active</TableHead><TableHead /></TableRow></TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="flex items-center gap-2"><img src={p.image} alt={p.name} className="h-10 w-10 rounded object-cover" />{p.name}</TableCell>
                        <TableCell>{Number(p.price).toLocaleString()} FRw</TableCell>
                        <TableCell>{p.stock}</TableCell>
                        <TableCell>{p.is_active ? "Yes" : "No"}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Button size="icon" variant="ghost" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => confirm(`Delete ${p.name}?`) && remove.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </main>
      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setFile(null); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit product" : "Add product"}</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (editing?.name) save.mutate(editing); }}>
            {f("name", "Name")}
            <div className="grid grid-cols-2 gap-2">{f("price", "Price (FRw)", "number")}{f("stock", "Stock", "number")}</div>
            <div className="grid grid-cols-2 gap-2">{f("category", "Category")}{f("unit", "Unit (e.g. kg, piece)")}</div>
            <div className="grid grid-cols-2 gap-2">{f("wholesale_price", "Wholesale price", "number")}{f("min_wholesale_qty", "Wholesale min qty", "number")}</div>
            <div><Label>Description</Label><Textarea value={editing?.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div><Label>Photo</Label><Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
            <div className="flex items-center gap-2"><Switch checked={editing?.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /><Label>Visible in shop</Label></div>
            <Button type="submit" className="w-full" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyStore;
