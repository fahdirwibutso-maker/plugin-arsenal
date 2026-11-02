import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Store } from "@/hooks/useStores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function StoreSettings({ store }: { store: Store }) {
  const [draft, setDraft] = useState(store);
  const [logo, setLogo] = useState<File | null>(null);
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: async () => {
      let image = draft.logo;
      if (logo) {
        const path = `${store.id}/${crypto.randomUUID()}.${logo.name.split(".").pop()}`;
        const { error } = await supabase.storage.from("product-images").upload(path, logo);
        if (error) throw error;
        image = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("stores").update({ name: draft.name.trim(), description: draft.description, location: draft.location, phone: draft.phone, opening_hours: draft.opening_hours, map_url: draft.map_url || null, logo: image, is_active: draft.is_active }).eq("id", store.id).select("id").single();
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Store details saved"); qc.invalidateQueries({ queryKey: ["my-stores"] }); qc.invalidateQueries({ queryKey: ["stores"] }); qc.invalidateQueries({ queryKey: ["store"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return <form className="max-w-3xl space-y-5 py-5" onSubmit={e => { e.preventDefault(); save.mutate(); }}>
    <h2 className="text-lg font-semibold">Store details</h2>
    <div className="grid gap-4 sm:grid-cols-2">{([['name','Store name'],['location','Address'],['phone','Phone'],['opening_hours','Opening hours'],['map_url','Map link']] as const).map(([key,label]) => <div key={key} className="space-y-2"><Label htmlFor={`store-${key}`}>{label}</Label><Input id={`store-${key}`} required={key==='name'} type={key==='map_url'?'url':'text'} value={draft[key] ?? ''} onChange={e=>setDraft({...draft,[key]:e.target.value})}/></div>)}</div>
    <div className="space-y-2"><Label htmlFor="store-description">Description</Label><Textarea id="store-description" value={draft.description ?? ''} onChange={e=>setDraft({...draft,description:e.target.value})}/></div>
    <div className="space-y-2"><Label htmlFor="store-logo">Store logo</Label>{draft.logo && <img src={draft.logo} alt={draft.name} width={80} height={80} className="h-20 w-20 rounded object-cover"/>}<Input id="store-logo" type="file" accept="image/*" onChange={e=>setLogo(e.target.files?.[0]??null)}/></div>
    <div className="flex items-center gap-3"><Switch id="store-open" checked={draft.is_active} onCheckedChange={v=>setDraft({...draft,is_active:v})}/><Label htmlFor="store-open">Listed on Our Stores</Label></div>
    <Button type="submit" disabled={save.isPending}>{save.isPending?'Saving…':'Save store details'}</Button>
  </form>;
}