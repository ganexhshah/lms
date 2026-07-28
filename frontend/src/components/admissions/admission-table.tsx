"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import { AdmissionStatusBadge } from "@/components/admissions/admission-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { admissionFullName, type AdmissionApplication } from "@/types/admission";

type AdmissionTableProps = {
  applications: AdmissionApplication[];
  onSelect?: (app: AdmissionApplication) => void;
  actionHref?: (app: AdmissionApplication) => string;
  emptyMessage?: string;
};

export function AdmissionTable({
  applications,
  onSelect,
  actionHref,
  emptyMessage = "No applications found",
}: AdmissionTableProps) {
  if (!applications.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Applicant</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Course / Batch</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow
            key={app.id}
            className={onSelect ? "cursor-pointer" : undefined}
            onClick={() => onSelect?.(app)}
          >
            <TableCell>
              <p className="font-medium">{admissionFullName(app)}</p>
              <p className="text-xs text-muted-foreground">{app.email}</p>
            </TableCell>
            <TableCell className="font-mono text-xs">
              {app.applicationCode}
            </TableCell>
            <TableCell>
              <p className="text-sm">{app.course}</p>
              <p className="text-xs text-muted-foreground">
                {app.assignedBatch ?? app.preferredBatch}
              </p>
            </TableCell>
            <TableCell className="capitalize text-muted-foreground">
              {app.source.replace("-", " ")}
            </TableCell>
            <TableCell>
              <AdmissionStatusBadge status={app.status} />
            </TableCell>
            <TableCell className="text-right">
              {actionHref ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  nativeButton={false}
                  render={<Link href={actionHref(app)} />}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`View ${admissionFullName(app)}`}
                >
                  <Eye className="size-4" />
                </Button>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
