"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import { getApiErrorMessage } from "@/lib/api/utils";
import { useCoursesStore } from "@/store/courses-store";
import type {
  Course,
  CourseCreateInput,
  CourseLevel,
  CourseStatus,
} from "@/types/course";

const emptyForm: CourseCreateInput = {
  title: "",
  description: "",
  durationWeeks: 4,
  durationHours: 32,
  level: "beginner",
  fee: 30000,
  installments: 1,
  status: "draft",
};

type CourseFormProps = {
  onSuccess?: (course: Course) => void;
  onCancel?: () => void;
};

export function CourseForm({ onSuccess, onCancel }: CourseFormProps) {
  const createCourse = useCoursesStore((s) => s.createCourse);
  const [form, setForm] = useState<CourseCreateInput>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof CourseCreateInput>(
    key: K,
    value: CourseCreateInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const next: Partial<Record<string, string>> = {};
    if (!form.title.trim()) next.title = "Required";
    if (!form.description.trim()) next.description = "Required";
    if (form.durationWeeks < 1) next.durationWeeks = "Min 1 week";
    if (form.durationHours < 1) next.durationHours = "Min 1 hour";
    if (form.fee < 0) next.fee = "Invalid fee";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSubmitting(true);
    try {
      const course = await createCourse(form);
      toast.success(`Course ${course.code} created`);
      setForm(emptyForm);
      onSuccess?.(course);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not create course"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" error={errors.title} className="sm:col-span-2">
          <Input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Barista Level 1"
          />
        </Field>
        <Field
          label="Description"
          error={errors.description}
          className="sm:col-span-2"
        >
          <Textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
          />
        </Field>
        <Field label="Duration (weeks)" error={errors.durationWeeks}>
          <Input
            type="number"
            min={1}
            value={form.durationWeeks}
            onChange={(e) => update("durationWeeks", Number(e.target.value))}
          />
        </Field>
        <Field label="Duration (hours)" error={errors.durationHours}>
          <Input
            type="number"
            min={1}
            value={form.durationHours}
            onChange={(e) => update("durationHours", Number(e.target.value))}
          />
        </Field>
        <Field label="Level">
          <Select
            value={form.level}
            onValueChange={(v) => v && update("level", v as CourseLevel)}
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
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            onValueChange={(v) => v && update("status", v as CourseStatus)}
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
        </Field>
        <Field label="Fee (Rs)" error={errors.fee}>
          <Input
            type="number"
            min={0}
            value={form.fee}
            onChange={(e) => update("fee", Number(e.target.value))}
          />
        </Field>
        <Field label="Installments">
          <Input
            type="number"
            min={1}
            max={12}
            value={form.installments}
            onChange={(e) => update("installments", Number(e.target.value))}
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2 border-t pt-4">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" />
              Creating…
            </>
          ) : (
            "Create course"
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
