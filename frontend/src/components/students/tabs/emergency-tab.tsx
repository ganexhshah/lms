"use client";

import { useState } from "react";
import { toast } from "sonner";
import { HeartPulse, Plus, Star, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { RELATIONSHIPS } from "@/data/constants";
import { useStudentsStore } from "@/store/students-store";
import { studentFullName, type Student } from "@/types/student";

type ContactForm = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimary: boolean;
};

const emptyContact: ContactForm = {
  name: "",
  relationship: "Parent",
  phone: "",
  email: "",
  isPrimary: false,
};

type EmergencyTabProps = {
  student: Student;
};

export function EmergencyTab({ student }: EmergencyTabProps) {
  const addEmergencyContact = useStudentsStore((s) => s.addEmergencyContact);
  const removeEmergencyContact = useStudentsStore(
    (s) => s.removeEmergencyContact
  );
  const setEmergencyContacts = useStudentsStore((s) => s.setEmergencyContacts);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ContactForm>(emptyContact);

  function openAdd(primary = false) {
    setForm({ ...emptyContact, isPrimary: primary });
    setOpen(true);
  }

  function handleAdd() {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    addEmergencyContact(student.id, {
      name: form.name.trim(),
      relationship: form.relationship,
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      isPrimary: form.isPrimary,
    });
    toast.success("Emergency contact added");
    setOpen(false);
    setForm(emptyContact);
  }

  function makePrimary(contactId: string) {
    setEmergencyContacts(
      student.id,
      student.emergencyContacts.map((c) => ({
        ...c,
        isPrimary: c.id === contactId,
      }))
    );
    toast.success("Primary contact updated");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Primary and secondary contacts for emergencies
        </p>
        <Button size="sm" onClick={() => openAdd()}>
          <Plus />
          Add contact
        </Button>
      </div>

      {student.emergencyContacts.length === 0 ? (
        <EmptyState
          icon={HeartPulse}
          title="No emergency contacts"
          description="Add at least one primary contact."
          action={
            <Button size="sm" onClick={() => openAdd(true)}>
              <Plus />
              Add primary contact
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {student.emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{contact.name}</p>
                  {contact.isPrimary ? (
                    <Badge>
                      <Star className="size-3" />
                      Primary
                    </Badge>
                  ) : null}
                  <Badge variant="secondary">{contact.relationship}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {contact.phone}
                  {contact.email ? ` · ${contact.email}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {!contact.isPrimary ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => makePrimary(contact.id)}
                  >
                    Make primary
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    removeEmergencyContact(student.id, contact.id);
                    toast.success("Contact removed");
                  }}
                >
                  <Trash2 />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add emergency contact</DialogTitle>
            <DialogDescription>
              For {studentFullName(student)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Relationship</Label>
              <Select
                value={form.relationship}
                onValueChange={(v) =>
                  v && setForm({ ...form, relationship: v })
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
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email (optional)</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.isPrimary}
                onCheckedChange={(checked) =>
                  setForm({ ...form, isPrimary: checked === true })
                }
              />
              Set as primary contact
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Save contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
