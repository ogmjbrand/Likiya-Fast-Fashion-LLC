"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Switch } from "@likiya/ui";

import { toggleCouponActive } from "@/features/coupons/actions";

export function CouponActiveToggle({ couponId, isActive }: { couponId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      defaultChecked={isActive}
      disabled={isPending}
      onCheckedChange={(checked: boolean) =>
        startTransition(async () => {
          await toggleCouponActive(couponId, checked);
          toast.success(checked ? "Coupon activated." : "Coupon deactivated.");
        })
      }
    />
  );
}
