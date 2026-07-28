"use client";

import {
  Users,
  GraduationCap,
  ClipboardCheck,
  Wallet,
  Layers,
  Package,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Award,
} from "lucide-react";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AlertList } from "@/components/dashboard/alert-list";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import {
  overviewChartData,
  quickActions,
  type ActivityItem,
  type AlertItem,
  type ScheduleItem,
} from "@/data/dashboard-mock";
import { useOpsStore } from "@/store/ops-store";
import { useStudentsStore } from "@/store/students-store";
import { useAdmissionsStore } from "@/store/admissions-store";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHomePage() {
  const now = new Date();
  const greeting = greetingForHour(now.getHours());
  const dateLabel = now.toLocaleDateString("en-NP", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const todayKey = now.toISOString().slice(0, 10);
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });

  const students = useStudentsStore((s) => s.students);
  const applications = useAdmissionsStore((s) => s.applications);
  const batches = useOpsStore((s) => s.batches);
  const attendance = useOpsStore((s) => s.attendance);
  const payments = useOpsStore((s) => s.payments);
  const inventory = useOpsStore((s) => s.inventory);
  const timetable = useOpsStore((s) => s.timetable);
  const announcements = useOpsStore((s) => s.announcements);
  const certificates = useOpsStore((s) => s.certificates);

  const activeStudents = students.filter((s) => s.status === "active").length;
  const openAdmissions = applications.filter(
    (a) => a.status === "pending" || a.status === "lead" || a.status === "waiting"
  ).length;
  const todayAtt = attendance.filter((a) => a.date === todayKey);
  const attPresent = todayAtt.reduce((s, a) => s + a.present, 0);
  const attTotal = todayAtt.reduce((s, a) => s + a.present + a.absent, 0);
  const attRate = attTotal ? Math.round((attPresent / attTotal) * 100) : 0;
  const feesDue = payments.filter(
    (p) => p.status === "overdue" || p.status === "partial"
  );
  const feesDueAmount = feesDue.reduce((s, p) => s + (p.amount - p.paid), 0);
  const activeBatches = batches.filter((b) => b.status === "active").length;
  const lowStock = inventory.filter((i) => i.stock < i.minStock);

  const stats = [
    {
      id: "students",
      label: "Active students",
      value: String(activeStudents),
      delta: `${students.length} total`,
      trend: "up" as const,
      icon: Users,
    },
    {
      id: "admissions",
      label: "Open admissions",
      value: String(openAdmissions),
      delta: `${applications.filter((a) => a.status === "pending").length} awaiting approval`,
      trend: "neutral" as const,
      icon: GraduationCap,
    },
    {
      id: "attendance",
      label: "Today's attendance",
      value: `${attRate}%`,
      delta: `${todayAtt.length} sessions logged`,
      trend: attRate >= 85 ? ("up" as const) : ("down" as const),
      icon: ClipboardCheck,
    },
    {
      id: "fees",
      label: "Fees due",
      value: `Rs ${feesDueAmount.toLocaleString()}`,
      delta: `${feesDue.length} invoices need attention`,
      trend: "down" as const,
      icon: Wallet,
    },
    {
      id: "batches",
      label: "Active batches",
      value: String(activeBatches),
      delta: `${batches.length} total batches`,
      trend: "neutral" as const,
      icon: Layers,
    },
    {
      id: "stock",
      label: "Low stock alerts",
      value: String(lowStock.length),
      delta: lowStock[0] ? lowStock[0].name : "All stocked",
      trend: lowStock.length ? ("down" as const) : ("up" as const),
      icon: Package,
    },
  ];

  const schedule: ScheduleItem[] = timetable
    .filter((s) => s.day === weekday)
    .map((s) => ({
      id: s.id,
      time: s.time,
      course: s.course,
      batch: s.batch,
      trainer: s.trainer,
      room: s.room,
    }));

  const alerts: AlertItem[] = [
    ...feesDue.slice(0, 3).map((p) => ({
      id: `fee-${p.id}`,
      title: `${p.number} · ${p.student}`,
      detail: `Rs ${(p.amount - p.paid).toLocaleString()} remaining · due ${p.dueDate}`,
      severity: (p.status === "overdue" ? "high" : "medium") as AlertItem["severity"],
      category: "Payments",
    })),
    ...attendance
      .filter((a) => a.date === todayKey && a.absent > 0)
      .slice(0, 2)
      .map((a) => ({
        id: `abs-${a.id}`,
        title: `Absences — ${a.batch}`,
        detail: `${a.absent} absent today`,
        severity: "medium" as const,
        category: "Attendance",
      })),
    ...lowStock.slice(0, 3).map((i) => ({
      id: `inv-${i.id}`,
      title: `Low stock: ${i.name}`,
      detail: `${i.stock} ${i.unit} left (min ${i.minStock})`,
      severity: "high" as const,
      category: "Inventory",
    })),
  ].slice(0, 6);

  const activity: ActivityItem[] = [
    ...announcements.slice(0, 2).map((a) => ({
      id: a.id,
      title: a.title,
      detail: `${a.channel} · ${a.audienceLabel}`,
      time: a.sentAt,
      icon: Bell,
    })),
    ...certificates
      .filter((c) => c.status === "issued")
      .slice(0, 2)
      .map((c) => ({
        id: c.id,
        title: `Certificate ${c.number}`,
        detail: `${c.student} · ${c.course}`,
        time: c.issuedAt,
        icon: Award,
      })),
    ...applications.slice(0, 2).map((a) => ({
      id: a.id,
      title: `Admission ${a.status}`,
      detail: `${a.firstName} ${a.lastName}`,
      time: a.createdAt,
      icon: a.status === "approved" ? CheckCircle2 : AlertTriangle,
    })),
  ].slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting} · Vellum LMS
        </h1>
        <p className="text-sm text-muted-foreground">{dateLabel}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            delta={stat.delta}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TodaySchedule items={schedule} />
        <AlertList items={alerts} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OverviewChart data={overviewChartData} />
        <ActivityFeed items={activity} />
      </div>

      <QuickActions items={quickActions} />
    </div>
  );
}
