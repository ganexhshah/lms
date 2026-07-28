"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ClipboardCheck, QrCode } from "lucide-react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { PageHeader } from "@/components/shared/page-header";
import { BatchPicker } from "@/components/shared/entity-pickers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { AttendanceMark } from "@/types/ops";

export default function AttendancePage() {
  const attendance = useOpsStore((s) => s.attendance);
  const markAttendance = useOpsStore((s) => s.markAttendance);
  const notifyAbsences = useOpsStore((s) => s.notifyAbsences);
  const batches = useOpsStore((s) => s.batches);
  const students = useStudentsStore((s) => s.students);

  const [batchId, setBatchId] = useState(batches[0]?.id ?? "");
  const [method, setMethod] = useState<"manual" | "qr" | "fingerprint">("manual");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [marks, setMarks] = useState<Record<string, AttendanceMark["status"]>>({});

  const batch = batches.find((b) => b.id === batchId);
  const roster = useMemo(() => {
    if (!batch) return [];
    return batch.studentIds
      .map((id) => students.find((s) => s.id === id))
      .filter(Boolean);
  }, [batch, students]);

  const todayRate = useMemo(() => {
    const today = attendance.filter((a) => a.date === new Date().toISOString().slice(0, 10));
    const p = today.reduce((s, a) => s + a.present, 0);
    const t = today.reduce((s, a) => s + a.present + a.absent, 0);
    return t ? Math.round((p / t) * 100) : 0;
  }, [attendance]);

  function setStatus(studentId: string, status: AttendanceMark["status"]) {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
  }

  async function submit() {
    if (!batch) return toast.error("Select a batch");
    if (roster.length === 0) return toast.error("Batch has no roster");
    const records: AttendanceMark[] = roster.map((s) => ({
      studentId: s!.id,
      studentName: studentFullName(s!),
      status: marks[s!.id] ?? "present",
    }));
    try {
      await markAttendance({
        date: new Date().toISOString().slice(0, 10),
        batchId: batch.id,
        method,
        records,
      });
      toast.success("Attendance saved");
      setMarks({});
    } catch {
      toast.error("Could not save attendance");
    }
  }

  async function simulateCheckIn() {
    if (!batch || roster.length === 0) return toast.error("Select a batch with students");
    const records: AttendanceMark[] = roster.map((s) => ({
      studentId: s!.id,
      studentName: studentFullName(s!),
      status: "present",
    }));
    try {
      await markAttendance({
        date: new Date().toISOString().slice(0, 10),
        batchId: batch.id,
        method,
        records,
      });
      toast.success(`${method.toUpperCase()} check-in recorded for ${batch.name}`);
    } catch {
      toast.error("Could not record check-in");
    }
  }

  const filteredSessions = useMemo(() => {
    return attendance.filter((a) => {
      if (fromDate && a.date < fromDate) return false;
      if (toDate && a.date > toDate) return false;
      return true;
    });
  }, [attendance, fromDate, toDate]);

  function exportCsv() {
    const rows = [
      ["Date", "Batch", "Present", "Absent", "Method"],
      ...filteredSessions.map((a) => [
        a.date,
        a.batch,
        String(a.present),
        String(a.absent),
        a.method,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Per-student daily marking, QR/fingerprint simulation, reports, and absence notices."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Sessions logged" value={String(attendance.length)} />
        <Stat label="Today's rate" value={`${todayRate}%`} />
        <Stat
          label="Absences today"
          value={String(
            attendance
              .filter((a) => a.date === new Date().toISOString().slice(0, 10))
              .reduce((s, a) => s + a.absent, 0)
          )}
        />
      </div>

      <Card className="shadow-none">
        <Tabs defaultValue="daily">
          <CardHeader className="border-b pb-0">
            <TabsList variant="line">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="qr">QR / Fingerprint</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="absences">Absences</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="daily" className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Batch</Label>
                  <BatchPicker value={batchId} onChange={(id) => id && setBatchId(id)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Method</Label>
                  <Select
                    value={method}
                    onValueChange={(v) =>
                      v && setMethod(v as typeof method)
                    }
                  >
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="qr">QR</SelectItem>
                      <SelectItem value="fingerprint">Fingerprint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={submit}><ClipboardCheck /> Save attendance</Button>
                </div>
              </div>

              {roster.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No students on this batch roster. Enroll students under Batches.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roster.map((s) =>
                      s ? (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{studentFullName(s)}</TableCell>
                          <TableCell>
                            <Select
                              value={marks[s.id] ?? "present"}
                              onValueChange={(v) =>
                                v && setStatus(s.id, v as AttendanceMark["status"])
                              }
                            >
                              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="late">Late</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ) : null
                    )}
                  </TableBody>
                </Table>
              )}

              <div>
                <CardTitle className="mb-2 text-sm">Recent sessions</CardTitle>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.date}</TableCell>
                        <TableCell>{a.batch}</TableCell>
                        <TableCell>{a.present}</TableCell>
                        <TableCell>{a.absent}</TableCell>
                        <TableCell><SoftBadge tone="outline">{a.method}</SoftBadge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Simulate QR or fingerprint check-in for the selected batch roster.
              </p>
              <div className="max-w-sm space-y-1.5">
                <Label className="text-xs">Batch</Label>
                <BatchPicker value={batchId} onChange={(id) => id && setBatchId(id)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMethod("qr");
                    simulateCheckIn();
                  }}
                >
                  <QrCode /> Simulate QR check-in
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMethod("fingerprint");
                    simulateCheckIn();
                  }}
                >
                  Simulate fingerprint
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">From</Label>
                  <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">To</Label>
                  <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
                <Button size="sm" variant="outline" onClick={exportCsv}>Export CSV</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Avg present</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...new Set(filteredSessions.map((a) => a.batch))].map((name) => {
                    const rows = filteredSessions.filter((a) => a.batch === name);
                    const present = rows.reduce((s, a) => s + a.present, 0);
                    const total = rows.reduce((s, a) => s + a.present + a.absent, 0);
                    const avg = Math.round(present / Math.max(rows.length, 1));
                    const rate = total ? Math.round((present / total) * 100) : 0;
                    return (
                      <TableRow key={name}>
                        <TableCell>{name}</TableCell>
                        <TableCell>{rows.length}</TableCell>
                        <TableCell>{avg}</TableCell>
                        <TableCell>{rate}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="absences">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Absent students</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance
                    .filter((a) => a.absent > 0)
                    .map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.date}</TableCell>
                        <TableCell>{a.batch}</TableCell>
                        <TableCell className="text-sm">
                          {a.records
                            ?.filter((r) => r.status === "absent")
                            .map((r) => r.studentName)
                            .join(", ") || `${a.absent} absent`}
                          {a.notifiedAt ? (
                            <span className="ml-2 text-xs text-muted-foreground">(notified)</span>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              notifyAbsences(a.id);
                              toast.success(`Absence notice sent for ${a.batch}`);
                            }}
                          >
                            Notify
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
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
