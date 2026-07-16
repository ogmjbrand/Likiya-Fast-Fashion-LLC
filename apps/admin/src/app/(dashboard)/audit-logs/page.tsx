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

import { getRecentActivity } from "@/features/audit/queries";

export default async function AuditLogsPage() {
  const logs = await getRecentActivity();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Most recent staff actions</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                    No activity recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{log.action}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.entity_type}
                      {log.entity_id ? ` · ${log.entity_id.slice(0, 8)}` : ""}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(log.created_at)}
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
