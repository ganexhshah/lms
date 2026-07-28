"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, UserCog } from "lucide-react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchField } from "@/components/shared/search-field";
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
import { useOpsStore } from "@/store/ops-store";
import type { TrainerRecord } from "@/types/ops";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  specialty: "",
  status: "active" as TrainerRecord["status"],
  salary: 60000,
  schedule: "",
};

export default function TrainersPage() {
  const router = useRouter();
  const trainers = useOpsStore((s) => s.trainers);
  const addTrainer = useOpsStore((s) => s.addTrainer);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trainers;
    return trainers.filter((t) =>
      `${t.name} ${t.specialty}`.toLowerCase().includes(q)
    );
  }, [trainers, query]);

  async function create() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    try {
      const trainer = await addTrainer({
        name: form.name,
        email: form.email,
        phone: form.phone,
        specialty: form.specialty,
        status: form.status,
        salary: form.salary,
        schedule: form.schedule,
      });
      toast.success("Trainer added");
      setOpen(false);
      setForm(emptyForm);
      router.push(`/dashboard/trainers/${trainer.id}`);
    } catch {
      toast.error("Could not add trainer");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trainers"
        description="Profiles, schedules, salary tracking, and performance."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus /> New trainer
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Trainers" value={String(trainers.length)} />
        <Stat label="Active" value={String(trainers.filter((t) => t.status === "active").length)} />
        <Stat
          label="Avg rating"
          value={(
            trainers.reduce((s, t) => s + t.rating, 0) / Math.max(trainers.length, 1)
          ).toFixed(1)}
        />
      </div>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">All trainers</CardTitle>
          <SearchField value={query} onChange={setQuery} className="max-w-xs" placeholder="Search…" />
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState icon={UserCog} title="No trainers" description="Add a trainer to get started." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow
                    key={t.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/trainers/${t.id}`)}
                  >
                    <TableCell>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.email}</p>
                    </TableCell>
                    <TableCell>{t.specialty}</TableCell>
                    <TableCell className="text-xs">{t.schedule}</TableCell>
                    <TableCell>{t.rating}</TableCell>
                    <TableCell><SoftBadge>{t.status.replace("_", " ")}</SoftBadge></TableCell>
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
            <DialogTitle>New trainer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Specialty</Label>
              <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => v && setForm({ ...form, status: v as TrainerRecord["status"] })}
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
              <div className="space-y-1.5">
                <Label className="text-xs">Salary (Rs)</Label>
                <Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Schedule</Label>
              <Input
                value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                placeholder="Mon–Fri · Morning"
              />
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
