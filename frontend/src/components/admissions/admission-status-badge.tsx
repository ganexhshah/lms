import { Badge } from "@/components/ui/badge";
import type { AdmissionStatus } from "@/types/admission";
import { cn } from "@/lib/utils";

const statusLabel: Record<AdmissionStatus, string> = {
  lead: "Lead",
  pending: "Pending",
  waiting: "Waiting",
  approved: "Approved",
  rejected: "Rejected",
  enrolled: "Enrolled",
};

const statusVariant: Record<
  AdmissionStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  lead: "secondary",
  pending: "outline",
  waiting: "outline",
  approved: "default",
  rejected: "destructive",
  enrolled: "default",
};

type AdmissionStatusBadgeProps = {
  status: AdmissionStatus;
  className?: string;
};

export function AdmissionStatusBadge({
  status,
  className,
}: AdmissionStatusBadgeProps) {
  return (
    <Badge variant={statusVariant[status]} className={cn(className)}>
      {statusLabel[status]}
    </Badge>
  );
}
