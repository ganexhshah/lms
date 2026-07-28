"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Save, X } from "lucide-react";

import { AdmissionStatusBadge } from "@/components/admissions/admission-status-badge";
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
import { useAdmissionsStore } from "@/store/admissions-store";
import { useCoursesStore } from "@/store/courses-store";
import { useOpsStore } from "@/store/ops-store";
import type { AdmissionApplication } from "@/types/admission";

type ApplicationTabProps = {
  application: AdmissionApplication;
};

export function ApplicationTab({ application }: ApplicationTabProps) {
  const updateApplication = useAdmissionsStore((s) => s.updateApplication);
  const courseOptions = useCoursesStore((s) =>
    s.courses.filter((c) => c.status === "active").map((c) => c.title)
  );
  const batchOptions = useOpsStore((s) => s.batches.map((b) => b.name));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<AdmissionApplication> | null>(
    null
  );

  function startEdit() {
    setDraft({ ...application });
    setEditing(true);
  }

  async function save() {
    if (!draft) return;
    try {
      await updateApplication(application.id, {
        firstName: draft.firstName,
        lastName: draft.lastName,
        email: draft.email,
        phone: draft.phone,
        dateOfBirth: draft.dateOfBirth,
        gender: draft.gender,
        address: draft.address,
        city: draft.city,
        course: draft.course,
        preferredBatch: draft.preferredBatch,
      });
      toast.success("Application saved");
      setEditing(false);
      setDraft(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save application"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Application details</p>
          <p className="text-xs text-muted-foreground">
            Online application form data
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
          <EditField label="First name">
            <Input
              value={draft.firstName ?? ""}
              onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
            />
          </EditField>
          <EditField label="Last name">
            <Input
              value={draft.lastName ?? ""}
              onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
            />
          </EditField>
          <EditField label="Email">
            <Input
              value={draft.email ?? ""}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          </EditField>
          <EditField label="Phone">
            <Input
              value={draft.phone ?? ""}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            />
          </EditField>
          <EditField label="Course">
            <Select
              value={draft.course}
              onValueChange={(v) => v && setDraft({ ...draft, course: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  ...new Set([
                    ...(draft.course ? [draft.course] : []),
                    ...courseOptions,
                  ]),
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </EditField>
          <EditField label="Preferred batch">
            <Select
              value={draft.preferredBatch}
              onValueChange={(v) =>
                v && setDraft({ ...draft, preferredBatch: v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  ...new Set([
                    ...(draft.preferredBatch ? [draft.preferredBatch] : []),
                    ...batchOptions,
                  ]),
                ].map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </EditField>
          <EditField label="City">
            <Input
              value={draft.city ?? ""}
              onChange={(e) => setDraft({ ...draft, city: e.target.value })}
            />
          </EditField>
          <EditField label="Address" className="sm:col-span-2">
            <Textarea
              value={draft.address ?? ""}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              rows={2}
            />
          </EditField>
        </div>
      ) : (
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Item label="Email" value={application.email} />
          <Item label="Phone" value={application.phone} />
          <Item label="Date of birth" value={application.dateOfBirth || "—"} />
          <Item label="Gender" value={application.gender} />
          <Item label="Course" value={application.course} />
          <Item label="Preferred batch" value={application.preferredBatch} />
          <Item label="City" value={application.city} />
          <Item
            label="Status"
            value={<AdmissionStatusBadge status={application.status} />}
          />
          <Item
            label="Address"
            value={application.address}
            className="sm:col-span-2"
          />
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
