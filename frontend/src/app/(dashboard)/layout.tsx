"use client";

import { AuthGuard } from "@/components/providers/auth-guard";
import { DataBootstrap } from "@/components/providers/data-bootstrap";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DataBootstrap>
        <DashboardShell>{children}</DashboardShell>
      </DataBootstrap>
    </AuthGuard>
  );
}
