import { requireUser } from "@likiya/auth/server";
import { formatDate } from "@likiya/utils";
import { RETURN_STATUS_LABELS } from "@likiya/types";
import { Badge } from "@likiya/ui";

import { getMyOrders, getMyReturns } from "@/features/account/queries";
import { ReturnForm } from "./return-form";

export default async function AccountReturnsPage() {
  const user = await requireUser();
  const [orders, returns] = await Promise.all([getMyOrders(user.id), getMyReturns(user.id)]);
  const eligibleOrders = orders.filter((o) => o.status === "completed");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-black uppercase">Returns</h1>
      </div>

      <div>
        <h2 className="mb-4 font-display text-base font-black uppercase tracking-wide">Request a Return</h2>
        <ReturnForm eligibleOrders={eligibleOrders} />
      </div>

      <div>
        <h2 className="mb-4 font-display text-base font-black uppercase tracking-wide">Your Requests</h2>
        {returns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No return requests yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {returns.map((ret) => (
              <li key={ret.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">#{ret.order?.order_number}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(ret.created_at)}</p>
                </div>
                <Badge variant="secondary">{RETURN_STATUS_LABELS[ret.status]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
