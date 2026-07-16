"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Button,
  RadioGroup,
  RadioGroupItem,
  Label,
  Separator,
} from "@likiya/ui";
import { formatPrice } from "@likiya/utils";
import { analyticsEvents } from "@likiya/analytics";

import { useCartStore } from "@/features/cart/store";
import { createCheckoutSession } from "@/features/checkout/actions";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      shippingAddress: {
        fullName: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        countryCode: "US",
        phone: "",
      },
      provider: "stripe",
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    },
  });

  async function onSubmit(values: CheckoutInput) {
    if (items.length === 0) {
      toast.error("Your bag is empty.");
      return;
    }

    setIsSubmitting(true);
    analyticsEvents.beginCheckout(
      items.map((i) => ({
        item_id: i.sku,
        item_name: i.productName,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal,
    );

    const result = await createCheckoutSession({
      ...values,
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    });

    // createCheckoutSession redirects on success — reaching this line means it failed.
    if (result?.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Your bag is empty.</p>
        <Button className="mt-4" onClick={() => router.push("/collections/new-arrivals")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <section className="space-y-4">
            <h2 className="font-heading text-xl">Contact</h2>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl">Shipping Address</h2>
            <FormField
              control={form.control}
              name="shippingAddress.fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shippingAddress.line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shippingAddress.line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shippingAddress.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingAddress.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shippingAddress.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingAddress.countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code</FormLabel>
                    <FormControl>
                      <Input maxLength={2} placeholder="US" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="shippingAddress.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>

          <section className="space-y-4">
            <h2 className="font-heading text-xl">Payment</h2>
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="space-y-2"
                    >
                      <Label className="flex items-center gap-3 border border-border p-4">
                        <RadioGroupItem value="stripe" />
                        Card (Stripe)
                      </Label>
                      <Label className="flex items-center gap-3 border border-border p-4">
                        <RadioGroupItem value="paystack" />
                        Paystack
                      </Label>
                      <Label className="flex items-center gap-3 border border-border p-4">
                        <RadioGroupItem value="flutterwave" />
                        Flutterwave
                      </Label>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </section>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Redirecting to payment…" : `Pay ${formatPrice(subtotal)}`}
          </Button>
        </form>
      </Form>

      <div className="h-fit space-y-4 border border-border p-6">
        <h2 className="font-heading text-lg">Order Summary</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.variantId} className="flex justify-between text-sm">
              <span>
                {item.productName} &times; {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="flex justify-between text-sm font-medium">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Shipping and tax are calculated after you submit — free shipping over $150.
        </p>
      </div>
    </div>
  );
}
