"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CalendarPlus, Star, Trash2, UserCog, Wallet } from "lucide-react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import type { TrainerRecord } from "@/types/ops";

const emptySlot = { day: "Monday", time: "", batch: "", room: "" };
const emptySalary = { date: new Date().toISOString().slice(0, 10), amount: 0, note: "" };
const emptyRating = { date: new Date().toISOString().slice(0, 10), score: 4.5, note: "" };

export default function TrainerDetailPage() {
  const params = useParams<{ id: string }>();
  const trainers = useOpsStore((s) => s.trainers);
  const updateTrainer = useOpsStore((s) => s.updateTrainer);
  const addTrainerScheduleSlot = useOpsStore((s) => s.addTrainerScheduleSlot);
  const removeTrainerScheduleSlot = useOpsStore((s) => s.removeTrainerScheduleSlot);
  const addSalaryEntry = useOpsStore((s) => s.addSalaryEntry);
  const addRatingEvent = useOpsStore((s) => s.addRatingEvent);
  const trainer = trainers.find((t) => t.id === params.id);

  const [slotForm, setSlotForm] = useState(emptySlot);
  const [salaryForm, setSalaryForm] = useState(emptySalary);
  const [ratingForm, setRatingForm] = useState(emptyRating);

  if (!trainer) {
    return (
      <EmptyState
        icon={UserCog}
        title="Trainer not found"
        action={
          <Button size="sm" nativeButton={false} render={<Link href="/dashboard/trainers" />}>
            <ArrowLeft /> Back
          </Button>
        }
      />
    );
  }

  function addSlot() {
    if (!trainer) return;
    if (!slotForm.time.trim() || !slotForm.batch.trim() || !slotForm.room.trim()) {
      toast.error("Time, batch, and room are required");
      return;
    }
    addTrainerScheduleSlot(trainer.id, { ...slotForm });
    toast.success("Slot added");
    setSlotForm(emptySlot);
  }

  function addSalary() {
    if (!trainer) return;
    if (!salaryForm.amount || salaryForm.amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    addSalaryEntry(trainer.id, { ...salaryForm });
    toast.success("Salary entry added");
    setSalaryForm({ ...emptySalary, date: new Date().toISOString().slice(0, 10) });
  }

  function addRating() {
    if (!trainer) return;
    if (ratingForm.score < 1 || ratingForm.score > 5) {
      toast.error("Score must be between 1 and 5");
      return;
    }
    addRatingEvent(trainer.id, { ...ratingForm });
    toast.success("Rating recorded");
    setRatingForm({ ...emptyRating, date: new Date().toISOString().slice(0, 10) });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button size="icon-sm" variant="outline" nativeButton={false} render={<Link href="/dashboard/trainers" />}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{trainer.name}</h1>
          <p className="text-sm text-muted-foreground">{trainer.specialty}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <SoftBadge>{trainer.status.replace("_", " ")}</SoftBadge>
            <SoftBadge tone="outline">
              <Star className="size-3" /> {trainer.rating.toFixed(1)}
            </SoftBadge>
          </div>
        </div>
      </div>
      <Card className="shadow-none">
        <Tabs defaultValue="profile">
          <CardHeader className="border-b pb-0">
            <TabsList variant="line">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="salary">Salary</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <TabsContent value="profile" className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" value={trainer.name} onSave={(v) => { updateTrainer(trainer.id, { name: v }); toast.success("Saved"); }} />
              <Field label="Email" value={trainer.email} onSave={(v) => { updateTrainer(trainer.id, { email: v }); toast.success("Saved"); }} />
              <Field label="Phone" value={trainer.phone} onSave={(v) => { updateTrainer(trainer.id, { phone: v }); toast.success("Saved"); }} />
              <Field label="Specialty" value={trainer.specialty} onSave={(v) => { updateTrainer(trainer.id, { specialty: v }); toast.success("Saved"); }} />
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={trainer.status}
                  onValueChange={(v) => {
                    if (!v) return;
                    updateTrainer(trainer.id, { status: v as TrainerRecord["status"] });
                    toast.success("Status updated");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field
                label="Schedule summary"
                value={trainer.schedule}
                onSave={(v) => {
                  updateTrainer(trainer.id, { schedule: v });
                  toast.success("Schedule updated");
                }}
              />
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-5 sm:items-end">
                <div className="space-y-1.5">
                  <Label className="text-xs">Day</Label>
                  <Select value={slotForm.day} onValueChange={(v) => v && setSlotForm({ ...slotForm, day: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Time</Label>
                  <Input value={slotForm.time} onChange={(e) => setSlotForm({ ...slotForm, time: e.target.value })} placeholder="08:00–10:00" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Batch</Label>
                  <Input value={slotForm.batch} onChange={(e) => setSlotForm({ ...slotForm, batch: e.target.value })} placeholder="Morning A" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Room</Label>
                  <Input value={slotForm.room} onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })} placeholder="Lab 1" />
                </div>
                <Button size="sm" onClick={addSlot}>
                  <CalendarPlus /> Add slot
                </Button>
              </div>
              {trainer.scheduleSlots.length === 0 ? (
                <EmptyState icon={CalendarPlus} title="No schedule slots" description="Add a slot to build this trainer's weekly schedule." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainer.scheduleSlots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell>{slot.day}</TableCell>
                        <TableCell>{slot.time}</TableCell>
                        <TableCell>{slot.batch}</TableCell>
                        <TableCell>{slot.room}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon-xs"
                            variant="outline"
                            onClick={() => {
                              removeTrainerScheduleSlot(trainer.id, slot.id);
                              toast.success("Slot removed");
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="salary" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Current monthly salary: <span className="font-medium text-foreground">Rs {trainer.salary.toLocaleString()}</span>
              </p>
              <div className="grid gap-2 sm:grid-cols-4 sm:items-end">
                <div className="space-y-1.5">
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={salaryForm.date} onChange={(e) => setSalaryForm({ ...salaryForm, date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Amount (Rs)</Label>
                  <Input type="number" value={salaryForm.amount} onChange={(e) => setSalaryForm({ ...salaryForm, amount: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-xs">Note</Label>
                  <Input value={salaryForm.note} onChange={(e) => setSalaryForm({ ...salaryForm, note: e.target.value })} placeholder="e.g. July salary" />
                </div>
                <Button size="sm" onClick={addSalary}>
                  <Wallet /> Add entry
                </Button>
              </div>
              {trainer.salaryHistory.length === 0 ? (
                <EmptyState icon={Wallet} title="No salary history" description="Record salary payouts for this trainer." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainer.salaryHistory.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>Rs {entry.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Overall rating: <span className="font-medium text-foreground">{trainer.rating.toFixed(1)} / 5</span>
              </p>
              <div className="grid gap-2 sm:grid-cols-4 sm:items-end">
                <div className="space-y-1.5">
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={ratingForm.date} onChange={(e) => setRatingForm({ ...ratingForm, date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Score (1–5)</Label>
                  <Input type="number" min={1} max={5} step={0.1} value={ratingForm.score} onChange={(e) => setRatingForm({ ...ratingForm, score: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-xs">Note</Label>
                  <Input value={ratingForm.note} onChange={(e) => setRatingForm({ ...ratingForm, note: e.target.value })} placeholder="Feedback source" />
                </div>
                <Button size="sm" onClick={addRating}>
                  <Star /> Add rating
                </Button>
              </div>
              {trainer.ratingHistory.length === 0 ? (
                <EmptyState icon={Star} title="No performance history" description="Log rating events as feedback comes in." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainer.ratingHistory.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.score.toFixed(1)}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onSave,
  type = "text",
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type={type} defaultValue={value} onBlur={(e) => onSave(e.target.value)} />
    </div>
  );
}
