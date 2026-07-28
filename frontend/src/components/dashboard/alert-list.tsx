import type { AlertItem } from "@/data/dashboard-mock";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { cn } from "@/lib/utils";

type AlertListProps = {
  items: AlertItem[];
};

const severityVariant: Record<
  AlertItem["severity"],
  "destructive" | "secondary" | "outline"
> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

export function AlertList({ items }: AlertListProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <SectionHeader
          title="Needs attention"
          description="Fees, absences, and inventory"
          actionLabel="View all"
          actionHref="/dashboard/reports"
        />
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing needs attention right now.</p>
        ) : (
          items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-lg border p-3",
              item.severity === "high" && "border-destructive/30 bg-destructive/5"
            )}
          >
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Badge variant={severityVariant[item.severity]} className="capitalize">
                {item.severity}
              </Badge>
              <span className="text-xs text-muted-foreground">{item.category}</span>
            </div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))
        )}
      </CardContent>
    </Card>
  );
}
