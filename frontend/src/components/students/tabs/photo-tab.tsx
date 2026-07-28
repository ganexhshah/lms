"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { FileDropzone } from "@/components/shared/file-dropzone";
import { StudentAvatar } from "@/components/students/student-avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStudentsStore } from "@/store/students-store";
import { studentFullName, type Student } from "@/types/student";

type PhotoTabProps = {
  student: Student;
};

export function PhotoTab({ student }: PhotoTabProps) {
  const setStudentPhoto = useStudentsStore((s) => s.setStudentPhoto);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    setProgress(0);
    for (let i = 1; i <= 5; i++) {
      await new Promise((r) => setTimeout(r, 100));
      setProgress(i * 20);
    }

    const url = URL.createObjectURL(file);
    if (student.photoUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(student.photoUrl);
    }
    setStudentPhoto(student.id, url);
    setUploading(false);
    setProgress(0);
    toast.success("Photo uploaded", {
      description: studentFullName(student),
    });
  }

  function removePhoto() {
    if (!student.photoUrl) return;
    if (student.photoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(student.photoUrl);
    }
    setStudentPhoto(student.id, null);
    toast.success("Photo removed");
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
      <div className="flex flex-col items-center gap-3">
        <StudentAvatar student={student} className="size-36 rounded-2xl text-2xl" />
        <p className="text-center text-xs text-muted-foreground">
          {student.photoUrl ? "Photo on file" : "No photo yet"}
        </p>
        {student.photoUrl ? (
          <Button variant="outline" size="sm" onClick={removePhoto}>
            <Trash2 />
            Remove
          </Button>
        ) : null}
      </div>
      <div className="space-y-3">
        <FileDropzone
          onFiles={handleFiles}
          accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
          label="Drop a portrait photo here"
          hint="PNG or JPG up to 5MB · square crop recommended"
          disabled={uploading}
        />
        {uploading ? (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Uploading…</p>
            <Progress value={progress} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
