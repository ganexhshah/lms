import type { LucideIcon } from "lucide-react";
import {
  UserPlus,
  QrCode,
  FileText,
  Award,
} from "lucide-react";

export type StatMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
};

export type ScheduleItem = {
  id: string;
  time: string;
  course: string;
  batch: string;
  trainer: string;
  room: string;
};

export type AlertItem = {
  id: string;
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
  category: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: LucideIcon;
};

export type ChartPoint = {
  month: string;
  enrollments: number;
  revenue: number;
};

export type QuickAction = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

/** Empty chart scaffold — dashboard fills from live stores when available */
export const overviewChartData: ChartPoint[] = [];

export const quickActions: QuickAction[] = [
  {
    id: "register",
    label: "Register student",
    href: "/dashboard/students?register=1",
    icon: UserPlus,
  },
  {
    id: "attendance",
    label: "Mark attendance",
    href: "/dashboard/attendance",
    icon: QrCode,
  },
  {
    id: "invoice",
    label: "Create invoice",
    href: "/dashboard/payments",
    icon: FileText,
  },
  {
    id: "certificate",
    label: "Generate certificate",
    href: "/dashboard/certificates",
    icon: Award,
  },
];
