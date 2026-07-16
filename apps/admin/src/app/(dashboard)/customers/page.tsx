import Link from "next/link";

import {
  Card,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@likiya/ui";
import { formatDate } from "@likiya/utils";

import { getAdminCustomerList } from "@/features/customers/queries";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam ?? "1") || 1;
  const { customers, total, totalPages } = await getAdminCustomerList(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-muted-foreground">{total} registered customers</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Loyalty Points</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    No customers yet.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.full_name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {customer.phone ?? "—"}
                    </TableCell>
                    <TableCell>{customer.loyalty_points}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(customer.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <div className="flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/customers?page=${p}`}
              className={p === page ? "font-semibold underline" : "text-muted-foreground"}
            >
              {p}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
