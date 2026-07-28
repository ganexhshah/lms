import { Badge } from "@/components/ui/badge";
import type { CourseStatus } from "@/types/course";
import { cn } from "@/lib/utils";

const statusLabel: Record<CourseStatus, string> = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

const statusVariant: Record<
  CourseStatus,
  "default" | "secondary" | "outline"
> = {
  draft: "secondary",
  active: "default",
  archived: "outline",
};

type CourseStatusBadgeProps = {
  status: CourseStatus;
  className?: string;
};

export function CourseStatusBadge({
  status,
  className,
}: CourseStatusBadgeProps) {
  return (
    <Badge variant={statusVariant[status]} className={cn(className)}>
      {statusLabel[status]}
    </Badge>
  );
}
