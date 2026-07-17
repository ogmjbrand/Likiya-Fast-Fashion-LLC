import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "Enter your name.").max(200),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(10, "Tell us a bit more — at least 10 characters.").max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
