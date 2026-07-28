"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Eye, Plus, Trash2 } from "lucide-react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { PageHeader } from "@/components/shared/page-header";
import { SearchField } from "@/components/shared/search-field";
import { CoursePicker } from "@/components/shared/entity-pickers";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useOpsStore } from "@/store/ops-store";
import { useCoursesStore } from "@/store/courses-store";
import type { LearningItem } from "@/types/ops";

type LearningForm = {
  title: string;
  type: LearningItem["type"];
  courseId: string | null;
  url: string;
  description: string;
  status: LearningItem["status"];
};

const EMPTY_FORM: LearningForm = {
  title: "",
  type: "video",
  courseId: null,
  url: "",
  description: "",
  status: "draft",
};

export default function LearningPage() {
  const learning = useOpsStore((s) => s.learning);
  const addLearning = useOpsStore((s) => s.addLearning);
  const updateLearning = useOpsStore((s) => s.updateLearning);
  const removeLearning = useOpsStore((s) => s.removeLearning);
  const courses = useCoursesStore((s) => s.courses);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | LearningItem["type"]>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LearningForm>(EMPTY_FORM);
  const [viewId, setViewId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return learning.filter((l) => {
      if (filter !== "all" && l.type !== filter) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return `${l.title} ${l.course}`.toLowerCase().includes(q);
    });
  }, [learning, query, filter]);

  const viewItem = learning.find((l) => l.id === viewId) ?? null;

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function create() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const course = courses.find((c) => c.id === form.courseId);
    if (!course) {
      toast.error("Select a course");
      return;
    }
    addLearning({
      title: form.title.trim(),
      type: form.type,
      course: course.title,
      progress: 0,
      status: form.status,
      url: form.url.trim(),
      description: form.description.trim(),
    });
    toast.success("Content added");
    setOpen(false);
    resetForm();
  }

  function setProgress(id: string, value: number) {
    const clamped = Math.max(0, Math.min(100, value));
    updateLearning(id, { progress: clamped });
  }

  function togglePublish(item: LearningItem) {
    updateLearning(item.id, {
      status: item.status === "published" ? "draft" : "published",
    });
    toast.success("Status updated");
  }

  function remove(id: string) {
    removeLearning(id);
    if (viewId === id) setViewId(null);
    toast.success("Content removed");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning portal"
        description="Videos, PDFs, assignments, quizzes, and student progress."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus /> Create content
          </Button>
        }
      />
      <Card className="shadow-none">
        <CardHeader className="space-y-3">
          <div className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">Content</CardTitle>
            <SearchField value={query} onChange={setQuery} className="max-w-xs" placeholder="Search…" />
          </div>
          <Tabs value={filter} onValueChange={(v) => typeof v === "string" && setFilter(v as typeof filter)}>
            <TabsList className="h-auto flex-wrap">
              {(["all", "video", "pdf", "assignment", "quiz"] as const).map((t) => (
                <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id} className="cursor-pointer" onClick={() => setViewId(l.id)}>
                  <TableCell className="font-medium">{l.title}</TableCell>
                  <TableCell className="capitalize">{l.type}</TableCell>
                  <TableCell>{l.course}</TableCell>
                  <TableCell className="w-36" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Progress value={l.progress} className="w-16" />
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={l.progress}
                        onChange={(e) => setProgress(l.id, Number(e.target.value))}
                        className="h-7 w-16 px-1.5 text-xs"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <SoftBadge tone={l.status === "published" ? "default" : "outline"}>{l.status}</SoftBadge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button size="xs" variant="outline" onClick={() => togglePublish(l)}>
                        {l.status === "published" ? "Unpublish" : "Publish"}
                      </Button>
                      <Button size="icon-xs" variant="ghost" onClick={() => setViewId(l.id)}>
                        <Eye />
                      </Button>
                      <Button size="icon-xs" variant="ghost" onClick={() => remove(l.id)}>
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create content</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => v && setForm({ ...form, type: v as LearningItem["type"] })}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => v && setForm({ ...form, status: v as LearningItem["status"] })}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Course</Label>
              <CoursePicker value={form.courseId} onChange={(id) => setForm({ ...form, courseId: id })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">URL</Label>
              <Input
                placeholder="https://…"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={create}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!viewItem} onOpenChange={(next) => !next && setViewId(null)}>
        <SheetContent>
          {viewItem ? (
            <>
              <SheetHeader>
                <SheetTitle>{viewItem.title}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <SoftBadge className="capitalize">{viewItem.type}</SoftBadge>
                  <SoftBadge tone={viewItem.status === "published" ? "default" : "outline"}>
                    {viewItem.status}
                  </SoftBadge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Course</p>
                  <p className="text-sm font-medium">{viewItem.course}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <Progress value={viewItem.progress} />
                  <p className="text-xs tabular-nums text-muted-foreground">{viewItem.progress}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm">{viewItem.description || "No description provided."}</p>
                </div>
                {viewItem.url ? (
                  <a
                    href={viewItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    Open resource <ExternalLink className="size-3.5" />
                  </a>
                ) : (
                  <p className="text-xs text-muted-foreground">No URL attached.</p>
                )}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
