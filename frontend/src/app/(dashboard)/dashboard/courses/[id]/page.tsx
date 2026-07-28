"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";

import { CourseStatusBadge } from "@/components/courses/course-status-badge";
import { DetailsTab } from "@/components/courses/tabs/details-tab";
import { FeesTab } from "@/components/courses/tabs/fees-tab";
import { MaterialsTab } from "@/components/courses/tabs/materials-tab";
import { SyllabusTab } from "@/components/courses/tabs/syllabus-tab";
import { TrainersTab } from "@/components/courses/tabs/trainers-tab";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  COURSE_TAB_LABELS,
  COURSE_TABS,
  courseDetailHref,
  parseCourseTab,
  type CourseTab,
} from "@/lib/course-tabs";
import { useCoursesStore } from "@/store/courses-store";

function CourseDetailInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courses = useCoursesStore((s) => s.courses);
  const course = courses.find((c) => c.id === params.id) ?? null;
  const tab = parseCourseTab(searchParams.get("tab"));

  function setTab(next: string | number | null) {
    if (typeof next !== "string" || !course) return;
    router.replace(courseDetailHref(course.id, parseCourseTab(next)), {
      scroll: false,
    });
  }

  if (!course) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Course not found"
        description="This course may have been removed, or the link is invalid."
        action={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/courses" />}
          >
            <ArrowLeft />
            Back to courses
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
          render={<Link href="/dashboard/courses" />}
          aria-label="Back to courses"
        >
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {course.title}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            {course.code}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <CourseStatusBadge status={course.status} />
            <span className="text-xs capitalize text-muted-foreground">
              {course.level} · {course.durationWeeks}w · Rs{" "}
              {course.fee.toLocaleString()}
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
              {COURSE_TABS.map((t) => (
                <TabsTrigger key={t} value={t}>
                  {COURSE_TAB_LABELS[t as CourseTab]}
                </TabsTrigger>
              ))}
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="details">
              <DetailsTab key={course.id} course={course} />
            </TabsContent>
            <TabsContent value="fees">
              <FeesTab key={course.id} course={course} />
            </TabsContent>
            <TabsContent value="syllabus">
              <SyllabusTab course={course} />
            </TabsContent>
            <TabsContent value="trainers">
              <TrainersTab course={course} />
            </TabsContent>
            <TabsContent value="materials">
              <MaterialsTab course={course} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

export default function CourseDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading course…</div>
      }
    >
      <CourseDetailInner />
    </Suspense>
  );
}
