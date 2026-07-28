"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Users } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchField } from "@/components/shared/search-field";
import { RegistrationForm } from "@/components/students/registration-form";
import { StudentTable } from "@/components/students/student-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseStudentTab, studentDetailHref } from "@/lib/student-tabs";
import { useStudentsStore } from "@/store/students-store";
import type { Student } from "@/types/student";

function StudentsListInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const students = useStudentsStore((s) => s.students);

  const [query, setQuery] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);

  const preferredTab = parseStudentTab(searchParams.get("tab"));

  useEffect(() => {
    if (searchParams.get("register") === "1") {
      setRegisterOpen(true);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const hay =
        `${s.firstName} ${s.lastName} ${s.email} ${s.studentCode} ${s.course} ${s.batch}`.toLowerCase();
      return hay.includes(q);
    });
  }, [students, query]);

  const active = students.filter((s) => s.status === "active").length;
  const withPhoto = students.filter((s) => s.photoUrl).length;
  const cardsIssued = students.filter((s) => s.idCardIssued).length;

  function openStudent(student: Student) {
    router.push(studentDetailHref(student.id, preferredTab));
  }

  function handleRegistered(student: Student) {
    setRegisterOpen(false);
    router.replace("/dashboard/students");
    router.push(studentDetailHref(student.id, "profile"));
  }

  function handleRegisterOpenChange(open: boolean) {
    setRegisterOpen(open);
    if (!open && searchParams.get("register") === "1") {
      router.replace("/dashboard/students");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Directory of barista trainees. Register new students or open a profile to manage photo, contacts, documents, ID card, and history."
        actions={
          <Button size="sm" onClick={() => setRegisterOpen(true)}>
            <Plus />
            Register student
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total students" value={String(students.length)} />
        <Stat label="Active" value={String(active)} />
        <Stat label="With photo" value={String(withPhoto)} />
        <Stat label="ID cards issued" value={String(cardsIssued)} />
      </div>

      <Card className="shadow-none">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">All students</CardTitle>
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search name, code, course…"
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          {filtered.length ? (
            <StudentTable
              students={filtered}
              onSelect={openStudent}
              actionHref={(s) => studentDetailHref(s.id, preferredTab)}
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No students found"
              description="Try another search, or register a new student."
              action={
                <Button size="sm" onClick={() => setRegisterOpen(true)}>
                  <Plus />
                  Register student
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={registerOpen} onOpenChange={handleRegisterOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Register student</DialogTitle>
            <DialogDescription>
              One form for profile, photo, emergency contact, and documents.
            </DialogDescription>
          </DialogHeader>
          <RegistrationForm
            compact
            onCancel={() => handleRegisterOpenChange(false)}
            onSuccess={handleRegistered}
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

export default function StudentsListPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading students…</div>
      }
    >
      <StudentsListInner />
    </Suspense>
  );
}
