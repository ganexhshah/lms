"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SoftBadge } from "@/components/shared/soft-badge";
import { BatchPicker, TrainerPicker } from "@/components/shared/entity-pickers";
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
import { useOpsStore } from "@/store/ops-store";
import type { TimetableSlot } from "@/types/ops";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type SlotForm = {
  day: string;
  time: string;
  course: string;
  batchId: string | null;
  trainerId: string | null;
  room: string;
};

const EMPTY_FORM: SlotForm = {
  day: "Monday",
  time: "08:00–10:00",
  course: "",
  batchId: null,
  trainerId: null,
  room: "",
};

export default function TimetablePage() {
  const timetable = useOpsStore((s) => s.timetable);
  const batches = useOpsStore((s) => s.batches);
  const trainers = useOpsStore((s) => s.trainers);
  const addTimetableSlot = useOpsStore((s) => s.addTimetableSlot);
  const updateTimetableSlot = useOpsStore((s) => s.updateTimetableSlot);
  const removeTimetableSlot = useOpsStore((s) => s.removeTimetableSlot);

  const [weekLabel, setWeekLabel] = useState("This week");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SlotForm>(EMPTY_FORM);

  function openAdd(day?: string) {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, day: day ?? "Monday" });
    setOpen(true);
  }

  function openEdit(slot: TimetableSlot) {
    setEditingId(slot.id);
    setForm({
      day: slot.day,
      time: slot.time,
      course: slot.course,
      batchId: slot.batchId || null,
      trainerId: slot.trainerId || null,
      room: slot.room,
    });
    setOpen(true);
  }

  function save() {
    if (!form.course.trim() || !form.time.trim()) {
      toast.error("Course and time are required");
      return;
    }
    const batch = batches.find((b) => b.id === form.batchId);
    const trainer = trainers.find((t) => t.id === form.trainerId);

    const payload = {
      day: form.day,
      time: form.time.trim(),
      course: form.course.trim(),
      batch: batch?.name ?? "",
      batchId: batch?.id ?? "",
      trainer: trainer?.name ?? "",
      trainerId: trainer?.id ?? "",
      room: form.room.trim(),
    };

    if (editingId) {
      const result = await updateTimetableSlot(editingId, payload);
      if (!result.ok) {
        toast.error(result.conflict ?? "Slot conflict");
        return;
      }
      toast.success("Slot updated");
    } else {
      const result = await addTimetableSlot(payload);
      if (!result.ok) {
        toast.error(result.conflict ?? "Slot conflict");
        return;
      }
      toast.success("Slot added");
    }
    setOpen(false);
  }

  async function remove(id: string) {
    try {
      await removeTimetableSlot(id);
      toast.success("Slot removed");
    } catch {
      toast.error("Could not remove slot");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable"
        description="Weekly schedule with classroom and trainer assignment."
        actions={
          <Button size="sm" onClick={() => openAdd()}>
            <Plus /> Add slot
          </Button>
        }
      />

      <div className="flex items-center gap-2 max-w-xs">
        <Label className="text-xs whitespace-nowrap text-muted-foreground">Week</Label>
        <Input value={weekLabel} onChange={(e) => setWeekLabel(e.target.value)} className="h-8" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {DAYS.map((day) => {
          const slots = [...timetable]
            .filter((s) => s.day === day)
            .sort((a, b) => a.time.localeCompare(b.time));
          return (
            <Card key={day} className="shadow-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{day}</CardTitle>
                <Button variant="ghost" size="icon-xs" onClick={() => openAdd(day)}>
                  <Plus />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {slots.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No classes</p>
                ) : (
                  slots.map((s) => (
                    <div key={s.id} className="group rounded-lg border px-3 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground tabular-nums">{s.time}</p>
                          <p className="text-sm font-medium">{s.course}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button variant="ghost" size="icon-xs" onClick={() => openEdit(s)}>
                            <Pencil />
                          </Button>
                          <Button variant="ghost" size="icon-xs" onClick={() => remove(s.id)}>
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <SoftBadge tone="outline">{s.batch || "No batch"}</SoftBadge>
                        <SoftBadge tone="outline">{s.trainer || "No trainer"}</SoftBadge>
                        <SoftBadge tone="outline">{s.room || "No room"}</SoftBadge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit slot" : "Add timetable slot"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Day</Label>
                <Select
                  value={form.day}
                  onValueChange={(v) => v && setForm({ ...form, day: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Time</Label>
                <Input
                  placeholder="08:00–10:00"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Course title</Label>
              <Input
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Batch</Label>
              <BatchPicker value={form.batchId} onChange={(id) => setForm({ ...form, batchId: id })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Trainer</Label>
              <TrainerPicker value={form.trainerId} onChange={(id) => setForm({ ...form, trainerId: id })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Room</Label>
              <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editingId ? "Save changes" : "Add slot"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
