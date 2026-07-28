"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCoursesStore } from "@/store/courses-store";
import { useBatchesStore } from "@/store/domain/batches-store";
import { useTrainersStore } from "@/store/domain/trainers-store";
import { usePlacementStore } from "@/store/domain/placement-store";
import { cn } from "@/lib/utils";

type CommonProps = {
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
  className?: string;
};

export function BatchPicker({
  value,
  onChange,
  placeholder = "Select batch",
  className,
}: CommonProps) {
  const batches = useBatchesStore((s) => s.batches);
  return (
    <Select
      value={value ?? undefined}
      onValueChange={(next) => onChange(next ?? null)}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {batches.map((b) => (
          <SelectItem key={b.id} value={b.id}>
            {b.name} · {b.shift} · {b.enrolled}/{b.capacity}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TrainerPicker({
  value,
  onChange,
  placeholder = "Select trainer",
  className,
}: CommonProps) {
  const trainers = useTrainersStore((s) => s.trainers);
  return (
    <Select
      value={value ?? undefined}
      onValueChange={(next) => onChange(next ?? null)}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {trainers.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            {t.name} · {t.specialty}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CoursePicker({
  value,
  onChange,
  placeholder = "Select course",
  className,
}: CommonProps) {
  const courses = useCoursesStore((s) => s.courses);
  return (
    <Select
      value={value ?? undefined}
      onValueChange={(next) => onChange(next ?? null)}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {courses.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function EmployerPicker({
  value,
  onChange,
  placeholder = "Select employer",
  className,
}: CommonProps) {
  const employers = usePlacementStore((s) => s.employers);
  return (
    <Select
      value={value ?? undefined}
      onValueChange={(next) => onChange(next ?? null)}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {employers.map((e) => (
          <SelectItem key={e.id} value={e.id}>
            {e.name} · {e.city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
