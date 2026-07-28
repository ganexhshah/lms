import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SoftBadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "secondary" | "outline" | "destructive";
  className?: string;
};

export function SoftBadge({
  children,
  tone = "secondary",
  className,
}: SoftBadgeProps) {
  return (
    <Badge variant={tone} className={cn("capitalize", className)}>
      {children}
    </Badge>
  );
}
