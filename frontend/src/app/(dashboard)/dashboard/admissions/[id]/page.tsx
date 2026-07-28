"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";

import { AdmissionStatusBadge } from "@/components/admissions/admission-status-badge";
import { ApplicationTab } from "@/components/admissions/tabs/application-tab";
import { ApprovalTab } from "@/components/admissions/tabs/approval-tab";
import { BatchTab } from "@/components/admissions/tabs/batch-tab";
import { AdmissionHistoryTab } from "@/components/admissions/tabs/history-tab";
import { LeadTab } from "@/components/admissions/tabs/lead-tab";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ADMISSION_TAB_LABELS,
  ADMISSION_TABS,
  admissionDetailHref,
  parseAdmissionTab,
  type AdmissionTab,
} from "@/lib/admission-tabs";
import { useAdmissionsStore } from "@/store/admissions-store";
import { admissionFullName } from "@/types/admission";

function AdmissionDetailInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const applications = useAdmissionsStore((s) => s.applications);
  const application = applications.find((a) => a.id === params.id) ?? null;
  const tab = parseAdmissionTab(searchParams.get("tab"));

  function setTab(next: string | number | null) {
    if (typeof next !== "string" || !application) return;
    const parsed = parseAdmissionTab(next);
    router.replace(admissionDetailHref(application.id, parsed), {
      scroll: false,
    });
  }

  if (!application) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Application not found"
        description="This application may have been removed, or the link is invalid."
        action={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/admissions" />}
          >
            <ArrowLeft />
            Back to admissions
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button
          size="icon-sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/dashboard/admissions" />}
          aria-label="Back to admissions"
        >
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {admissionFullName(application)}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            {application.applicationCode}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <AdmissionStatusBadge status={application.status} />
            <span className="text-xs text-muted-foreground">
              {application.course} · {application.preferredBatch}
            </span>
          </div>
        </div>
      </div>

      <Card className="shadow-none">
        <Tabs value={tab} onValueChange={setTab}>
          <CardHeader className="border-b pb-0">
            <TabsList
              variant="line"
              className="h-auto w-full justify-start overflow-x-auto"
            >
              {ADMISSION_TABS.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {ADMISSION_TAB_LABELS[t as AdmissionTab]}
                </TabsTrigger>
              ))}
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="application">
              <ApplicationTab application={application} />
            </TabsContent>
            <TabsContent value="lead">
              <LeadTab key={application.id} application={application} />
            </TabsContent>
            <TabsContent value="approval">
              <ApprovalTab application={application} />
            </TabsContent>
            <TabsContent value="batch">
              <BatchTab application={application} />
            </TabsContent>
            <TabsContent value="history">
              <AdmissionHistoryTab application={application} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

export default function AdmissionDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">
          Loading application…
        </div>
      }
    >
      <AdmissionDetailInner />
    </Suspense>
  );
}
