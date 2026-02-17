import { useState, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const Products = () => {
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted successfully");
    },
    onError: () => toast.error("Failed to delete product"),
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      let imageUrl = editingProduct?.image || "";

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const productData = {
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        wholesale_price: parseFloat(formData.get("wholesalePrice") as string) || null,
        stock: parseInt(formData.get("stock") as string),
        category: formData.get("category") as string,
        image: imageUrl,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(editingProduct ? "Product updated" : "Product added");
      setIsDialogOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview(null);
    },
    onError: () => toast.error("Failed to save product"),
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveMutation.mutate(new FormData(e.currentTarget));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setImageFile(null);
    setImagePreview(product.image || null);
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" defaultValue={editingProduct?.name} required />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" defaultValue={editingProduct?.category} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Retail Price (FRw)</Label>
                    <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
                  </div>
                  <div>
                    <Label htmlFor="wholesalePrice">Wholesale Price (FRw)</Label>
                    <Input id="wholesalePrice" name="wholesalePrice" type="number" step="0.01" defaultValue={editingProduct?.wholesale_price} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" name="stock" type="number" defaultValue={editingProduct?.stock ?? 0} required />
                </div>
                <div>
                  <Label>Product Image</Label>
                  <div className="mt-2 space-y-3">
                    {imagePreview && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      {imagePreview ? "Change Image" : "Upload Image"}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : editingProduct ? "Update" : "Add"} Product
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Retail Price</TableHead>
                    <TableHead>Wholesale Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-secondary">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.price.toFixed(0)} FRw</TableCell>
                      <TableCell>{product.wholesale_price ? `${product.wholesale_price.toFixed(0)} FRw` : "—"}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => openEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteMutation.mutate(product.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Products;
