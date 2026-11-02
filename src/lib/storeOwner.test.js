import { test, expect } from "bun:test";
import { ownedStore, storeSubtotal, validateProduct } from "./storeOwner";
test("owners can control only stores assigned to them", () => {
  expect(ownedStore("gahi-owner", "gahi-owner")).toBe(true);
  expect(ownedStore("wellar-owner", "gahi-owner")).toBe(false);
  expect(ownedStore(null, null)).toBe(false);
});
test("store totals contain only the store's lines", () => {
  expect(storeSubtotal({ items: [{ total_price: 1500 }, { total_price: 3000 }] })).toBe(4500);
});
test("inventory rejects negative and fractional stock", () => {
  expect(() => validateProduct(100, -1)).toThrow();
  expect(() => validateProduct(100, 1.5)).toThrow();
  expect(() => validateProduct(100, 0)).not.toThrow();
});