import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Store as StoreIcon, Package, ShoppingBag, Banknote, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useMyStores } from "@/hooks/useStores";
import StoreSettings from "@/components/owner/StoreSettings";
import StoreOrders, { useStoreOrders } from "@/components/owner/StoreOrders";
import { storeSubtotal, validateProduct } from "@/lib/storeOwner";

type ProductDraft = { id?: string; name: string; price: number; stock: number; category: string; unit: string; image: string; description: string | null; wholesale_price: number | null; min_wholesale_qty: number | null; is_active: boolean };
const blank: ProductDraft = { name:'',price:0,stock:0,category:'General',unit:'piece',image:'',description:'',wholesale_price:null,min_wholesale_qty:null,is_active:true };
const MyStore = () => {
  const qc=useQueryClient();
  const {data:stores=[],isLoading,user,error,authError,refetch}=useMyStores();
  const [storeId,setStoreId]=useState<string|null>(null);
  const active=stores.find(s=>s.id===storeId)??stores[0];
  const [editing,setEditing]=useState<ProductDraft|null>(null);
  const [file,setFile]=useState<File|null>(null);
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all');
  const {data:products=[],isLoading:productsLoading,error:productsError}=useQuery({queryKey:['my-store-products',user?.id,active?.id],enabled:!!active,queryFn:async()=>{
    if(!active)return []; const {data,error}=await supabase.from('products').select('*').eq('store_id',active.id).order('created_at',{ascending:false}); if(error)throw error; return data;
  }});
  const {data:orders=[]}=useStoreOrders(active?.id);
  const refresh=()=>{['my-store-products','products','store-products'].forEach(key=>qc.invalidateQueries({queryKey:[key]}));};
  const save=useMutation({mutationFn:async(p:ProductDraft)=>{
    if(!active)throw new Error('Select a store first');
    if(!p.name.trim())throw new Error('Product name is required');
    validateProduct(Number(p.price),Number(p.stock));
    let image=p.image;
    let uploaded:string|null=null;
    if(file){const path=`${active.id}/${crypto.randomUUID()}.${file.name.split('.').pop()||'jpg'}`;const {error}=await supabase.storage.from('product-images').upload(path,file);if(error)throw error;uploaded=path;image=supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;}
    if(!image)throw new Error('Please add a product photo');
    const row={name:p.name.trim(),price:Number(p.price),stock:Number(p.stock),category:p.category,unit:p.unit,image,description:p.description,is_active:p.is_active,wholesale_price:p.wholesale_price===null?null:Number(p.wholesale_price),min_wholesale_qty:p.min_wholesale_qty,store_id:active.id};
    const result=p.id?await supabase.from('products').update(row).eq('id',p.id).eq('store_id',active.id).select('id').single():await supabase.from('products').insert(row).select('id').single();
    if(result.error){if(uploaded)await supabase.storage.from('product-images').remove([uploaded]);throw result.error;}
  },onSuccess:()=>{toast.success('Product saved');setEditing(null);setFile(null);refresh();},onError:(e:Error)=>toast.error(e.message)});
  const remove=useMutation({mutationFn:async(id:string)=>{if(!active)throw new Error('Select a store');const {error}=await supabase.from('products').delete().eq('id',id).eq('store_id',active.id).select('id').single();if(error)throw error;},onSuccess:()=>{toast.success('Product deleted');refresh();},onError:(e:Error)=>toast.error(e.message.includes('foreign key')?'This product has order history. Hide it instead to preserve receipts.':e.message)});
  const visibility=useMutation({mutationFn:async({id,visible}:{id:string;visible:boolean})=>{if(!active)throw new Error('Select a store');const {error}=await supabase.from('products').update({is_active:visible}).eq('id',id).eq('store_id',active.id).select('id').single();if(error)throw error;},onSuccess:refresh,onError:(e:Error)=>toast.error(e.message)});
  const shown=products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())&&(filter==='all'||filter==='visible'&&p.is_active||filter==='hidden'&&!p.is_active||filter==='out'&&p.stock===0));
  const field=(key:'name'|'price'|'stock'|'category'|'unit'|'wholesale_price',label:string,numeric=false)=><div className="space-y-2"><Label htmlFor={`product-${key}`}>{label}</Label><Input id={`product-${key}`} required={key!=='wholesale_price'} min={numeric?0:undefined} step={key==='stock'?1:'any'} type={numeric?'number':'text'} value={editing?.[key]??''} onChange={e=>{if(editing)setEditing({...editing,[key]:numeric?(e.target.value===''&&key==='wholesale_price'?null:Number(e.target.value)):e.target.value});}}/></div>;
  return <div className="min-h-screen bg-background pb-20"><Header/><main className="container py-6 space-y-6">
    {isLoading?<p className="text-muted-foreground">Loading your stores…</p>:authError||error?<div className="space-y-3"><p className="text-destructive">{authError||'Unable to load your stores.'}</p><Button onClick={()=>refetch()}>Retry</Button></div>:!user?<div className="py-16 text-center space-y-4"><StoreIcon className="mx-auto h-12 w-12 text-primary"/><h1 className="text-2xl font-bold">Store owner sign in</h1><Button asChild><Link to="/auth">Sign in</Link></Button></div>:!active?<div className="py-16 text-center space-y-3"><StoreIcon className="mx-auto h-12 w-12 text-muted-foreground"/><h1 className="text-xl font-semibold">No store assigned</h1><p className="text-muted-foreground">An admin can assign your account from Admin → Stores.</p><Button variant="outline" asChild><Link to="/stores">Our Stores</Link></Button></div>:<>
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-primary font-medium">Owner dashboard</p><h1 className="text-2xl font-bold">{active.name}</h1></div><div className="flex flex-wrap gap-2">{stores.length>1&&<Select value={active.id} onValueChange={id=>{setStoreId(id);setEditing(null);setFile(null);}}><SelectTrigger aria-label="Select your store" className="w-48"><SelectValue/></SelectTrigger><SelectContent>{stores.map(s=><SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>}<Button variant="outline" asChild><Link to={`/store/${active.slug}`}><ExternalLink className="h-4 w-4 mr-2"/>View store</Link></Button></div></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[{label:'Products',value:products.length,icon:Package},{label:'Visible products',value:products.filter(p=>p.is_active).length,icon:StoreIcon},{label:'Store orders',value:orders.length,icon:ShoppingBag},{label:'Ordered merchandise',value:`${orders.filter(o=>o.status!=='cancelled').reduce((n,o)=>n+storeSubtotal(o),0).toLocaleString()} FRw`,icon:Banknote}].map(({label,value,icon:Icon})=><div key={label} className="border rounded-md p-4 space-y-2"><div className="flex items-center justify-between gap-2 text-muted-foreground"><span className="text-sm">{label}</span><Icon className="h-4 w-4 shrink-0"/></div><p className="text-xl font-semibold break-words">{value}</p></div>)}</div>
    <Tabs defaultValue="products" key={active.id}><TabsList className="w-full sm:w-auto"><TabsTrigger value="products">Products & stock</TabsTrigger><TabsTrigger value="orders">Orders</TabsTrigger><TabsTrigger value="settings">Store settings</TabsTrigger></TabsList>
    <TabsContent value="products" className="py-4 space-y-4"><div className="flex flex-wrap gap-3"><Input aria-label="Search products" placeholder="Search products" className="max-w-sm" value={search} onChange={e=>setSearch(e.target.value)}/><Select value={filter} onValueChange={setFilter}><SelectTrigger aria-label="Filter products" className="w-40"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All products</SelectItem><SelectItem value="visible">Visible</SelectItem><SelectItem value="hidden">Hidden</SelectItem><SelectItem value="out">Out of stock</SelectItem></SelectContent></Select><Button className="sm:ml-auto" onClick={()=>{setEditing({...blank});setFile(null);}}><Plus className="h-4 w-4 mr-2"/>Add product</Button></div>
    {productsError?<p className="text-destructive">Unable to load products.</p>:productsLoading?<p>Loading products…</p>:<div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Retail / wholesale</TableHead><TableHead>Stock</TableHead><TableHead>Visible</TableHead><TableHead/></TableRow></TableHeader><TableBody>{shown.map(p=><TableRow key={p.id}><TableCell><div className="flex items-center gap-3 min-w-44"><img src={p.image} alt={p.name} width={48} height={48} className="h-12 w-12 rounded object-cover"/><div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.category} · {p.unit}</p></div></div></TableCell><TableCell className="whitespace-nowrap"><p>{Number(p.price).toLocaleString()} FRw</p>{p.wholesale_price!==null&&<p className="text-xs text-muted-foreground">{Number(p.wholesale_price).toLocaleString()} FRw wholesale</p>}</TableCell><TableCell><Badge variant={p.stock===0?'destructive':'outline'}>{p.stock}</Badge></TableCell><TableCell><Switch aria-label={`Show ${p.name} in shop`} checked={p.is_active} disabled={visibility.isPending} onCheckedChange={visible=>visibility.mutate({id:p.id,visible})}/></TableCell><TableCell className="whitespace-nowrap"><Button size="icon" variant="ghost" aria-label={`Edit ${p.name}`} onClick={()=>{setEditing(p);setFile(null);}}><Pencil className="h-4 w-4"/></Button><Button size="icon" variant="ghost" aria-label={`Delete ${p.name}`} onClick={()=>{if(confirm(`Delete ${p.name}?`))remove.mutate(p.id);}} disabled={remove.isPending}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell></TableRow>)}{!shown.length&&<TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">No products found</TableCell></TableRow>}</TableBody></Table></div>}</TabsContent>
    <TabsContent value="orders"><StoreOrders storeId={active.id}/></TabsContent><TabsContent value="settings"><StoreSettings key={active.id} store={active}/></TabsContent></Tabs></>}
    </main><Dialog open={!!editing} onOpenChange={o=>{if(!o){setEditing(null);setFile(null);}}}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing?.id?'Edit product':'Add product'}</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={e=>{e.preventDefault();if(editing)save.mutate(editing);}}>{field('name','Name')}<div className="grid grid-cols-2 gap-3">{field('price','Retail price (FRw)',true)}{field('stock','Stock',true)}{field('category','Category')}{field('unit','Selling unit')}</div>{field('wholesale_price','Wholesale price (FRw)',true)}<div className="space-y-2"><Label htmlFor="product-description">Description</Label><Textarea id="product-description" value={editing?.description??''} onChange={e=>{if(editing)setEditing({...editing,description:e.target.value});}}/></div><div className="space-y-2"><Label htmlFor="product-photo">Photo</Label>{editing?.image&&<img src={editing.image} alt={editing.name} width={96} height={96} className="h-24 w-24 rounded object-cover"/>}<Input id="product-photo" type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]??null)}/></div><div className="flex items-center gap-3"><Switch id="product-visible" checked={editing?.is_active??true} onCheckedChange={is_active=>{if(editing)setEditing({...editing,is_active});}}/><Label htmlFor="product-visible">Visible in shop</Label></div><Button type="submit" className="w-full" disabled={save.isPending}>{save.isPending?'Saving…':'Save product'}</Button></form></DialogContent></Dialog></div>;
};
export default MyStore;
