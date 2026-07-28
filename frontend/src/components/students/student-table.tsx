"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import { StudentAvatar } from "@/components/students/student-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { studentFullName, type Student } from "@/types/student";

type StudentTableProps = {
  students: Student[];
  onSelect?: (student: Student) => void;
  actionHref?: (student: Student) => string;
  emptyMessage?: string;
};

export function StudentTable({
  students,
  onSelect,
  actionHref,
  emptyMessage = "No students found",
}: StudentTableProps) {
  if (!students.length) {
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
          <TableHead>Student</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Course / Batch</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow
            key={student.id}
            className={onSelect ? "cursor-pointer" : undefined}
            onClick={() => onSelect?.(student)}
          >
            <TableCell>
              <div className="flex items-center gap-2.5">
                <StudentAvatar student={student} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {studentFullName(student)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {student.email}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs">
              {student.studentCode}
            </TableCell>
            <TableCell>
              <p className="text-sm">{student.course}</p>
              <p className="text-xs text-muted-foreground">{student.batch}</p>
            </TableCell>
            <TableCell>
              <StatusBadge status={student.status} />
            </TableCell>
            <TableCell className="text-right">
              {actionHref ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  nativeButton={false}
                  render={<Link href={actionHref(student)} />}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`View ${studentFullName(student)}`}
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
