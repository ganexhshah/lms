"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ListOrdered, UserCheck, UserPlus } from "lucide-react";

import { BatchPicker } from "@/components/shared/entity-pickers";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/utils";
import { useAdmissionsStore } from "@/store/admissions-store";
import { useOpsStore } from "@/store/ops-store";
import { useStudentsStore } from "@/store/students-store";
import type { AdmissionApplication } from "@/types/admission";

type BatchTabProps = {
  application: AdmissionApplication;
};

export function BatchTab({ application }: BatchTabProps) {
  const router = useRouter();
  const assignBatch = useAdmissionsStore((s) => s.assignBatch);
  const addToWaitingList = useAdmissionsStore((s) => s.addToWaitingList);
  const enroll = useAdmissionsStore((s) => s.enroll);
  const batches = useOpsStore((s) => s.batches);

  const assigned = batches.find((b) => b.name === application.assignedBatch);
  const [batchId, setBatchId] = useState<string | null>(assigned?.id ?? null);
  const [busy, setBusy] = useState(false);

  async function handleAssign() {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) {
      toast.error("Select a batch");
      return;
    }
    setBusy(true);
    try {
      await assignBatch(application.id, batch.id);
      toast.success(`Assigned to ${batch.name}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not assign batch"));
    } finally {
      setBusy(false);
    }
  }

  async function handleWaiting() {
    setBusy(true);
    try {
      await addToWaitingList(application.id);
      toast.success("Added to waiting list");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not update waiting list"));
    } finally {
      setBusy(false);
    }
  }

  async function handleEnroll() {
    const batch =
      batches.find((b) => b.id === batchId) ??
      batches.find((b) => b.name === application.assignedBatch);
    if (!batch) {
      toast.error("Assign a batch before enrolling");
      return;
    }
    if (application.status !== "approved" && application.status !== "enrolled") {
      toast.error("Approve the application first");
      return;
    }

    setBusy(true);
    try {
      if (!application.assignedBatch || application.assignedBatch !== batch.name) {
        await assignBatch(application.id, batch.id);
      }
      const student = await enroll(application.id);
      await useStudentsStore.getState().load();
      toast.success(`Enrolled ${student.studentCode}`);
      router.push(`/dashboard/students/${student.id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not enroll student"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Assign a batch, place on the waiting list, or enroll as a student.
      </p>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Preferred batch</dt>
          <dd className="font-medium">{application.preferredBatch}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Assigned batch</dt>
          <dd className="font-medium">
            {application.assignedBatch ?? "Not assigned"}
          </dd>
        </div>
        {application.waitingPosition != null ? (
          <div>
            <dt className="text-xs text-muted-foreground">Waiting position</dt>
            <dd className="font-medium">#{application.waitingPosition}</dd>
          </div>
        ) : null}
      </dl>

      <div className="space-y-1.5 max-w-sm">
        <Label className="text-xs">Batch</Label>
        <BatchPicker value={batchId} onChange={setBatchId} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={handleAssign} disabled={busy}>
          <UserCheck />
          Assign batch
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleWaiting}
          disabled={busy || application.status === "waiting"}
        >
          <ListOrdered />
          Add to waiting list
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleEnroll}
          disabled={
            busy ||
            application.status === "enrolled" ||
            application.status === "rejected"
          }
        >
          <UserPlus />
          Enroll as student
        </Button>
      </div>
    </div>
  );
}
