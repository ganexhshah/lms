"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { StudentAvatar } from "@/components/students/student-avatar";
import { DocumentsTab } from "@/components/students/tabs/documents-tab";
import { EmergencyTab } from "@/components/students/tabs/emergency-tab";
import { HistoryTab } from "@/components/students/tabs/history-tab";
import { IdCardTab } from "@/components/students/tabs/id-card-tab";
import { PhotoTab } from "@/components/students/tabs/photo-tab";
import { ProfileTab } from "@/components/students/tabs/profile-tab";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  parseStudentTab,
  STUDENT_TAB_LABELS,
  STUDENT_TABS,
  studentDetailHref,
  type StudentTab,
} from "@/lib/student-tabs";
import { useStudentsStore } from "@/store/students-store";
import { studentFullName } from "@/types/student";

function StudentDetailInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const students = useStudentsStore((s) => s.students);
  const student = students.find((s) => s.id === params.id) ?? null;
  const tab = parseStudentTab(searchParams.get("tab"));

  useEffect(() => {
    if (!student && students.length > 0) {
      // wait for hydration from persist; if still missing after students load, stay empty
    }
  }, [student, students.length]);

  function setTab(next: string | number | null) {
    if (typeof next !== "string" || !student) return;
    const parsed = parseStudentTab(next);
    router.replace(studentDetailHref(student.id, parsed), { scroll: false });
  }

  if (!student) {
    return (
      <EmptyState
        icon={Users}
        title="Student not found"
        description="This student may have been removed, or the link is invalid."
        action={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/students" />}
          >
            <ArrowLeft />
            Back to students
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            size="icon-sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/students" />}
            aria-label="Back to students"
          >
            <ArrowLeft />
          </Button>
          <StudentAvatar student={student} size="lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {studentFullName(student)}
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              {student.studentCode}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={student.status} />
              <span className="text-xs text-muted-foreground">
                {student.course} · {student.batch}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Card className="shadow-none">
        <Tabs value={tab} onValueChange={setTab}>
          <CardHeader className="border-b pb-0">
            <TabsList variant="line" className="h-auto w-full justify-start overflow-x-auto">
              {STUDENT_TABS.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {STUDENT_TAB_LABELS[t as StudentTab]}
                </TabsTrigger>
              ))}
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="profile">
              <ProfileTab student={student} />
            </TabsContent>
            <TabsContent value="photo">
              <PhotoTab student={student} />
            </TabsContent>
            <TabsContent value="emergency">
              <EmergencyTab student={student} />
            </TabsContent>
            <TabsContent value="documents">
              <DocumentsTab student={student} />
            </TabsContent>
            <TabsContent value="id-card">
              <IdCardTab student={student} />
            </TabsContent>
            <TabsContent value="history">
              <HistoryTab student={student} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

export default function StudentDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading profile…</div>
      }
    >
      <StudentDetailInner />
    </Suspense>
  );
}
