"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

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
import { useAdmissionsStore } from "@/store/admissions-store";
import type { AdmissionApplication, AdmissionSource } from "@/types/admission";

type LeadTabProps = {
  application: AdmissionApplication;
};

export function LeadTab({ application }: LeadTabProps) {
  const updateLead = useAdmissionsStore((s) => s.updateLead);
  const setStatus = useAdmissionsStore((s) => s.setStatus);
  const [notes, setNotes] = useState(application.leadNotes);
  const [followUp, setFollowUp] = useState(application.nextFollowUp ?? "");
  const [source, setSource] = useState(application.source);

  function save() {
    updateLead(application.id, {
      leadNotes: notes,
      nextFollowUp: followUp || null,
      source,
    });
    toast.success("Lead details saved");
  }

  function convertToPending() {
    setStatus(application.id, "pending", "Lead converted to pending application");
    toast.success("Moved to pending approval");
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Track lead source, notes, and follow-up dates.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Source</Label>
          <Select
            value={source}
            onValueChange={(v) => v && setSource(v as AdmissionSource)}
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
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Next follow-up</Label>
          <Input
            type="date"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Lead notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Conversation notes, interest level, objections…"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={save}>
          <Save />
          Save lead
        </Button>
        {application.status === "lead" ? (
          <Button size="sm" variant="outline" onClick={convertToPending}>
            Convert to pending
          </Button>
        ) : null}
      </div>
    </div>
  );
}
