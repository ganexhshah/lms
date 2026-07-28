"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

import { AdmissionStatusBadge } from "@/components/admissions/admission-status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdmissionsStore } from "@/store/admissions-store";
import type { AdmissionApplication } from "@/types/admission";

type ApprovalTabProps = {
  application: AdmissionApplication;
};

export function ApprovalTab({ application }: ApprovalTabProps) {
  const approve = useAdmissionsStore((s) => s.approve);
  const reject = useAdmissionsStore((s) => s.reject);
  const [reason, setReason] = useState(application.rejectionReason ?? "");

  function handleApprove() {
    approve(application.id);
    toast.success("Admission approved");
  }

  function handleReject() {
    if (!reason.trim()) {
      toast.error("Add a rejection reason");
      return;
    }
    reject(application.id, reason.trim());
    toast.success("Application rejected");
  }

  const canDecide =
    application.status === "pending" ||
    application.status === "lead" ||
    application.status === "waiting";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Current status</span>
        <AdmissionStatusBadge status={application.status} />
      </div>

      {application.status === "approved" ? (
        <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          This application is approved
          {application.assignedBatch
            ? ` and assigned to ${application.assignedBatch}`
            : ". Assign a batch next."}
          .
        </p>
      ) : null}

      {application.status === "rejected" ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
          Rejected: {application.rejectionReason}
        </p>
      ) : null}

      {canDecide ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Rejection reason (if rejecting)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Missing documents, capacity, etc."
              rows={3}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleApprove}>
              <CheckCircle2 />
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={handleReject}>
              <XCircle />
              Reject
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
