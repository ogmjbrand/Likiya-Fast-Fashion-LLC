import { requireUser } from "@likiya/auth/server";

import { getMyWishlist } from "@/features/account/queries";
import { WishlistItemCard } from "./wishlist-item";

export default async function AccountWishlistPage() {
  const user = await requireUser();
  const items = await getMyWishlist(user.id);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-black uppercase">Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <WishlistItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
