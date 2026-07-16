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

import { getAdminReturnsList } from "@/features/returns/queries";
import { ReturnStatusSelect } from "./status-select";

export default async function AdminReturnsPage() {
  const returns = await getAdminReturnsList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Returns</h1>
        <p className="text-sm text-muted-foreground">{returns.length} return requests</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                    No return requests yet.
                  </TableCell>
                </TableRow>
              ) : (
                returns.map((ret) => (
                  <TableRow key={ret.id}>
                    <TableCell className="font-medium">#{ret.order?.order_number ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ret.reason}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(ret.created_at)}
                    </TableCell>
                    <TableCell>
                      <ReturnStatusSelect returnId={ret.id} status={ret.status} />
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
