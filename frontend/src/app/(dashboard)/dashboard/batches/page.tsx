"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Layers, Plus } from "lucide-react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchField } from "@/components/shared/search-field";
import {
  CoursePicker,
  TrainerPicker,
} from "@/components/shared/entity-pickers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Progress } from "@/components/ui/progress";
import { useOpsStore } from "@/store/ops-store";
import { useCoursesStore } from "@/store/courses-store";

export default function BatchesPage() {
  const router = useRouter();
  const batches = useOpsStore((s) => s.batches);
  const addBatch = useOpsStore((s) => s.addBatch);
  const trainers = useOpsStore((s) => s.trainers);
  const courses = useCoursesStore((s) => s.courses);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    courseId: "crs-001",
    shift: "morning" as "morning" | "evening",
    capacity: 16,
    startDate: "",
    endDate: "",
    trainerId: "tr-1",
    room: "Lab 1",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return batches;
    return batches.filter((b) =>
      `${b.name} ${b.course} ${b.trainer}`.toLowerCase().includes(q)
    );
  }, [batches, query]);

  const active = batches.filter((b) => b.status === "active").length;

  async function create() {
    if (!form.name || !form.startDate || !form.endDate) {
      toast.error("Name and dates are required");
      return;
    }
    const course = courses.find((c) => c.id === form.courseId);
    const trainer = trainers.find((t) => t.id === form.trainerId);
    if (!course || !trainer) {
      toast.error("Select course and trainer");
      return;
    }
    try {
      const batch = await addBatch({
        name: form.name,
        course: course.title,
        courseId: course.id,
        shift: form.shift,
        capacity: form.capacity,
        startDate: form.startDate,
        endDate: form.endDate,
        progress: 0,
        trainer: trainer.name,
        trainerId: trainer.id,
        room: form.room,
        status: "upcoming",
      });
      toast.success("Batch created");
      setOpen(false);
      router.push(`/dashboard/batches/${batch.id}`);
    } catch {
      toast.error("Could not create batch");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batches"
        description="Morning/evening batches, capacity, roster, transfers, and progress."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus />
            New batch
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total batches" value={String(batches.length)} />
        <Stat label="Active" value={String(active)} />
        <Stat
          label="Seats filled"
          value={`${batches.reduce((a, b) => a + b.enrolled, 0)}/${batches.reduce((a, b) => a + b.capacity, 0)}`}
        />
      </div>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">All batches</CardTitle>
          <SearchField value={query} onChange={setQuery} placeholder="Search…" className="max-w-xs" />
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState icon={Layers} title="No batches" description="Create a batch to get started." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow
                    key={b.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/batches/${b.id}`)}
                  >
                    <TableCell>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.course} · {b.trainer}</p>
                    </TableCell>
                    <TableCell className="capitalize">{b.shift}</TableCell>
                    <TableCell>
                      {b.enrolled}/{b.capacity}
                    </TableCell>
                    <TableCell className="w-40">
                      <Progress value={b.progress} />
                    </TableCell>
                    <TableCell>
                      <SoftBadge>{b.status}</SoftBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New batch</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Course</Label>
              <CoursePicker
                value={form.courseId}
                onChange={(id) => id && setForm({ ...form, courseId: id })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Trainer</Label>
              <TrainerPicker
                value={form.trainerId}
                onChange={(id) => id && setForm({ ...form, trainerId: id })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Shift</Label>
              <Select
                value={form.shift}
                onValueChange={(v) => v && setForm({ ...form, shift: v as "morning" | "evening" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Start</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Capacity</Label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Room</Label>
                <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create}>Create</Button>
          </DialogFooter>
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
