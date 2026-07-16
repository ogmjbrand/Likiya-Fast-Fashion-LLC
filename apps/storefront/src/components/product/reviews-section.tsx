import Link from "next/link";
import { Star } from "lucide-react";

import { cn } from "@likiya/utils";
import { formatDate } from "@likiya/utils";
import type { Review } from "@likiya/database";

import { getCurrentUser } from "@likiya/auth/server";
import { ReviewForm } from "./review-form";

export async function ReviewsSection({
  productId,
  productSlug,
  reviews,
  avgRating,
}: {
  productId: string;
  productSlug: string;
  reviews: Review[];
  avgRating: number;
}) {
  const user = await getCurrentUser();

  return (
    <section className="border-t border-border py-16">
      <div className="mb-8 flex items-center gap-3">
        <h2 className="font-heading text-2xl">Reviews</h2>
        <div className="flex items-center gap-1">
          <Star className="size-4 fill-accent text-accent" />
          <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({reviews.length})</span>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">Be the first to review this product.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                      key={v}
                      className={cn(
                        "size-3.5",
                        v <= review.rating ? "fill-accent text-accent" : "text-muted-foreground",
                      )}
                    />
                  ))}
                </div>
                {review.title ? <p className="mt-2 font-medium">{review.title}</p> : null}
                {review.body ? <p className="mt-1 text-sm text-muted-foreground">{review.body}</p> : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {review.is_verified_purchase ? "Verified purchase — " : ""}
                  {formatDate(review.created_at)}
                </p>
              </div>
            ))
          )}
        </div>

        <div>
          {user ? (
            <ReviewForm productId={productId} productSlug={productSlug} />
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="underline underline-offset-4">
                Sign in
              </Link>{" "}
              to leave a review.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
