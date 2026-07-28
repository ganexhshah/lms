"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Plus } from "lucide-react";

import { AdmissionTable } from "@/components/admissions/admission-table";
import { ApplicationForm } from "@/components/admissions/application-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchField } from "@/components/shared/search-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { admissionDetailHref } from "@/lib/admission-tabs";
import { useAdmissionsStore } from "@/store/admissions-store";
import type { AdmissionApplication, AdmissionStatus } from "@/types/admission";

type FilterKey = "all" | AdmissionStatus;

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "All" },
  { value: "lead", label: "Leads" },
  { value: "pending", label: "Pending" },
  { value: "waiting", label: "Waiting" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function AdmissionsListInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applications = useAdmissionsStore((s) => s.applications);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setFormOpen(true);
    }
    const status = searchParams.get("status") as FilterKey | null;
    if (status && FILTERS.some((f) => f.value === status)) {
      setFilter(status);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((a) => {
      const matchesFilter = filter === "all" || a.status === filter;
      if (!matchesFilter) return false;
      if (!q) return true;
      const hay =
        `${a.firstName} ${a.lastName} ${a.email} ${a.applicationCode} ${a.course}`.toLowerCase();
      return hay.includes(q);
    });
  }, [applications, query, filter]);

  const counts = useMemo(
    () => ({
      total: applications.length,
      lead: applications.filter((a) => a.status === "lead").length,
      pending: applications.filter((a) => a.status === "pending").length,
      waiting: applications.filter((a) => a.status === "waiting").length,
      approved: applications.filter((a) => a.status === "approved").length,
    }),
    [applications]
  );

  function openApp(app: AdmissionApplication) {
    router.push(admissionDetailHref(app.id));
  }

  function handleCreated(app: AdmissionApplication) {
    setFormOpen(false);
    router.replace("/dashboard/admissions");
    router.push(admissionDetailHref(app.id));
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);
    if (!open && searchParams.get("new") === "1") {
      router.replace("/dashboard/admissions");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions"
        description="Manage leads, online applications, approvals, batch assignment, and waiting list."
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus />
            New application
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total applications" value={String(counts.total)} />
        <Stat label="Leads" value={String(counts.lead)} />
        <Stat label="Pending approval" value={String(counts.pending)} />
        <Stat label="Waiting list" value={String(counts.waiting)} />
      </div>

      <Card className="shadow-none">
        <CardHeader className="flex flex-col gap-3 space-y-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Applications</CardTitle>
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search applicant, code, course…"
              className="max-w-xs"
            />
          </div>
          <Tabs
            value={filter}
            onValueChange={(v) =>
              typeof v === "string" && setFilter(v as FilterKey)
            }
          >
            <TabsList className="h-auto flex-wrap">
              {FILTERS.map((f) => (
                <TabsTrigger key={f.value} value={f.value}>
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filtered.length ? (
            <AdmissionTable
              applications={filtered}
              onSelect={openApp}
              actionHref={(a) => admissionDetailHref(a.id)}
            />
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="No applications found"
              description="Try another filter, or create a new application."
              action={
                <Button size="sm" onClick={() => setFormOpen(true)}>
                  <Plus />
                  New application
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={handleFormOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Online application</DialogTitle>
            <DialogDescription>
              Capture a new lead or full admission application.
            </DialogDescription>
          </DialogHeader>
          <ApplicationForm
            onCancel={() => handleFormOpenChange(false)}
            onSuccess={handleCreated}
          />
        </DialogContent>
      </Dialog>
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

export default function AdmissionsListPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading admissions…</div>
      }
    >
      <AdmissionsListInner />
    </Suspense>
  );
}
