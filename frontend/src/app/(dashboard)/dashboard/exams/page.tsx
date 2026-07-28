"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FilePen, Plus } from "lucide-react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchField } from "@/components/shared/search-field";
import { BatchPicker } from "@/components/shared/entity-pickers";
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
import type { ExamRecord } from "@/types/ops";

const emptyForm = {
  title: "",
  type: "practical" as ExamRecord["type"],
  date: "",
  passMark: 60,
  batchId: null as string | null,
};

export default function ExamsPage() {
  const router = useRouter();
  const exams = useOpsStore((s) => s.exams);
  const batches = useOpsStore((s) => s.batches);
  const addExam = useOpsStore((s) => s.addExam);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exams;
    return exams.filter((e) => `${e.title} ${e.course} ${e.batch}`.toLowerCase().includes(q));
  }, [exams, query]);

  async function create() {
    if (!form.title.trim() || !form.date || !form.batchId) {
      toast.error("Title, date, and batch are required");
      return;
    }
    const batch = batches.find((b) => b.id === form.batchId);
    if (!batch) {
      toast.error("Select a valid batch");
      return;
    }
    try {
      const exam = await addExam({
        title: form.title,
        course: batch.course,
        batch: batch.name,
        batchId: batch.id,
        type: form.type,
        date: form.date,
        passMark: form.passMark,
      });
      toast.success("Exam scheduled");
      setOpen(false);
      setForm(emptyForm);
      router.push(`/dashboard/exams/${exam.id}`);
    } catch {
      toast.error("Could not schedule exam");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        description="Practical, written, grades, pass/fail, and internal comments."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus /> New exam
          </Button>
        }
      />
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Exam schedule</CardTitle>
          <SearchField value={query} onChange={setQuery} className="max-w-xs" placeholder="Search…" />
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState icon={FilePen} title="No exams" description="Schedule an exam to get started." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Pass mark</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/exams/${e.id}`)}>
                    <TableCell>
                      <p className="font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.course} · {e.batch}</p>
                    </TableCell>
                    <TableCell className="capitalize">{e.type}</TableCell>
                    <TableCell>{e.date}</TableCell>
                    <TableCell>{e.passMark}%</TableCell>
                    <TableCell><SoftBadge>{e.status}</SoftBadge></TableCell>
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
            <DialogTitle>New exam</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Espresso practical" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Batch</Label>
              <BatchPicker value={form.batchId} onChange={(id) => setForm({ ...form, batchId: id })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => v && setForm({ ...form, type: v as ExamRecord["type"] })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practical">Practical</SelectItem>
                    <SelectItem value="written">Written</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Pass mark (%)</Label>
              <Input type="number" min={0} max={100} value={form.passMark} onChange={(e) => setForm({ ...form, passMark: Number(e.target.value) })} />
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
