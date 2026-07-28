"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  onFiles: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  label?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
};

export function FileDropzone({
  onFiles,
  accept,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024,
  label = "Drop files here or click to browse",
  hint,
  className,
  disabled,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length) onFiles(accepted);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition-colors",
        isDragActive
          ? "border-foreground bg-muted/60"
          : "border-border hover:bg-muted/40",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted">
        <Upload className="size-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{label}</p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
