

## Plan: Seed Products, Fix Currency to FRw, and Add Image Upload

This plan covers three things: loading all 60 products into the database, replacing every dollar sign with Rwandan Francs (FRw), and creating a storage bucket so admins can upload product images.

---

### 1. Seed the Products Table

Insert all 60 products from `src/data/products.ts` into the database `products` table using the data insert tool. Each product will include name, price, image URL, category, stock (default 100), and a wholesale price (80% of retail).

### 2. Update All Pages to Load Products from the Database

**Files to update:**
- `src/pages/Shop.tsx` -- Fetch products from the database instead of importing from `src/data/products.ts`
- `src/pages/Index.tsx` -- Fetch featured products from the database
- `src/components/ProductCard.tsx` -- Accept UUID `id` instead of numeric `id`
- `src/components/SearchAutocomplete.tsx` -- Fetch products from the database for search suggestions
- `src/pages/ProductDetail.tsx` -- Fetch single product from the database by UUID

### 3. Replace All Dollar Signs with FRw

**Files with `$` currency that need fixing:**

| File | What to change |
|------|---------------|
| `src/pages/admin/Products.tsx` | `$` in price columns to `FRw` |
| `src/pages/admin/Orders.tsx` | `$` in total column to `FRw` |
| `src/pages/admin/Dashboard.tsx` | `$45,678` revenue and `$` in recent orders to `FRw`; replace `DollarSign` icon |
| `src/components/SearchAutocomplete.tsx` | `$` in price display to `FRw` |
| `src/pages/ProductDetail.tsx` | `$` in price display to `FRw` |

(Cart, Checkout, and ProductCard already use FRw.)

### 4. Create Storage Bucket for Product Images

- Create a `product-images` storage bucket via SQL migration (public bucket so images can be displayed)
- Add RLS policies: anyone can view, only admins can upload/delete

### 5. Update Admin Products Page

Rewrite `src/pages/admin/Products.tsx` to:
- Fetch products from the database (not hardcoded mock data)
- Add an image upload field in the Add/Edit Product dialog
- Upload images to the `product-images` bucket
- Save the public URL in the product's `image` column
- Show product thumbnails in the table
- Use FRw currency throughout
- Perform real CRUD operations against the database

---

### Technical Details

**Database seed:** 60 INSERT statements into `products` table with columns: `name`, `price`, `image`, `category`, `stock`, `wholesale_price`, `is_active`.

**Storage bucket migration SQL:**
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE USING (
  bucket_id = 'product-images' AND has_role(auth.uid(), 'admin')
);
```

**React Query pattern:** All database-fetching pages will use `@tanstack/react-query` with the existing Supabase client for data fetching, caching, and loading states.

**Product ID type change:** The app currently uses numeric IDs from the static file. After migration, all product references will use UUID strings from the database. This affects `ProductCard`, `ProductDetail`, `SearchAutocomplete`, `Shop`, and `Index` components.

