"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudentsStore } from "@/store/students-store";
import { studentFullName, type Student } from "@/types/student";
import { cn } from "@/lib/utils";

type StudentPickerProps = {
  value: string | null;
  onChange: (studentId: string | null) => void;
  placeholder?: string;
  className?: string;
  filter?: (student: Student) => boolean;
};

export function StudentPicker({
  value,
  onChange,
  placeholder = "Select student",
  className,
  filter,
}: StudentPickerProps) {
  const students = useStudentsStore((s) => s.students);
  const list = filter ? students.filter(filter) : students;

  return (
    <Select
      // Keep `Select` controlled for the whole component lifetime.
      // Base UI warns when switching between controlled/uncontrolled via `undefined`.
      value={value ?? ""}
      onValueChange={(next) => onChange(next ? next : null)}
    >
      <SelectTrigger className={cn("w-full min-w-[220px]", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {list.map((student) => (
          <SelectItem key={student.id} value={student.id}>
            {studentFullName(student)} · {student.studentCode}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
