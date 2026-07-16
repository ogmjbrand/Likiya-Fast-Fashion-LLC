import { Card, CardHeader, CardTitle, CardContent } from "@likiya/ui";
import { formatPrice } from "@likiya/utils";

import { getDailyRevenue } from "@/features/analytics/queries";
import { RevenueChart } from "@/components/analytics/revenue-chart";

export default async function AdminAnalyticsPage() {
  const data = await getDailyRevenue(30);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Revenue Analytics</h1>
        <p className="text-sm text-muted-foreground">Last 30 days, completed orders only</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="mt-1 text-2xl font-semibold">{formatPrice(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Orders</p>
            <p className="mt-1 text-2xl font-semibold">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Avg. Order Value</p>
            <p className="mt-1 text-2xl font-semibold">{formatPrice(avgOrderValue)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
