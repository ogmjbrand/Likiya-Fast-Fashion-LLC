"use client";

import { useEffect } from "react";

import { useCartStore } from "@/features/cart/store";

/** Clears the local cart once we land on the confirmed order page. */
export function ClearCartOnMount() {
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
