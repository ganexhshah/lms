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
import { useCoursesStore } from "@/store/courses-store";
import type { Course, CourseMaterial } from "@/types/course";

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

type MaterialsTabProps = {
  course: Course;
};

export function MaterialsTab({ course }: MaterialsTabProps) {
  const addMaterial = useCoursesStore((s) => s.addMaterial);
  const removeMaterial = useCoursesStore((s) => s.removeMaterial);
  const [type, setType] = useState<CourseMaterial["type"]>("pdf");

  async function handleFiles(files: File[]) {
    try {
      for (const file of files) {
        await addMaterial(course.id, {
          name: file.name,
          type,
          sizeLabel: formatBytes(file.size),
        });
      }
      toast.success(
        files.length === 1 ? "Material added" : `${files.length} materials added`
      );
    } catch {
      toast.error("Could not add material");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Material type</Label>
          <Select
            value={type}
            onValueChange={(v) => v && setType(v as CourseMaterial["type"])}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="link">Link</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <FileDropzone
          onFiles={handleFiles}
          maxFiles={5}
          accept={{
            "application/pdf": [".pdf"],
            "image/*": [".png", ".jpg", ".jpeg"],
            "video/*": [".mp4"],
          }}
          label="Drop course materials"
          hint="PDFs, images, or videos · up to 5 files"
        />
      </div>

      <div>
        {course.materials.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No materials yet"
            description="Upload handbooks, recipes, or class videos."
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
              {course.materials.map((mat) => (
                <TableRow key={mat.id}>
                  <TableCell className="font-medium">{mat.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {mat.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {mat.sizeLabel}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Delete ${mat.name}`}
                      onClick={() => {
                        removeMaterial(course.id, mat.id);
                        toast.success("Material removed");
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
