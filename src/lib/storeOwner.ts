export const fulfillmentStatuses = ["pending", "processing", "ready", "shipped", "delivered", "cancelled"] as const;
export type StoreOrder = {
  id: string; created_at: string; order_status: string; shipping_address: string | null; phone_number: string | null;
  status: string; notes: string;
  items: { id: string; name: string; image: string; quantity: number; unit_price: number; total_price: number; pricing_type: string }[];
  payment: { method: string; status: string } | null;
};
export const storeSubtotal = (order: StoreOrder) => order.items.reduce((sum, item) => sum + Number(item.total_price), 0);
export const ownedStore = (ownerId: string | null, userId: string | null) => !!userId && ownerId === userId;
export function validateProduct(price: number, stock: number) {
  if (!Number.isFinite(price) || price < 0) throw new Error("Price must be zero or greater");
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock must be a whole number, zero or greater");
}