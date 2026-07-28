"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOpsStore } from "@/store/ops-store";
import { useStudentsStore } from "@/store/students-store";
import { useCoursesStore } from "@/store/courses-store";
import { useAdmissionsStore } from "@/store/admissions-store";

export default function ReportsPage() {
  const students = useStudentsStore((s) => s.students);
  const courses = useCoursesStore((s) => s.courses);
  const applications = useAdmissionsStore((s) => s.applications);
  const attendance = useOpsStore((s) => s.attendance);
  const inventory = useOpsStore((s) => s.inventory);
  const trainers = useOpsStore((s) => s.trainers);
  const payments = useOpsStore((s) => s.payments);
  const exams = useOpsStore((s) => s.exams);
  const certificates = useOpsStore((s) => s.certificates);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (fromDate && p.dueDate < fromDate) return false;
      if (toDate && p.dueDate > toDate) return false;
      return true;
    });
  }, [payments, fromDate, toDate]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      if (fromDate && a.date < fromDate) return false;
      if (toDate && a.date > toDate) return false;
      return true;
    });
  }, [attendance, fromDate, toDate]);

  const collected = filteredPayments.reduce((s, p) => s + p.paid, 0);
  const lowStock = inventory.filter((i) => i.stock < i.minStock).length;
  const avgAttendance =
    filteredAttendance.length === 0
      ? 0
      : Math.round(
          (filteredAttendance.reduce((s, a) => s + a.present, 0) /
            Math.max(
              filteredAttendance.reduce((s, a) => s + a.present + a.absent, 0),
              1
            )) *
            100
        );

  const graded = exams.filter((e) => e.status === "graded");
  const passCount = graded.reduce(
    (s, e) => s + (e.grades ?? []).filter((g) => g.passed).length,
    0
  );
  const gradeTotal = graded.reduce((s, e) => s + (e.grades ?? []).length, 0);
  const completionRate = gradeTotal
    ? Math.round((passCount / gradeTotal) * 100)
    : 0;

  const revenueByMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of filteredPayments) {
      const month = p.dueDate.slice(0, 7);
      map.set(month, (map.get(month) ?? 0) + p.paid / 100000);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({
        month: month.slice(5),
        revenue: Math.round(revenue * 10) / 10,
      }));
  }, [filteredPayments]);

  const usageByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of inventory) {
      const used = (item.usage ?? []).reduce((s, u) => s + u.qty, 0);
      map.set(item.category, (map.get(item.category) ?? 0) + used);
    }
    return [...map.entries()].map(([category, qty]) => ({ category, qty }));
  }, [inventory]);

  const growthData = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of students) {
      const m = s.enrolledAt.slice(0, 7);
      map.set(m, (map.get(m) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month: month.slice(5), enrollments: count }));
  }, [students]);

  function exportCsv() {
    const rows = [
      ["Metric", "Value"],
      ["Revenue collected", String(collected)],
      ["Active students", String(students.filter((s) => s.status === "active").length)],
      ["Avg attendance %", String(avgAttendance)],
      ["Completion rate %", String(completionRate)],
      ["Certificates issued", String(certificates.filter((c) => c.status === "issued").length)],
      ["Low stock SKUs", String(lowStock)],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vellum-reports.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Revenue, growth, attendance, completion, inventory, and trainer performance."
        actions={
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download /> Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">From</Label>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">To</Label>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Revenue collected" value={`Rs ${collected.toLocaleString()}`} />
        <Stat label="Active students" value={String(students.filter((s) => s.status === "active").length)} />
        <Stat label="Open admissions" value={String(applications.filter((a) => a.status === "pending" || a.status === "lead").length)} />
        <Stat label="Avg attendance" value={`${avgAttendance}%`} />
        <Stat label="Course completion" value={`${completionRate}%`} />
        <Stat label="Low stock SKUs" value={String(lowStock)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Revenue (L) from invoices</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth.length ? revenueByMonth : [{ month: "—", revenue: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={28} />
                <Tooltip />
                <Bar dataKey="revenue" fill="var(--foreground)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Student growth (enrollments)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData.length ? growthData : [{ month: "—", enrollments: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={28} />
                <Tooltip />
                <Bar dataKey="enrollments" fill="var(--foreground)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Inventory usage</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageByCategory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={28} />
                <Tooltip />
                <Bar dataKey="qty" fill="var(--foreground)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Trainer performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trainers.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.specialty}</p>
                </div>
                <p className="font-semibold tabular-nums">{t.rating}</p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Active courses: {courses.filter((c) => c.status === "active").length} · Certificates issued:{" "}
              {certificates.filter((c) => c.status === "issued").length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="shadow-none">
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
