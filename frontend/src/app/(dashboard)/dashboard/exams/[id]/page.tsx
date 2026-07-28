"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, FilePen, MessageSquare, Save } from "lucide-react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOpsStore } from "@/store/ops-store";
import { useStudentsStore } from "@/store/students-store";
import { studentFullName } from "@/types/student";
import type { ExamGrade } from "@/types/ops";

type DraftRow = { score: number; comment: string };

function buildDrafts(
  roster: { id: string }[],
  grades: ExamGrade[]
): Record<string, DraftRow> {
  const next: Record<string, DraftRow> = {};
  for (const student of roster) {
    const existing = grades.find((g) => g.studentId === student.id);
    next[student.id] = {
      score: existing?.score ?? 0,
      comment: existing?.comment ?? "",
    };
  }
  return next;
}

export default function ExamDetailPage() {
  const params = useParams<{ id: string }>();
  const exams = useOpsStore((s) => s.exams);
  const batches = useOpsStore((s) => s.batches);
  const saveExamGrades = useOpsStore((s) => s.saveExamGrades);
  const students = useStudentsStore((s) => s.students);
  const exam = exams.find((e) => e.id === params.id);
  const batch = useMemo(
    () => (exam ? batches.find((b) => b.id === exam.batchId) : undefined),
    [batches, exam]
  );

  const roster = useMemo(() => {
    if (!batch) return [];
    return batch.studentIds
      .map((id) => students.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
  }, [batch, students]);

  const rosterKey = `${exam?.id ?? ""}:${roster.map((s) => s.id).join(",")}`;
  const [loadedKey, setLoadedKey] = useState(rosterKey);
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>(() =>
    buildDrafts(roster, exam?.grades ?? [])
  );

  if (rosterKey !== loadedKey) {
    setLoadedKey(rosterKey);
    setDrafts(buildDrafts(roster, exam?.grades ?? []));
  }

  if (!exam) {
    return (
      <EmptyState
        icon={FilePen}
        title="Exam not found"
        action={
          <Button size="sm" nativeButton={false} render={<Link href="/dashboard/exams" />}>
            <ArrowLeft /> Back
          </Button>
        }
      />
    );
  }

  function saveGrades() {
    if (!exam || !batch) return;
    const grades: ExamGrade[] = roster.map((student) => {
      const draft = drafts[student.id] ?? { score: 0, comment: "" };
      return {
        studentId: student.id,
        studentName: studentFullName(student),
        score: draft.score,
        passed: draft.score >= exam.passMark,
        comment: draft.comment,
      };
    });
    saveExamGrades(exam.id, grades);
    toast.success("Grades saved");
  }

  const passedCount = exam.grades.filter((g) => g.passed).length;
  const failedCount = exam.grades.length - passedCount;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button size="icon-sm" variant="outline" nativeButton={false} render={<Link href="/dashboard/exams" />}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">{exam.course} · {exam.batch}</p>
          <SoftBadge className="mt-1.5">{exam.status}</SoftBadge>
        </div>
      </div>
      <Card className="shadow-none">
        <Tabs defaultValue="marks">
          <CardHeader className="border-b pb-0">
            <TabsList variant="line">
              <TabsTrigger value="marks">Marks</TabsTrigger>
              <TabsTrigger value="grades">Pass / Fail</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <TabsContent value="marks" className="space-y-3">
              <p className="text-sm text-muted-foreground capitalize">
                {exam.type} exam · pass mark {exam.passMark}% · {roster.length} student(s) in {exam.batch}
              </p>
              {roster.length === 0 ? (
                <EmptyState icon={FilePen} title="No students in this batch" description="Enroll students into the batch to grade this exam." />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="w-32">Score %</TableHead>
                        <TableHead>Comment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roster.map((student) => {
                        const draft = drafts[student.id] ?? { score: 0, comment: "" };
                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <p className="font-medium">{studentFullName(student)}</p>
                              <p className="text-xs text-muted-foreground">{student.studentCode}</p>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={draft.score}
                                onChange={(e) =>
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [student.id]: { ...draft, score: Number(e.target.value) },
                                  }))
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={draft.comment}
                                placeholder="Comment…"
                                onChange={(e) =>
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [student.id]: { ...draft, comment: e.target.value },
                                  }))
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <Button size="sm" onClick={saveGrades}>
                    <Save /> Save grades
                  </Button>
                </>
              )}
            </TabsContent>

            <TabsContent value="grades" className="space-y-3">
              {exam.grades.length === 0 ? (
                <EmptyState icon={FilePen} title="Not graded yet" description="Save marks to see pass/fail results here." />
              ) : (
                <>
                  <div className="flex gap-4 text-sm">
                    <p><span className="font-medium text-foreground">{passedCount}</span> passed</p>
                    <p><span className="font-medium text-foreground">{failedCount}</span> failed</p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Result</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exam.grades.map((g) => (
                        <TableRow key={g.studentId}>
                          <TableCell>{g.studentName}</TableCell>
                          <TableCell>{g.score}%</TableCell>
                          <TableCell>
                            <SoftBadge tone={g.passed ? "secondary" : "destructive"}>
                              {g.passed ? "Pass" : "Fail"}
                            </SoftBadge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </TabsContent>

            <TabsContent value="comments" className="space-y-3">
              {exam.grades.filter((g) => g.comment.trim()).length === 0 ? (
                <EmptyState icon={MessageSquare} title="No comments" description="Comments added while grading will show here." />
              ) : (
                <div className="space-y-3">
                  {exam.grades
                    .filter((g) => g.comment.trim())
                    .map((g) => (
                      <div key={g.studentId} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{g.studentName}</p>
                          <SoftBadge tone={g.passed ? "secondary" : "destructive"}>
                            {g.passed ? "Pass" : "Fail"}
                          </SoftBadge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{g.comment}</p>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
