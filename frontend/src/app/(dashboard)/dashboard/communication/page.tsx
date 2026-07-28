"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Plus } from "lucide-react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { BatchPicker } from "@/components/shared/entity-pickers";
import { StudentPicker } from "@/components/students/student-picker";
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
import { Textarea } from "@/components/ui/textarea";
import { useOpsStore } from "@/store/ops-store";
import { useStudentsStore } from "@/store/students-store";
import { studentFullName } from "@/types/student";
import type { Announcement } from "@/types/ops";

type MessageForm = {
  channel: Announcement["channel"];
  title: string;
  body: string;
  audience: Announcement["audience"];
  batchId: string | null;
  studentId: string | null;
};

const EMPTY_FORM: MessageForm = {
  channel: "board",
  title: "",
  body: "",
  audience: "all",
  batchId: null,
  studentId: null,
};

const CHANNEL_LABEL: Record<Announcement["channel"], string> = {
  sms: "SMS",
  email: "Email",
  whatsapp: "WhatsApp",
  board: "Announcement board",
};

export default function CommunicationPage() {
  const announcements = useOpsStore((s) => s.announcements);
  const addAnnouncement = useOpsStore((s) => s.addAnnouncement);
  const batches = useOpsStore((s) => s.batches);
  const students = useStudentsStore((s) => s.students);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MessageForm>(EMPTY_FORM);

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function send() {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and message required");
      return;
    }

    let audienceId: string | null = null;
    let audienceLabel = "All students";

    if (form.audience === "batch") {
      const batch = batches.find((b) => b.id === form.batchId);
      if (!batch) {
        toast.error("Select a batch");
        return;
      }
      audienceId = batch.id;
      audienceLabel = batch.name;
    } else if (form.audience === "student") {
      const student = students.find((s) => s.id === form.studentId);
      if (!student) {
        toast.error("Select a student");
        return;
      }
      audienceId = student.id;
      audienceLabel = studentFullName(student);
    }

    addAnnouncement({
      channel: form.channel,
      title: form.title.trim(),
      body: form.body.trim(),
      audience: form.audience,
      audienceId,
      audienceLabel,
    });
    toast.success("Message sent");
    setOpen(false);
    resetForm();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication"
        description="SMS, email, WhatsApp reminders, and announcement board."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus /> New message
          </Button>
        }
      />

      {announcements.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No messages yet" description="Send your first announcement." />
      ) : (
        <div className="grid gap-3">
          {announcements.map((a) => (
            <Card key={a.id} className="shadow-none">
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <div>
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {a.sentAt} · To {a.audienceLabel}
                  </p>
                </div>
                <SoftBadge tone="outline">{CHANNEL_LABEL[a.channel]}</SoftBadge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{a.body}</p>
                {a.deliveryLog.length > 0 ? (
                  <div className="space-y-1 border-t pt-2">
                    {a.deliveryLog.map((log) => (
                      <div key={log.id} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{log.status}</span>
                        <span>{new Date(log.at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send communication</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Channel</Label>
              <Select
                value={form.channel}
                onValueChange={(v) => v && setForm({ ...form, channel: v as Announcement["channel"] })}
              >
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="board">Announcement board</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Message</Label>
              <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Audience</Label>
              <Select
                value={form.audience}
                onValueChange={(v) =>
                  v &&
                  setForm({
                    ...form,
                    audience: v as Announcement["audience"],
                    batchId: null,
                    studentId: null,
                  })
                }
              >
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All students</SelectItem>
                  <SelectItem value="batch">Specific batch</SelectItem>
                  <SelectItem value="student">Specific student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.audience === "batch" ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Batch</Label>
                <BatchPicker value={form.batchId} onChange={(id) => setForm({ ...form, batchId: id })} />
              </div>
            ) : null}
            {form.audience === "student" ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Student</Label>
                <StudentPicker value={form.studentId} onChange={(id) => setForm({ ...form, studentId: id })} />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={send}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
