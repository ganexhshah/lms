import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type { BatchRecord } from "@/types/ops";

export type BatchListParams = {
  status?: string;
  course_id?: string;
};

export type BatchCreateInput = {
  name: string;
  course: string;
  courseId?: string | null;
  shift: BatchRecord["shift"];
  capacity: number;
  startDate: string;
  endDate: string;
  progress?: number;
  trainer?: string | null;
  trainerId?: string | null;
  room?: string | null;
  status: BatchRecord["status"];
};

export async function fetchBatches(params?: BatchListParams): Promise<BatchRecord[]> {
  const res = await api.get("/batches", { params });
  return unwrapList<BatchRecord>(res.data);
}

export async function fetchBatch(id: string): Promise<BatchRecord> {
  const res = await api.get(`/batches/${id}`);
  return unwrapItem<BatchRecord>(res.data);
}

export async function createBatch(input: BatchCreateInput): Promise<BatchRecord> {
  const res = await api.post("/batches", input);
  return unwrapItem<BatchRecord>(res.data);
}

export async function updateBatch(
  id: string,
  patch: Partial<BatchCreateInput>
): Promise<BatchRecord> {
  const res = await api.patch(`/batches/${id}`, patch);
  return unwrapItem<BatchRecord>(res.data);
}

export async function deleteBatch(id: string): Promise<void> {
  await api.delete(`/batches/${id}`);
}

export async function enrollStudentInBatch(
  batchId: string,
  studentId: string
): Promise<BatchRecord> {
  const res = await api.post(`/batches/${batchId}/enroll-student`, { studentId });
  return unwrapItem<BatchRecord>(res.data);
}

export async function removeStudentFromBatch(
  batchId: string,
  studentId: string
): Promise<BatchRecord> {
  const res = await api.post(`/batches/${batchId}/remove-student`, { studentId });
  return unwrapItem<BatchRecord>(res.data);
}

export async function transferStudent(
  fromBatchId: string,
  input: { studentId: string; toBatchId: string; note?: string }
): Promise<BatchRecord> {
  const res = await api.post(`/batches/${fromBatchId}/transfer-student`, input);
  return unwrapItem<BatchRecord>(res.data);
}
