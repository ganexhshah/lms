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
import { ADMISSION_SOURCES } from "@/data/constants";
import { getApiErrorMessage } from "@/lib/api/utils";
import { useAdmissionsStore } from "@/store/admissions-store";
import { useCoursesStore } from "@/store/courses-store";
import { useOpsStore } from "@/store/ops-store";
import type {
  AdmissionApplication,
  AdmissionApplicationInput,
  AdmissionSource,
} from "@/types/admission";

const emptyForm: AdmissionApplicationInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "female",
  address: "",
  city: "",
  course: "",
  preferredBatch: "",
  source: "website",
  leadNotes: "",
};

type ApplicationFormProps = {
  onSuccess?: (app: AdmissionApplication) => void;
  onCancel?: () => void;
};

export function ApplicationForm({ onSuccess, onCancel }: ApplicationFormProps) {
  const createApplication = useAdmissionsStore((s) => s.createApplication);
  const courseOptions = useCoursesStore((s) =>
    s.courses.filter((c) => c.status === "active").map((c) => c.title)
  );
  const batchOptions = useOpsStore((s) => s.batches.map((b) => b.name));
  const [form, setForm] = useState<AdmissionApplicationInput>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AdmissionApplicationInput, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof AdmissionApplicationInput>(
    key: K,
    value: AdmissionApplicationInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const next: typeof errors = {};
    if (!form.firstName.trim()) next.firstName = "Required";
    if (!form.lastName.trim()) next.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      next.email = "Valid email required";
    }
    if (!form.phone.trim()) next.phone = "Required";
    if (!form.address.trim()) next.address = "Required";
    if (!form.city.trim()) next.city = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    if (!form.course.trim() || !form.preferredBatch.trim()) {
      toast.error("Select a course and preferred batch");
      return;
    }
    setSubmitting(true);
    try {
      const app = await createApplication(form);
      toast.success(`Application ${app.applicationCode} created`, {
        description: `${app.firstName} ${app.lastName}`,
      });
      setForm(emptyForm);
      onSuccess?.(app);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not create application"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First name" error={errors.firstName}>
          <Input
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
        </Field>
        <Field label="Last name" error={errors.lastName}>
          <Input
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <Input
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </Field>
        <Field label="Date of birth">
          <Input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
          />
        </Field>
        <Field label="Gender">
          <Select
            value={form.gender}
            onValueChange={(v) =>
              v && update("gender", v as AdmissionApplicationInput["gender"])
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Address" error={errors.address} className="sm:col-span-2">
          <Textarea
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            rows={2}
          />
        </Field>
        <Field label="City" error={errors.city}>
          <Input
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </Field>
        <Field label="Source">
          <Select
            value={form.source}
            onValueChange={(v) => v && update("source", v as AdmissionSource)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADMISSION_SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Course">
          <Select
            value={form.course || undefined}
            onValueChange={(v) => v && update("course", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courseOptions.length === 0 ? (
                <SelectItem value="__none" disabled>
                  No courses yet
                </SelectItem>
              ) : (
                courseOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Preferred batch">
          <Select
            value={form.preferredBatch || undefined}
            onValueChange={(v) => v && update("preferredBatch", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select batch" />
            </SelectTrigger>
            <SelectContent>
              {batchOptions.length === 0 ? (
                <SelectItem value="__none" disabled>
                  No batches yet
                </SelectItem>
              ) : (
                batchOptions.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Lead notes" className="sm:col-span-2">
          <Textarea
            value={form.leadNotes ?? ""}
            onChange={(e) => update("leadNotes", e.target.value)}
            placeholder="Optional notes for lead follow-up"
            rows={2}
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
              Submitting…
            </>
          ) : (
            "Submit application"
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
