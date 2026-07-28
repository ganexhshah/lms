"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Layers, UserMinus, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { BatchPicker } from "@/components/shared/entity-pickers";
import { StudentPicker } from "@/components/students/student-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

export default function BatchDetailPage() {
  const params = useParams<{ id: string }>();
  const batches = useOpsStore((s) => s.batches);
  const updateBatch = useOpsStore((s) => s.updateBatch);
  const enrollStudentInBatch = useOpsStore((s) => s.enrollStudentInBatch);
  const removeStudentFromBatch = useOpsStore((s) => s.removeStudentFromBatch);
  const transferStudent = useOpsStore((s) => s.transferStudent);
  const students = useStudentsStore((s) => s.students);
  const updateStudent = useStudentsStore((s) => s.updateStudent);
  const batch = batches.find((b) => b.id === params.id);

  const [enrollId, setEnrollId] = useState<string | null>(null);
  const [transferStudentId, setTransferStudentId] = useState<string | null>(null);
  const [transferTo, setTransferTo] = useState<string | null>(null);

  const roster = useMemo(() => {
    if (!batch) return [];
    return batch.studentIds
      .map((id) => students.find((s) => s.id === id))
      .filter(Boolean);
  }, [batch, students]);

  if (!batch) {
    return (
      <EmptyState
        icon={Layers}
        title="Batch not found"
        action={
          <Button size="sm" nativeButton={false} render={<Link href="/dashboard/batches" />}>
            <ArrowLeft /> Back
          </Button>
        }
      />
    );
  }

  function enroll() {
    if (!enrollId) return toast.error("Select a student");
    const student = students.find((s) => s.id === enrollId);
    if (!student) return;
    const ok = enrollStudentInBatch(batch!.id, enrollId, studentFullName(student));
    if (!ok) {
      toast.error("Cannot enroll — full, duplicate, or missing batch");
      return;
    }
    updateStudent(enrollId, { batch: batch!.name, course: batch!.course });
    toast.success(`${studentFullName(student)} enrolled`);
    setEnrollId(null);
  }

  function doTransfer() {
    if (!transferStudentId || !transferTo) {
      toast.error("Select student and target batch");
      return;
    }
    const student = students.find((s) => s.id === transferStudentId);
    if (!student) return;
    const target = batches.find((b) => b.id === transferTo);
    const ok = transferStudent(
      transferStudentId,
      studentFullName(student),
      batch!.id,
      transferTo
    );
    if (!ok) {
      toast.error("Transfer failed — check capacity and roster");
      return;
    }
    if (target) {
      updateStudent(transferStudentId, {
        batch: target.name,
        course: target.course,
      });
    }
    toast.success(`Transferred to ${target?.name}`);
    setTransferStudentId(null);
    setTransferTo(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button size="icon-sm" variant="outline" nativeButton={false} render={<Link href="/dashboard/batches" />}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{batch.name}</h1>
          <p className="text-sm text-muted-foreground">{batch.course} · {batch.trainer}</p>
          <div className="mt-1.5 flex gap-2">
            <SoftBadge>{batch.status}</SoftBadge>
            <SoftBadge tone="outline">{batch.shift}</SoftBadge>
          </div>
        </div>
      </div>

      <Card className="shadow-none">
        <Tabs defaultValue="roster">
          <CardHeader className="border-b pb-0">
            <TabsList variant="line">
              <TabsTrigger value="roster">Roster</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="capacity">Capacity</TabsTrigger>
              <TabsTrigger value="dates">Dates</TabsTrigger>
              <TabsTrigger value="transfers">Transfers</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <TabsContent value="roster" className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">Enroll student</Label>
                  <StudentPicker
                    value={enrollId}
                    onChange={setEnrollId}
                    filter={(s) => !batch.studentIds.includes(s.id)}
                  />
                </div>
                <Button size="sm" onClick={enroll} disabled={batch.enrolled >= batch.capacity}>
                  <UserPlus /> Enroll
                </Button>
              </div>
              {roster.length === 0 ? (
                <EmptyState icon={Layers} title="No students" description="Enroll students into this batch." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roster.map((s) =>
                      s ? (
                        <TableRow key={s.id}>
                          <TableCell>
                            <Link href={`/dashboard/students/${s.id}`} className="font-medium hover:underline">
                              {studentFullName(s)}
                            </Link>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{s.studentCode}</TableCell>
                          <TableCell><SoftBadge>{s.status}</SoftBadge></TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => {
                                removeStudentFromBatch(batch.id, s.id);
                                toast.success("Removed from roster");
                              }}
                            >
                              <UserMinus /> Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : null
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="overview" className="space-y-3">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Item label="Trainer" value={batch.trainer} />
                <Item label="Room" value={batch.room} />
                <Item label="Enrolled" value={`${batch.enrolled}/${batch.capacity}`} />
                <Item label="Progress" value={`${batch.progress}%`} />
              </dl>
            </TabsContent>

            <TabsContent value="capacity" className="space-y-3">
              <div className="space-y-1.5 max-w-xs">
                <Label className="text-xs">Capacity</Label>
                <Input
                  type="number"
                  defaultValue={batch.capacity}
                  onBlur={(e) => {
                    const capacity = Number(e.target.value);
                    if (capacity < batch.enrolled) {
                      toast.error("Capacity cannot be below enrolled count");
                      return;
                    }
                    updateBatch(batch.id, { capacity });
                    toast.success("Capacity updated");
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Enrolled is driven by the roster ({batch.enrolled} students).
              </p>
            </TabsContent>

            <TabsContent value="dates" className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Start date</Label>
                  <Input
                    type="date"
                    defaultValue={batch.startDate}
                    onBlur={(e) => {
                      updateBatch(batch.id, { startDate: e.target.value });
                      toast.success("Start date saved");
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">End date</Label>
                  <Input
                    type="date"
                    defaultValue={batch.endDate}
                    onBlur={(e) => {
                      updateBatch(batch.id, { endDate: e.target.value });
                      toast.success("End date saved");
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="transfers" className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Student in this batch</Label>
                  <StudentPicker
                    value={transferStudentId}
                    onChange={setTransferStudentId}
                    filter={(s) => batch.studentIds.includes(s.id)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Transfer to</Label>
                  <BatchPicker
                    value={transferTo}
                    onChange={setTransferTo}
                  />
                </div>
              </div>
              <Button size="sm" onClick={doTransfer}>Transfer student</Button>
              {(batch.transfers?.length ?? 0) > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batch.transfers.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.date}</TableCell>
                        <TableCell>{t.studentName}</TableCell>
                        <TableCell>{t.toBatchName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No transfers logged yet.</p>
              )}
            </TabsContent>

            <TabsContent value="progress" className="space-y-3">
              <Progress value={batch.progress} />
              <div className="space-y-1.5 max-w-xs">
                <Label className="text-xs">Progress %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={batch.progress}
                  onBlur={(e) => {
                    updateBatch(batch.id, { progress: Number(e.target.value) });
                    toast.success("Progress updated");
                  }}
                />
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
