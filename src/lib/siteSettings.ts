export type SiteSettings = {
  shopName: string; tagline: string; logoUrl: string;
  phone: string; email: string; address: string; whatsapp: string;
  shippingFee: number; freeShippingOver: number;
  facebook: string; instagram: string; twitter: string; tiktok: string;
  heroTitle: string; heroSubtitle: string; heroText: string; heroImage: string;
  announcement: string; announcementOn: boolean;
};

export const defaultSettings: SiteSettings = {
  shopName: "WellarShop",
  tagline: "Your trusted supermarket for wholesale and retail. Fresh produce, quality groceries, and beverages at the best prices.",
  logoUrl: "", phone: "", email: "", address: "", whatsapp: "",
  shippingFee: 2000, freeShippingOver: 50000,
  facebook: "", instagram: "", twitter: "", tiktok: "",
  heroTitle: "Fresh Quality", heroSubtitle: "Every Day",
  heroText: "Your trusted supermarket for wholesale and retail. Fresh produce, quality groceries, and beverages at the best prices.",
  heroImage: "", announcement: "", announcementOn: false,
};

export const mergeSettings = (data: unknown): SiteSettings => ({ ...defaultSettings, ...(data && typeof data === "object" ? data : {}) });

/** Delivery is free only when the subtotal is above the free-delivery amount. */
export const shippingFor = (subtotal: number, s: Pick<SiteSettings, "shippingFee" | "freeShippingOver">) =>
  subtotal > Number(s.freeShippingOver) ? 0 : Number(s.shippingFee);

export const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type WeeklyHours = Record<string, { open: string; close: string; closed: boolean }>;
export const defaultWeek = (): WeeklyHours => Object.fromEntries(days.map(d => [d, { open: "08:00", close: "20:00", closed: false }]));
export const formatWeek = (w: WeeklyHours | null | undefined) => {
  if (!w) return null;
  const parts = days.map(d => w[d]?.closed ? "Closed" : w[d] ? `${w[d].open}–${w[d].close}` : "");
  if (parts.every(p => p === parts[0])) return parts[0] === "Closed" ? "Closed all week" : `Daily ${parts[0]}`;
  return null;
};
