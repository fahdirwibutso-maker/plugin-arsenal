import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { defaultSettings, type SiteSettings } from "@/lib/siteSettings";
import { logAudit } from "@/lib/audit";

type Key = keyof SiteSettings;

export default function AdminSettings() {
  const { settings, isLoading } = useSiteSettings();
  const [d, setD] = useState<SiteSettings>(settings);
  const qc = useQueryClient();
  useEffect(() => { if (!isLoading) setD(settings); }, [isLoading, settings]);

  const upload = async (file: File, key: "logoUrl" | "heroImage") => {
    const path = `site/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) return toast.error(error.message);
    setD(prev => ({ ...prev, [key]: supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl }));
    toast.success("Image uploaded — remember to save");
  };

  const save = useMutation({
    mutationFn: async () => {
      const data = { ...d, shippingFee: Number(d.shippingFee) || 0, freeShippingOver: Number(d.freeShippingOver) || 0 };
      const { error } = await supabase.from("site_settings").upsert({ id: "main", data });
      if (error) throw error;
      await logAudit?.({ action: "settings.update", entityType: "site_settings", entityId: "main", description: "Updated website settings" } as any).catch?.(() => {});
    },
    onSuccess: () => { toast.success("Website settings saved"); qc.invalidateQueries({ queryKey: ["site-settings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const f = (k: Key, label: string, opts: { type?: string; multi?: boolean; placeholder?: string } = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`s-${k}`}>{label}</Label>
      {opts.multi
        ? <Textarea id={`s-${k}`} value={String(d[k] ?? "")} onChange={e => setD({ ...d, [k]: e.target.value })} />
        : <Input id={`s-${k}`} type={opts.type ?? "text"} placeholder={opts.placeholder} value={String(d[k] ?? "")} onChange={e => setD({ ...d, [k]: opts.type === "number" ? Number(e.target.value) : e.target.value })} />}
    </div>
  );
  const img = (k: "logoUrl" | "heroImage", label: string) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {d[k] && <img src={d[k]} alt={label} className="h-20 rounded object-cover" />}
      <div className="flex gap-2">
        <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload(e.target.files[0], k)} />
        {d[k] && <Button type="button" variant="outline" onClick={() => setD({ ...d, [k]: "" })}>Remove</Button>}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <form className="p-4 max-w-3xl space-y-4" onSubmit={e => { e.preventDefault(); save.mutate(); }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Website settings</h1>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setD(defaultSettings)}>Reset to defaults</Button>
            <Button type="submit" disabled={save.isPending || isLoading}>{save.isPending ? "Saving…" : "Save settings"}</Button>
          </div>
        </div>
        <Tabs defaultValue="shop">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="shop">Shop & contact</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="social">Social media</TabsTrigger>
            <TabsTrigger value="home">Homepage</TabsTrigger>
          </TabsList>
          <TabsContent value="shop" className="grid sm:grid-cols-2 gap-4 pt-3">
            {f("shopName", "Shop name")}{f("phone", "Phone")}{f("email", "Email", { type: "email" })}{f("whatsapp", "WhatsApp number")}
            <div className="sm:col-span-2">{f("address", "Address")}</div>
            <div className="sm:col-span-2">{f("tagline", "Short description (footer)", { multi: true })}</div>
            <div className="sm:col-span-2">{img("logoUrl", "Logo")}</div>
          </TabsContent>
          <TabsContent value="delivery" className="grid sm:grid-cols-2 gap-4 pt-3">
            {f("shippingFee", "Delivery fee (FRw)", { type: "number" })}
            {f("freeShippingOver", "Free delivery above (FRw)", { type: "number" })}
            <p className="sm:col-span-2 text-sm text-muted-foreground">Used in the cart and at checkout.</p>
          </TabsContent>
          <TabsContent value="social" className="grid sm:grid-cols-2 gap-4 pt-3">
            {f("facebook", "Facebook link", { placeholder: "https://facebook.com/…" })}
            {f("instagram", "Instagram link", { placeholder: "https://instagram.com/…" })}
            {f("twitter", "X / Twitter link")}{f("tiktok", "TikTok link")}
          </TabsContent>
          <TabsContent value="home" className="grid gap-4 pt-3">
            <div className="flex items-center gap-3"><Switch id="ann" checked={d.announcementOn} onCheckedChange={v => setD({ ...d, announcementOn: v })} /><Label htmlFor="ann">Show announcement bar at the top</Label></div>
            {f("announcement", "Announcement text", { placeholder: "e.g. Free delivery this weekend!" })}
            <div className="grid sm:grid-cols-2 gap-4">{f("heroTitle", "Banner headline")}{f("heroSubtitle", "Banner second line")}</div>
            {f("heroText", "Banner text", { multi: true })}
            {img("heroImage", "Banner photo (leave empty for the default slideshow)")}
          </TabsContent>
        </Tabs>
      </form>
    </AdminLayout>
  );
}
