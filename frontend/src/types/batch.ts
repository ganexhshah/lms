export type BatchShift = "morning" | "evening";
export type BatchStatus = "upcoming" | "active" | "completed";

export type BatchTransfer = {
  id: string;
  studentId: string;
  studentName: string;
  fromBatchId: string;
  toBatchId: string;
  toBatchName: string | null;
  date: string;
  note: string;
};

export type Batch = {
  id: string;
  name: string;
  course: string;
  courseId: string | null;
  shift: BatchShift;
  capacity: number;
  enrolled: number;
  startDate: string;
  endDate: string;
  progress: number;
  trainer: string | null;
  trainerId: string | null;
  room: string | null;
  status: BatchStatus;
  studentIds: string[];
  transfers: BatchTransfer[];
};

export type BatchCreateInput = {
  name: string;
  course: string;
  courseId?: string | null;
  shift: BatchShift;
  capacity: number;
  startDate: string;
  endDate: string;
  progress?: number;
  trainer?: string | null;
  trainerId?: string | null;
  room?: string | null;
  status: BatchStatus;
};
