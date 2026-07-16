"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  Button,
  Input,
  Label,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@likiya/ui";
import type { DiscountType } from "@likiya/database";

import { createCoupon } from "@/features/coupons/actions";

export function CreateCouponDialog() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("10");
  const [minSubtotal, setMinSubtotal] = useState("0");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!code.trim()) {
      toast.error("Enter a coupon code.");
      return;
    }
    startTransition(async () => {
      await createCoupon({
        code,
        description,
        discountType,
        discountValue: Number(discountValue),
        minSubtotal: Number(minSubtotal),
        maxUsesPerUser: 1,
      });
      toast.success("Coupon created.");
      setOpen(false);
      setCode("");
      setDescription("");
      setDiscountValue("10");
      setMinSubtotal("0");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Coupon</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Coupon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Code</Label>
            <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME10" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Welcome discount"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={(v: DiscountType) => setDiscountType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="minSubtotal">Minimum Subtotal</Label>
            <Input
              id="minSubtotal"
              type="number"
              value={minSubtotal}
              onChange={(e) => setMinSubtotal(e.target.value)}
            />
          </div>
          <Button className="w-full" disabled={isPending} onClick={handleSubmit}>
            {isPending ? "Creating…" : "Create Coupon"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
