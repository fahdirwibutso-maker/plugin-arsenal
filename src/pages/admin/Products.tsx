import { useState, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const Products = () => {
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
    
    if (error) throw new Error(`Image upload failed: ${error.message}`);
    
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  };

  const deleteImage = async (imageUrl: string) => {
    if (!imageUrl) return;
    try {
      const parts = imageUrl.split("/product-images/");
      if (parts.length < 2) return;
      const fileName = parts[1];
      await supabase.storage.from("product-images").remove([fileName]);
    } catch {
      // non-critical, ignore
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (product: any) => {
      // Delete image from storage first
      if (product.image) {
        await deleteImage(product.image);
      }
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product-count"] });
      toast.success("Product deleted successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete product"),
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setUploading(true);
      let imageUrl = editingProduct?.image || "";

      if (imageFile) {
        // If editing and replacing image, delete old one
        if (editingProduct?.image) {
          await deleteImage(editingProduct.image);
        }
        imageUrl = await uploadImage(imageFile);
      }

      const productData = {
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || null,
        price: parseFloat(formData.get("price") as string),
        wholesale_price: formData.get("wholesalePrice") ? parseFloat(formData.get("wholesalePrice") as string) : null,
        stock: parseInt(formData.get("stock") as string) || 0,
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
      queryClient.invalidateQueries({ queryKey: ["admin-product-count"] });
      toast.success(editingProduct ? "Product updated" : "Product added");
      resetDialog();
    },
    onError: (err: any) => toast.error(err.message || "Failed to save product"),
    onSettled: () => setUploading(false),
  });

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveMutation.mutate(new FormData(e.currentTarget));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetDialog = () => {
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
    setIsDialogOpen(false);
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
          <h1 className="text-2xl sm:text-3xl font-bold">Product Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); else setIsDialogOpen(true); }}>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={editingProduct?.description || ""} rows={3} />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" defaultValue={editingProduct?.category} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Retail Price (FRw)</Label>
                    <Input id="price" name="price" type="number" step="1" min="0" defaultValue={editingProduct?.price} required />
                  </div>
                  <div>
                    <Label htmlFor="wholesalePrice">Wholesale Price (FRw)</Label>
                    <Input id="wholesalePrice" name="wholesalePrice" type="number" step="1" min="0" defaultValue={editingProduct?.wholesale_price} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" name="stock" type="number" min="0" defaultValue={editingProduct?.stock ?? 0} required />
                </div>
                <div>
                  <Label>Product Image</Label>
                  <div className="mt-2 space-y-3">
                    {imagePreview ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-secondary flex items-center justify-center">
                        <ImageOff className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      {imagePreview ? "Change Image" : "Upload Image"}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={saveMutation.isPending || uploading}>
                  {saveMutation.isPending || uploading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No products yet. Add your first product above.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="hidden md:table-cell">Wholesale</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ImageOff className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[120px] truncate">{product.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{product.category}</TableCell>
                      <TableCell>{Number(product.price).toLocaleString()} FRw</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.wholesale_price ? `${Number(product.wholesale_price).toLocaleString()} FRw` : "—"}
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="icon" onClick={() => openEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this product?")) {
                                deleteMutation.mutate(product);
                              }
                            }}
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
