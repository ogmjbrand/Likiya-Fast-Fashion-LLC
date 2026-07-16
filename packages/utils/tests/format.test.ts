import { describe, it, expect } from "vitest";

import { formatPrice, formatDate, formatOrderStatus } from "../src/format";
import { cn } from "../src/cn";

describe("formatPrice", () => {
  it("formats USD by default", () => {
    expect(formatPrice(495)).toBe("$495.00");
  });

  it("formats an explicit currency", () => {
    expect(formatPrice(100, "GBP")).toBe("£100.00");
  });
});

describe("formatDate", () => {
  it("formats an ISO string into a medium date", () => {
    expect(formatDate("2026-01-15T00:00:00.000Z")).toMatch(/Jan 1[45], 2026/);
  });
});

describe("formatOrderStatus", () => {
  it("title-cases snake_case status strings", () => {
    expect(formatOrderStatus("awaiting_payment")).toBe("Awaiting Payment");
    expect(formatOrderStatus("completed")).toBe("Completed");
  });
});

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});
