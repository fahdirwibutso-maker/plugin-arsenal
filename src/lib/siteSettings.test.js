import { test, expect } from "bun:test";
import { shippingFor, defaultSettings, mergeSettings } from "./siteSettings";

test("default delivery is 2000 FRw and free above 50,000 FRw", () => {
  expect(shippingFor(50000, defaultSettings)).toBe(2000);
  expect(shippingFor(50001, defaultSettings)).toBe(0);
});

test("admin-changed delivery prices are used", () => {
  const s = mergeSettings({ shippingFee: 1500, freeShippingOver: 30000 });
  expect(shippingFor(20000, s)).toBe(1500);
  expect(shippingFor(30001, s)).toBe(0);
});
