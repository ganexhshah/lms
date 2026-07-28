export type CourseStatus = "draft" | "active" | "archived";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type SyllabusItem = {
  id: string;
  title: string;
  hours: number;
  description: string;
};

export type CourseMaterial = {
  id: string;
  name: string;
  type: "pdf" | "video" | "link" | "other";
  sizeLabel: string;
  uploadedAt: string;
};

export type CourseTrainerRef = {
  id: string;
  name: string;
  role: string;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  description: string;
  durationWeeks: number;
  durationHours: number;
  level: CourseLevel;
  status: CourseStatus;
  fee: number;
  installments: number;
  discountNotes: string;
  syllabus: SyllabusItem[];
  trainers: CourseTrainerRef[];
  materials: CourseMaterial[];
  updatedAt: string;
  createdAt: string;
};

export type CourseCreateInput = {
  title: string;
  description: string;
  durationWeeks: number;
  durationHours: number;
  level: CourseLevel;
  fee: number;
  installments: number;
  status: CourseStatus;
};
