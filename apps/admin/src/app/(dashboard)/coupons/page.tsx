import {
  Card,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
} from "@likiya/ui";
import { formatDate } from "@likiya/utils";

import { getAdminCouponList } from "@/features/coupons/queries";
import { CreateCouponDialog } from "./create-form";
import { CouponActiveToggle } from "./active-toggle";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCouponList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Coupons</h1>
          <p className="text-sm text-muted-foreground">{coupons.length} coupons</p>
        </div>
        <CreateCouponDialog />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No coupons yet.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}%`
                          : `$${coupon.discount_value}`}
                      </Badge>
                    </TableCell>
                    <TableCell>{coupon.uses_count}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(coupon.created_at)}
                    </TableCell>
                    <TableCell>
                      <CouponActiveToggle couponId={coupon.id} isActive={coupon.is_active} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
