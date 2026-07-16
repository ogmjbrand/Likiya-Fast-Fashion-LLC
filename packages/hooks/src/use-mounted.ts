"use client";

import { useEffect, useState } from "react";

/** True only after the first client-side render — guards hydration-sensitive UI (theme toggles, etc.). */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
