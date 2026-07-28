import type { LucideIcon } from "lucide-react";
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  ClipboardCheck,
  UserCog,
  Wallet,
  FilePen,
  Award,
  Package,
  CalendarDays,
  MonitorPlay,
  Megaphone,
  Briefcase,
  BarChart3,
  Bell,
  UserRound,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
};

export type NavGroup = {
  title: string;
  href: string;
  icon: LucideIcon;
  items: NavItem[];
};

export const homeNav: NavItem = {
  title: "Home",
  href: "/dashboard",
  icon: Home,
};

export const navigation: NavGroup[] = [
  { title: "Students", href: "/dashboard/students", icon: Users, items: [] },
  { title: "Admissions", href: "/dashboard/admissions", icon: GraduationCap, items: [] },
  { title: "Courses", href: "/dashboard/courses", icon: BookOpen, items: [] },
  { title: "Batches", href: "/dashboard/batches", icon: Layers, items: [] },
  { title: "Attendance", href: "/dashboard/attendance", icon: ClipboardCheck, items: [] },
  { title: "Trainers", href: "/dashboard/trainers", icon: UserCog, items: [] },
  { title: "Payments", href: "/dashboard/payments", icon: Wallet, items: [] },
  { title: "Exams", href: "/dashboard/exams", icon: FilePen, items: [] },
  { title: "Certificates", href: "/dashboard/certificates", icon: Award, items: [] },
  { title: "Landing page", href: "/dashboard/landing", icon: MonitorPlay, items: [] },
  { title: "Inventory", href: "/dashboard/inventory", icon: Package, items: [] },
  { title: "Timetable", href: "/dashboard/timetable", icon: CalendarDays, items: [] },
  { title: "Learning", href: "/dashboard/learning", icon: MonitorPlay, items: [] },
  { title: "Communication", href: "/dashboard/communication", icon: Megaphone, items: [] },
  { title: "Placement", href: "/dashboard/placement", icon: Briefcase, items: [] },
  { title: "Reports", href: "/dashboard/reports", icon: BarChart3, items: [] },
];

export const accountNav: NavItem[] = [
  { title: "Profile", href: "/dashboard/profile", icon: UserRound },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
];
