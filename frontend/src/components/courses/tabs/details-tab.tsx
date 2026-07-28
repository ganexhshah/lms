"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Save, X } from "lucide-react";

import { CourseStatusBadge } from "@/components/courses/course-status-badge";
import { Button } from "@/components/ui/button";
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
import { useCoursesStore } from "@/store/courses-store";
import type { Course, CourseLevel, CourseStatus } from "@/types/course";

type DetailsTabProps = {
  course: Course;
};

export function DetailsTab({ course }: DetailsTabProps) {
  const updateCourse = useCoursesStore((s) => s.updateCourse);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Course> | null>(null);

  function startEdit() {
    setDraft({ ...course });
    setEditing(true);
  }

  async function save() {
    if (!draft) return;
    try {
      await updateCourse(course.id, {
        title: draft.title,
        description: draft.description,
        durationWeeks: draft.durationWeeks,
        durationHours: draft.durationHours,
        level: draft.level,
        status: draft.status,
      });
      toast.success("Course details saved");
      setEditing(false);
      setDraft(null);
    } catch {
      toast.error("Could not save course");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Course details</p>
          <p className="text-xs text-muted-foreground">
            Title, duration, level, and status
          </p>
        </div>
        {editing ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(false);
                setDraft(null);
              }}
            >
              <X />
              Cancel
            </Button>
            <Button size="sm" onClick={save}>
              <Save />
              Save
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={startEdit}>
            <Pencil />
            Edit
          </Button>
        )}
      </div>

      {editing && draft ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <EditField label="Title" className="sm:col-span-2">
            <Input
              value={draft.title ?? ""}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </EditField>
          <EditField label="Description" className="sm:col-span-2">
            <Textarea
              value={draft.description ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
              rows={3}
            />
          </EditField>
          <EditField label="Duration (weeks)">
            <Input
              type="number"
              min={1}
              value={draft.durationWeeks ?? 1}
              onChange={(e) =>
                setDraft({ ...draft, durationWeeks: Number(e.target.value) })
              }
            />
          </EditField>
          <EditField label="Duration (hours)">
            <Input
              type="number"
              min={1}
              value={draft.durationHours ?? 1}
              onChange={(e) =>
                setDraft({ ...draft, durationHours: Number(e.target.value) })
              }
            />
          </EditField>
          <EditField label="Level">
            <Select
              value={draft.level}
              onValueChange={(v) =>
                v && setDraft({ ...draft, level: v as CourseLevel })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </EditField>
          <EditField label="Status">
            <Select
              value={draft.status}
              onValueChange={(v) =>
                v && setDraft({ ...draft, status: v as CourseStatus })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </EditField>
        </div>
      ) : (
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Item label="Description" value={course.description} className="sm:col-span-2" />
          <Item
            label="Duration"
            value={`${course.durationWeeks} weeks · ${course.durationHours} hours`}
          />
          <Item label="Level" value={course.level} />
          <Item
            label="Status"
            value={<CourseStatusBadge status={course.status} />}
          />
          <Item label="Updated" value={course.updatedAt} />
        </dl>
      )}
    </div>
  );
}

function Item({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}

function EditField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
