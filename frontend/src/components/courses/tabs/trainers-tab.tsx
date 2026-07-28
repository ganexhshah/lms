"use client";

import { toast } from "sonner";
import { UserCog } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCoursesStore } from "@/store/courses-store";
import { useTrainersStore } from "@/store/domain/trainers-store";
import type { Course } from "@/types/course";

type TrainersTabProps = {
  course: Course;
};

export function TrainersTab({ course }: TrainersTabProps) {
  const setTrainers = useCoursesStore((s) => s.setTrainers);
  const trainers = useTrainersStore((s) => s.trainers);
  const assignedIds = new Set(course.trainers.map((t) => t.id));

  async function toggle(trainerId: string) {
    const trainer = trainers.find((t) => t.id === trainerId);
    if (!trainer) return;
    try {
      if (assignedIds.has(trainerId)) {
        await setTrainers(
          course.id,
          course.trainers.filter((t) => t.id !== trainerId)
        );
        toast.success(`${trainer.name} removed`);
      } else {
        await setTrainers(course.id, [
          ...course.trainers,
          { id: trainer.id, name: trainer.name, role: trainer.specialty },
        ]);
        toast.success(`${trainer.name} assigned`);
      }
    } catch {
      toast.error("Could not update trainers");
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Assign trainers from Trainer Management to this course.
      </p>

      {trainers.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No trainers available"
          description="Add trainers in Trainer Management first."
        />
      ) : (
        <div className="grid gap-2">
          {trainers.map((trainer) => {
            const assigned = assignedIds.has(trainer.id);
            return (
              <div
                key={trainer.id}
                className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{trainer.name}</p>
                    {assigned ? <Badge>Assigned</Badge> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {trainer.specialty} · {trainer.email}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={assigned ? "outline" : "default"}
                  onClick={() => toggle(trainer.id)}
                >
                  {assigned ? "Remove" : "Assign"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
