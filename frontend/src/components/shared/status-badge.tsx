import { Badge } from "@/components/ui/badge";
import type { StudentStatus } from "@/types/student";
import { cn } from "@/lib/utils";

const statusLabel: Record<StudentStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  graduated: "Graduated",
  on_hold: "On hold",
};

const statusVariant: Record<
  StudentStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  inactive: "secondary",
  graduated: "outline",
  on_hold: "destructive",
};

type StatusBadgeProps = {
  status: StudentStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariant[status]} className={cn(className)}>
      {statusLabel[status]}
    </Badge>
  );
}
