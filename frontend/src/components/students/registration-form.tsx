"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import { FileDropzone } from "@/components/shared/file-dropzone";
import { StudentAvatar } from "@/components/students/student-avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  BLOOD_GROUPS,
  DOCUMENT_TYPES,
  RELATIONSHIPS,
} from "@/data/constants";
import { getApiErrorMessage } from "@/lib/api/utils";
import {
  addDocumentFile,
  addEmergencyContact,
  updateStudentPhotoFile,
} from "@/lib/api/students";
import { useCoursesStore } from "@/store/courses-store";
import { useOpsStore } from "@/store/ops-store";
import { useStudentsStore } from "@/store/students-store";
import type {
  RegistrationDraftDocument,
  Student,
  StudentDocument,
  StudentRegistrationInput,
} from "@/types/student";

const emptyForm: StudentRegistrationInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "female",
  address: "",
  city: "",
  course: "",
  batch: "",
  bloodGroup: "O+",
  nationality: "Nepali",
};

type ContactDraft = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimary: boolean;
};

const emptyContact: ContactDraft = {
  name: "",
  relationship: "Parent",
  phone: "",
  email: "",
  isPrimary: true,
};

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function draftId() {
  return `tmp-${Math.random().toString(36).slice(2, 9)}`;
}

type RegistrationFormProps = {
  onSuccess?: (student: Student) => void;
  onCancel?: () => void;
  compact?: boolean;
};

export function RegistrationForm({
  onSuccess,
  onCancel,
  compact,
}: RegistrationFormProps) {
  const registerStudent = useStudentsStore((s) => s.registerStudent);
  const courseOptions = useCoursesStore((s) =>
    s.courses.filter((c) => c.status === "active").map((c) => c.title)
  );
  const batchOptions = useOpsStore((s) => s.batches.map((b) => b.name));
  const [form, setForm] = useState<StudentRegistrationInput>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof StudentRegistrationInput, string>>
  >({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [contact, setContact] = useState<ContactDraft>(emptyContact);
  const [contactError, setContactError] = useState<string | null>(null);
  const [docType, setDocType] =
    useState<StudentDocument["type"]>("id_proof");
  const [documents, setDocuments] = useState<RegistrationDraftDocument[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const previewStudent = useMemo(
    () => ({
      firstName: form.firstName || "New",
      lastName: form.lastName || "Student",
      photoUrl: photoPreview,
    }),
    [form.firstName, form.lastName, photoPreview]
  );

  function update<K extends keyof StudentRegistrationInput>(
    key: K,
    value: StudentRegistrationInput[K]
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
    if (!form.dateOfBirth) next.dateOfBirth = "Required";
    if (!form.address.trim()) next.address = "Required";
    if (!form.city.trim()) next.city = "Required";
    setErrors(next);

    const started =
      contact.name.trim() || contact.phone.trim() || contact.email.trim();
    if (started && (!contact.name.trim() || !contact.phone.trim())) {
      setContactError("Name and phone are required if you add a contact");
      return false;
    }
    setContactError(null);

    return Object.keys(next).length === 0;
  }

  function handlePhoto(files: File[]) {
    const file = files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function handleDocuments(files: File[]) {
    const next = files.map((file) => ({
      id: draftId(),
      file,
      name: file.name,
      type: docType,
      sizeLabel: formatBytes(file.size),
    }));
    setDocuments((prev) => [...next, ...prev]);
  }

  function removeDocument(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  function resetAll() {
    clearPhoto();
    setForm(emptyForm);
    setErrors({});
    setContact(emptyContact);
    setContactError(null);
    setDocuments([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    if (!form.course.trim() || !form.batch.trim()) {
      toast.error("Select a course and batch");
      return;
    }

    setSubmitting(true);
    try {
      const hasContact =
        Boolean(contact.name.trim()) && Boolean(contact.phone.trim());

      let student = await registerStudent({
        ...form,
        photoUrl: null,
        emergencyContacts: [],
        documents: [],
      });

      if (photoFile) {
        student = await updateStudentPhotoFile(student.id, photoFile);
      }

      if (hasContact) {
        student = await addEmergencyContact(student.id, {
          name: contact.name.trim(),
          relationship: contact.relationship,
          phone: contact.phone.trim(),
          email: contact.email.trim() || undefined,
          isPrimary: contact.isPrimary,
        });
      }

      for (const doc of documents) {
        student = await addDocumentFile(student.id, {
          name: doc.name,
          type: doc.type,
          file: doc.file,
        });
      }

      useStudentsStore.setState((state) => ({
        students: [
          student,
          ...state.students.filter((s) => s.id !== student.id),
        ],
      }));

      toast.success(`Registered ${student.firstName} ${student.lastName}`, {
        description: student.studentCode,
      });
      resetAll();
      onSuccess?.(student);
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, "Could not register student"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Profile" description="Personal details and enrollment.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name" error={errors.firstName}>
            <Input
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              placeholder="Nisha"
            />
          </Field>
          <Field label="Last name" error={errors.lastName}>
            <Input
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              placeholder="Thapa"
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="student@email.com"
            />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+977 98XXXXXXXX"
            />
          </Field>
          <Field label="Date of birth" error={errors.dateOfBirth}>
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
                v && update("gender", v as StudentRegistrationInput["gender"])
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
              placeholder="Street, area"
              rows={compact ? 2 : 2}
            />
          </Field>
          <Field label="City" error={errors.city}>
            <Input
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Kathmandu"
            />
          </Field>
          <Field label="Nationality">
            <Input
              value={form.nationality}
              onChange={(e) => update("nationality", e.target.value)}
            />
          </Field>
          <Field label="Blood group">
            <Select
              value={form.bloodGroup}
              onValueChange={(v) => v && update("bloodGroup", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
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
                    No courses yet — create one first
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
          <Field label="Batch">
            <Select
              value={form.batch || undefined}
              onValueChange={(v) => v && update("batch", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batchOptions.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No batches yet — create one first
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
        </div>
      </Section>

      <Section title="Photo" description="Portrait for profile and ID card.">
        <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
          <div className="flex flex-col items-center gap-3">
            <StudentAvatar
              student={previewStudent}
              className="size-28 rounded-2xl text-xl"
            />
            <p className="text-center text-xs text-muted-foreground">
              {photoPreview ? "Photo ready" : "Optional"}
            </p>
            {photoPreview ? (
              <Button type="button" variant="outline" size="sm" onClick={clearPhoto}>
                <Trash2 />
                Remove
              </Button>
            ) : null}
          </div>
          <FileDropzone
            onFiles={handlePhoto}
            accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
            label="Drop a portrait photo here"
            hint="PNG or JPG up to 5MB · square crop recommended"
          />
        </div>
      </Section>

      <Section
        title="Emergency contact"
        description="Primary contact for emergencies (optional)."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name">
            <Input
              value={contact.name}
              onChange={(e) =>
                setContact((c) => ({ ...c, name: e.target.value }))
              }
              placeholder="Parent / guardian"
            />
          </Field>
          <Field label="Relationship">
            <Select
              value={contact.relationship}
              onValueChange={(v) =>
                v && setContact((c) => ({ ...c, relationship: v }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Phone">
            <Input
              value={contact.phone}
              onChange={(e) =>
                setContact((c) => ({ ...c, phone: e.target.value }))
              }
              placeholder="+977 98XXXXXXXX"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={contact.email}
              onChange={(e) =>
                setContact((c) => ({ ...c, email: e.target.value }))
              }
              placeholder="optional"
            />
          </Field>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <Checkbox
            checked={contact.isPrimary}
            onCheckedChange={(v) =>
              setContact((c) => ({ ...c, isPrimary: Boolean(v) }))
            }
          />
          Mark as primary contact
        </label>
        {contactError ? (
          <p className="mt-2 text-xs text-destructive">{contactError}</p>
        ) : null}
      </Section>

      <Section title="Documents" description="ID proof or application files.">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Document type</Label>
            <Select
              value={docType}
              onValueChange={(v) =>
                v && setDocType(v as StudentDocument["type"])
              }
            >
              <SelectTrigger className="w-full sm:max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FileDropzone
            onFiles={handleDocuments}
            maxFiles={5}
            accept={{
              "application/pdf": [".pdf"],
              "image/*": [".png", ".jpg", ".jpeg"],
            }}
            label="Drop PDF or image files"
            hint="Up to 5 files · 5MB each · optional"
          />
          {documents.length ? (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {DOCUMENT_TYPES.find((t) => t.value === doc.type)?.label} ·{" "}
                      {doc.sizeLabel}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => removeDocument(doc.id)}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Section>

      <div className="flex justify-end gap-2 border-t pt-4">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={resetAll}>
            Reset
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" />
              Registering…
            </>
          ) : (
            "Register student"
          )}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
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
