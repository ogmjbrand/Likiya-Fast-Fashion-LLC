"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Input, Button } from "@likiya/ui";
import { newsletterSchema } from "@/lib/validations/newsletter";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) throw new Error();

      toast.success("You're on the list — welcome to Likiya.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        required
        aria-label="Email address"
        className="bg-background"
      />
      <Button type="submit" disabled={isSubmitting} variant="default">
        {isSubmitting ? "Joining…" : "Join"}
      </Button>
    </form>
  );
}
