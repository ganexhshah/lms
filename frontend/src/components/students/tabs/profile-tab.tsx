"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Save, X } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
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
import { useOpsStore } from "@/store/ops-store";
import { useStudentsStore } from "@/store/students-store";
import type { Student, StudentStatus } from "@/types/student";

type ProfileTabProps = {
  student: Student;
};

export function ProfileTab({ student }: ProfileTabProps) {
  const updateStudent = useStudentsStore((s) => s.updateStudent);
  const setStatus = useStudentsStore((s) => s.setStatus);
  const courseOptions = useCoursesStore((s) =>
    s.courses.filter((c) => c.status === "active").map((c) => c.title)
  );
  const batchOptions = useOpsStore((s) => s.batches.map((b) => b.name));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Student> | null>(null);

  function startEdit() {
    setDraft({ ...student });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setDraft(null);
  }

  async function saveEdit() {
    if (!draft) return;
    try {
      await updateStudent(student.id, {
        firstName: draft.firstName,
        lastName: draft.lastName,
        email: draft.email,
        phone: draft.phone,
        address: draft.address,
        city: draft.city,
        course: draft.course,
        batch: draft.batch,
        bloodGroup: draft.bloodGroup,
        nationality: draft.nationality,
        dateOfBirth: draft.dateOfBirth,
        gender: draft.gender,
      });
      if (draft.status && draft.status !== student.status) {
        await setStatus(student.id, draft.status);
      }
      toast.success("Profile saved");
      setEditing(false);
      setDraft(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save profile"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Digital profile</p>
          <p className="text-xs text-muted-foreground">
            Contact, course, and enrollment details
          </p>
        </div>
        {editing ? (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={cancelEdit}>
              <X />
              Cancel
            </Button>
            <Button size="sm" onClick={saveEdit}>
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
          <EditField label="Date of birth">
            <Input
              type="date"
              value={draft.dateOfBirth ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, dateOfBirth: e.target.value })
              }
            />
          </EditField>
          <EditField label="Status">
            <Select
              value={draft.status}
              onValueChange={(v) =>
                v && setDraft({ ...draft, status: v as StudentStatus })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_hold">On hold</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>
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
          <EditField label="Batch">
            <Select
              value={draft.batch}
              onValueChange={(v) => v && setDraft({ ...draft, batch: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  ...new Set([
                    ...(draft.batch ? [draft.batch] : []),
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
          <EditField label="Blood group">
            <Input
              value={draft.bloodGroup ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, bloodGroup: e.target.value })
              }
            />
          </EditField>
          <EditField label="Nationality">
            <Input
              value={draft.nationality ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, nationality: e.target.value })
              }
            />
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
          <Item label="Email" value={student.email} />
          <Item label="Phone" value={student.phone} />
          <Item label="Date of birth" value={student.dateOfBirth} />
          <Item label="Gender" value={student.gender} />
          <Item label="Course" value={student.course} />
          <Item label="Batch" value={student.batch} />
          <Item label="City" value={student.city} />
          <Item label="Blood group" value={student.bloodGroup} />
          <Item label="Nationality" value={student.nationality} />
          <Item label="Enrolled" value={student.enrolledAt} />
          <Item label="Status" value={<StatusBadge status={student.status} />} />
          <Item
            label="Address"
            value={student.address}
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
