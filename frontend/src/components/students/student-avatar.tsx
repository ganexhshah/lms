"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { studentInitials, type Student } from "@/types/student";
import { cn } from "@/lib/utils";

type StudentAvatarProps = {
  student: Pick<Student, "firstName" | "lastName" | "photoUrl">;
  className?: string;
  size?: "default" | "sm" | "lg";
};

export function StudentAvatar({
  student,
  className,
  size = "default",
}: StudentAvatarProps) {
  return (
    <Avatar size={size} className={cn(className)}>
      {student.photoUrl ? (
        <AvatarImage src={student.photoUrl} alt={student.firstName} />
      ) : null}
      <AvatarFallback>{studentInitials(student)}</AvatarFallback>
    </Avatar>
  );
}
