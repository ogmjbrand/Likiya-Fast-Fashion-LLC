"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";

import { Button, Textarea, Input, Label } from "@likiya/ui";
import { cn } from "@likiya/utils";

import { submitReview, type ReviewActionState } from "@/features/products/actions";

export function ReviewForm({ productId, productSlug }: { productId: string; productSlug: string }) {
  const [rating, setRating] = useState(5);
  const [state, formAction, isPending] = useActionState<ReviewActionState, FormData>(
    submitReview,
    null,
  );

  return (
    <form action={formAction} className="space-y-4 border-t border-border pt-6">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <Label>Your Rating</Label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" onClick={() => setRating(value)} aria-label={`Rate ${value} stars`}>
              <Star
                className={cn(
                  "size-5",
                  value <= rating ? "fill-accent text-accent" : "text-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Sum it up in a few words" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Review</Label>
        <Textarea id="body" name="body" rows={4} placeholder="Share your experience" />
      </div>

      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state?.error === null ? <p className="text-sm text-accent-foreground">Thanks for your review!</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}
