import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  className?: string;
};

export function StatCard({
  label,
  value,
  delta,
  trend = "neutral",
  icon: Icon,
  className,
}: StatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {delta ? (
          <p
            className={cn(
              "flex items-center gap-1 text-xs text-muted-foreground",
              trend === "up" && "text-emerald-700 dark:text-emerald-400",
              trend === "down" && "text-destructive"
            )}
          >
            <TrendIcon className="size-3.5" />
            <span>{delta}</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
