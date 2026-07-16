import { describe, it, expect, beforeEach } from "vitest";

import { useCartStore, type CartLineItem } from "@/features/cart/store";

const baseItem: Omit<CartLineItem, "quantity"> = {
  variantId: "variant-1",
  productId: "product-1",
  productName: "Wool Tailored Coat",
  productSlug: "wool-tailored-coat",
  variantTitle: "M",
  sku: "WTC-M",
  price: 495,
  compareAtPrice: 650,
  imageUrl: null,
  maxQuantity: 10,
};

describe("useCartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
  });

  it("adds a new item to an empty cart", () => {
    useCartStore.getState().addItem(baseItem, 1);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().itemCount()).toBe(1);
  });

  it("increments quantity when the same variant is added again", () => {
    useCartStore.getState().addItem(baseItem, 1);
    useCartStore.getState().addItem(baseItem, 2);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]?.quantity).toBe(3);
  });

  it("caps quantity at maxQuantity", () => {
    useCartStore.getState().addItem(baseItem, 9);
    useCartStore.getState().addItem(baseItem, 5);
    expect(useCartStore.getState().items[0]?.quantity).toBe(10);
  });

  it("removes an item entirely when quantity is updated to zero", () => {
    useCartStore.getState().addItem(baseItem, 1);
    useCartStore.getState().updateQuantity(baseItem.variantId, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("computes subtotal across multiple line items", () => {
    useCartStore.getState().addItem(baseItem, 2);
    useCartStore.getState().addItem({ ...baseItem, variantId: "variant-2", price: 100 }, 1);
    expect(useCartStore.getState().subtotal()).toBe(495 * 2 + 100);
  });

  it("clears all items", () => {
    useCartStore.getState().addItem(baseItem, 1);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
