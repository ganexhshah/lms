"use client";

import { BookOpen } from "lucide-react";

import { StudentAvatar } from "@/components/students/student-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { studentFullName, type Student } from "@/types/student";

type IdCardPreviewProps = {
  student: Student;
  className?: string;
};

export function IdCardPreview({ student, className }: IdCardPreviewProps) {
  return (
    <Card className={className}>
      <CardHeader className="border-b bg-muted/40 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-foreground text-background">
              <BookOpen className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm">Vellum LMS</CardTitle>
              <p className="text-[11px] text-muted-foreground">
                Student identity card
              </p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {student.studentCode}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex gap-4 pt-4">
        <StudentAvatar student={student} size="lg" className="size-20 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-base font-semibold leading-tight">
              {studentFullName(student)}
            </p>
            <p className="text-xs text-muted-foreground">{student.email}</p>
          </div>
          <Separator />
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <div>
              <dt className="text-muted-foreground">Course</dt>
              <dd className="font-medium">{student.course}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Batch</dt>
              <dd className="font-medium">{student.batch}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Blood group</dt>
              <dd className="font-medium">{student.bloodGroup}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <StatusBadge status={student.status} />
              </dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}
