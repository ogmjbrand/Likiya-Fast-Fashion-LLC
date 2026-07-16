import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@likiya/ui";
import { cn } from "@likiya/utils";

interface StatTileProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "warning";
}

export function StatTile({ label, value, icon: Icon, tone = "default" }: StatTileProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            tone === "warning" ? "bg-destructive/10 text-destructive" : "bg-accent/20 text-accent-foreground",
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
