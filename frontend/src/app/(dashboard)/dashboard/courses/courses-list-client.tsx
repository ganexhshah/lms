"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Plus } from "lucide-react";

import { CourseForm } from "@/components/courses/course-form";
import { CourseTable } from "@/components/courses/course-table";
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
import { courseDetailHref } from "@/lib/course-tabs";
import { useCoursesStore } from "@/store/courses-store";
import type { Course, CourseStatus } from "@/types/course";

type FilterKey = "all" | CourseStatus;

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

function CoursesListInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courses = useCoursesStore((s) => s.courses);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") setFormOpen(true);
    const status = searchParams.get("status") as FilterKey | null;
    if (status && FILTERS.some((f) => f.value === status)) setFilter(status);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      return `${c.title} ${c.code} ${c.level}`.toLowerCase().includes(q);
    });
  }, [courses, query, filter]);

  const counts = useMemo(
    () => ({
      total: courses.length,
      active: courses.filter((c) => c.status === "active").length,
      draft: courses.filter((c) => c.status === "draft").length,
      withMaterials: courses.filter((c) => c.materials.length > 0).length,
    }),
    [courses]
  );

  function openCourse(course: Course) {
    router.push(courseDetailHref(course.id));
  }

  function handleCreated(course: Course) {
    setFormOpen(false);
    router.replace("/dashboard/courses");
    router.push(courseDetailHref(course.id));
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);
    if (!open && searchParams.get("new") === "1") {
      router.replace("/dashboard/courses");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Create and manage barista courses, fees, syllabus, trainers, and materials."
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus />
            New course
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total courses" value={String(counts.total)} />
        <Stat label="Active" value={String(counts.active)} />
        <Stat label="Draft" value={String(counts.draft)} />
        <Stat label="With materials" value={String(counts.withMaterials)} />
      </div>

      <Card className="shadow-none">
        <CardHeader className="flex flex-col gap-3 space-y-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">All courses</CardTitle>
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search title, code…"
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
            <CourseTable
              courses={filtered}
              onSelect={openCourse}
              actionHref={(c) => courseDetailHref(c.id)}
            />
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No courses found"
              description="Try another filter, or create a new course."
              action={
                <Button size="sm" onClick={() => setFormOpen(true)}>
                  <Plus />
                  New course
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={handleFormOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create course</DialogTitle>
            <DialogDescription>
              Set title, duration, level, and starting fee.
            </DialogDescription>
          </DialogHeader>
          <CourseForm
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

export default function CoursesListPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading courses…</div>
      }
    >
      <CoursesListInner />
    </Suspense>
  );
}
