"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import { CourseStatusBadge } from "@/components/courses/course-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Course } from "@/types/course";

type CourseTableProps = {
  courses: Course[];
  onSelect?: (course: Course) => void;
  actionHref?: (course: Course) => string;
  emptyMessage?: string;
};

export function CourseTable({
  courses,
  onSelect,
  actionHref,
  emptyMessage = "No courses found",
}: CourseTableProps) {
  if (!courses.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Course</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Fee</TableHead>
          <TableHead>Trainers</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow
            key={course.id}
            className={onSelect ? "cursor-pointer" : undefined}
            onClick={() => onSelect?.(course)}
          >
            <TableCell>
              <p className="font-medium">{course.title}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {course.level}
              </p>
            </TableCell>
            <TableCell className="font-mono text-xs">{course.code}</TableCell>
            <TableCell className="text-sm">
              {course.durationWeeks}w · {course.durationHours}h
            </TableCell>
            <TableCell className="tabular-nums">
              Rs {course.fee.toLocaleString()}
            </TableCell>
            <TableCell>{course.trainers.length}</TableCell>
            <TableCell>
              <CourseStatusBadge status={course.status} />
            </TableCell>
            <TableCell className="text-right">
              {actionHref ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  nativeButton={false}
                  render={<Link href={actionHref(course)} />}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`View ${course.title}`}
                >
                  <Eye className="size-4" />
                </Button>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
