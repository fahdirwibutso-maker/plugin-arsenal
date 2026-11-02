import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fulfillmentStatuses, storeSubtotal, type StoreOrder } from "@/lib/storeOwner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";

export const useStoreOrders = (id?: string) => useQuery({ queryKey: ['owner-orders', id], enabled: !!id, queryFn: async () => { if (!id) return []; const {data,error}=await supabase.rpc('get_store_orders',{_store_id:id}); if(error) throw error; return (data ?? []) as unknown as StoreOrder[]; }});
export default function StoreOrders({ storeId }: { storeId: string }) {
  const {data:orders=[],isLoading,error,refetch}=useStoreOrders(storeId);
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all');
  const [selected,setSelected]=useState<StoreOrder|null>(null);
  const qc=useQueryClient();
  const save=useMutation({mutationFn:async (order:StoreOrder)=>{
    const {error}=await supabase.from('store_order_activity').upsert({store_id:storeId,order_id:order.id,status:order.status,notes:order.notes},{onConflict:'store_id,order_id'}).select('id').single(); if(error) throw error;
  },onSuccess:()=>{toast.success('Store fulfillment updated'); qc.invalidateQueries({queryKey:['owner-orders',storeId]}); setSelected(null);},onError:(e:Error)=>toast.error(e.message)});
  const visible=orders.filter(o=>(filter==='all'||o.status===filter)&&`${o.id} ${o.phone_number??''} ${o.items.map(i=>i.name).join(' ')}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="space-y-4 py-5">
    <div className="flex flex-wrap gap-3"><Input aria-label="Search store orders" placeholder="Search order, phone or product" className="max-w-sm" value={search} onChange={e=>setSearch(e.target.value)}/><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-44" aria-label="Filter fulfillment"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All fulfillment</SelectItem>{fulfillmentStatuses.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
    {error?<div className="space-y-2"><p className="text-destructive">Unable to load orders.</p><Button variant="outline" onClick={()=>refetch()}>Retry</Button></div>:isLoading?<p className="text-muted-foreground">Loading orders…</p>:<div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Date</TableHead><TableHead>Store subtotal</TableHead><TableHead>Fulfillment</TableHead><TableHead>Payment</TableHead><TableHead/></TableRow></TableHeader><TableBody>{visible.map(o=><TableRow key={o.id}><TableCell className="font-mono">#{o.id.slice(0,8)}</TableCell><TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell><TableCell>{storeSubtotal(o).toLocaleString()} FRw</TableCell><TableCell><Badge variant="outline">{o.status}</Badge></TableCell><TableCell>{o.payment?.status??'No payment'}</TableCell><TableCell><Button size="icon" variant="ghost" aria-label={`View order ${o.id.slice(0,8)}`} onClick={()=>setSelected(o)}><Eye className="h-4 w-4"/></Button></TableCell></TableRow>)}{!visible.length&&<TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No store orders found</TableCell></TableRow>}</TableBody></Table></div>}
    <Dialog open={!!selected} onOpenChange={o=>{if(!o)setSelected(null);}}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Order #{selected?.id.slice(0,8)}</DialogTitle></DialogHeader>{selected&&<div className="space-y-4"><div className="text-sm space-y-1"><p>{selected.shipping_address||'No delivery address'}</p><p>{selected.phone_number||'No phone provided'}</p><p>Payment: {selected.payment?`${selected.payment.method} · ${selected.payment.status}`:'No payment recorded'}</p><p>Overall order: {selected.order_status}</p></div>{selected.items.map(i=><div key={i.id} className="flex items-center gap-3 border-b py-3"><img src={i.image} alt={i.name} width={48} height={48} className="h-12 w-12 rounded object-cover"/><div className="flex-1 min-w-0"><p className="font-medium break-words">{i.name}</p><p className="text-sm text-muted-foreground">{i.quantity} × {Number(i.unit_price).toLocaleString()} FRw · {i.pricing_type}</p></div><span className="text-sm">{Number(i.total_price).toLocaleString()} FRw</span></div>)}<p className="font-semibold">Store subtotal: {storeSubtotal(selected).toLocaleString()} FRw</p><Label>Store fulfillment</Label><Select value={selected.status} onValueChange={status=>setSelected({...selected,status})}><SelectTrigger aria-label="Store fulfillment status"><SelectValue/></SelectTrigger><SelectContent>{fulfillmentStatuses.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><Label htmlFor="fulfillment-notes">Store notes</Label><Textarea id="fulfillment-notes" value={selected.notes} onChange={e=>setSelected({...selected,notes:e.target.value})}/><Button disabled={save.isPending} onClick={()=>save.mutate(selected)}>{save.isPending?'Saving…':'Save fulfillment'}</Button></div>}</DialogContent></Dialog>
  </section>;
}