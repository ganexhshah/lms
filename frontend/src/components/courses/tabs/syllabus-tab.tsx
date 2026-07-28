"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ListTree, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCoursesStore } from "@/store/courses-store";
import type { Course } from "@/types/course";

type SyllabusTabProps = {
  course: Course;
};

export function SyllabusTab({ course }: SyllabusTabProps) {
  const addSyllabusItem = useCoursesStore((s) => s.addSyllabusItem);
  const removeSyllabusItem = useCoursesStore((s) => s.removeSyllabusItem);
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState(4);
  const [description, setDescription] = useState("");

  function add() {
    if (!title.trim()) {
      toast.error("Module title is required");
      return;
    }
    addSyllabusItem(course.id, {
      title: title.trim(),
      hours,
      description: description.trim(),
    });
    setTitle("");
    setHours(4);
    setDescription("");
    toast.success("Syllabus module added");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Module title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Espresso fundamentals"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hours</Label>
          <Input
            type="number"
            min={1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <div className="sm:col-span-2">
          <Button size="sm" onClick={add}>
            <Plus />
            Add module
          </Button>
        </div>
      </div>

      {course.syllabus.length === 0 ? (
        <EmptyState
          icon={ListTree}
          title="No syllabus yet"
          description="Add ordered modules for this course."
        />
      ) : (
        <ol className="space-y-2">
          {course.syllabus.map((item, index) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-xl border p-3"
            >
              <div>
                <p className="text-sm font-medium">
                  <span className="mr-2 text-muted-foreground tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.hours}h
                  {item.description ? ` · ${item.description}` : ""}
                </p>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Remove ${item.title}`}
                onClick={() => {
                  removeSyllabusItem(course.id, item.id);
                  toast.success("Module removed");
                }}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
