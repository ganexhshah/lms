"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DOCUMENT_TYPES } from "@/data/constants";
import { useStudentsStore } from "@/store/students-store";
import type { Student, StudentDocument } from "@/types/student";

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

type DocumentsTabProps = {
  student: Student;
};

export function DocumentsTab({ student }: DocumentsTabProps) {
  const addDocument = useStudentsStore((s) => s.addDocument);
  const removeDocument = useStudentsStore((s) => s.removeDocument);
  const [docType, setDocType] =
    useState<StudentDocument["type"]>("id_proof");

  function handleFiles(files: File[]) {
    files.forEach((file) => {
      addDocument(student.id, {
        name: file.name,
        type: docType,
        sizeLabel: formatBytes(file.size),
      });
    });
    toast.success(
      files.length === 1
        ? "Document uploaded"
        : `${files.length} documents uploaded`
    );
  }

  const typeLabel = (type: StudentDocument["type"]) =>
    DOCUMENT_TYPES.find((t) => t.value === type)?.label ?? type;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Document type</Label>
          <Select
            value={docType}
            onValueChange={(v) =>
              v && setDocType(v as StudentDocument["type"])
            }
          >
            <SelectTrigger className="w-full">
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
          onFiles={handleFiles}
          maxFiles={5}
          accept={{
            "application/pdf": [".pdf"],
            "image/*": [".png", ".jpg", ".jpeg"],
          }}
          label="Drop PDF or image files"
          hint="Up to 5 files · 5MB each"
        />
      </div>

      <div>
        {student.documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload ID proof, applications, or certificates."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {student.documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabel(doc.type)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {doc.sizeLabel}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Delete ${doc.name}`}
                      onClick={() => {
                        removeDocument(student.id, doc.id);
                        toast.success("Document removed");
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
