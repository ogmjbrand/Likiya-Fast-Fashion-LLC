import { z } from "zod";

export const checkoutAddressSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  line1: z.string().min(1, "Enter your street address."),
  line2: z.string().optional(),
  city: z.string().min(1, "Enter your city."),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Enter your postal code."),
  countryCode: z.string().length(2, "Select a country."),
  phone: z.string().optional(),
});

export const checkoutSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  shippingAddress: checkoutAddressSchema,
  provider: z.enum(["stripe", "paystack", "flutterwave"]),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your bag is empty."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;
