import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type { ExamGrade, ExamRecord } from "@/types/ops";

export type ExamListParams = {
  status?: string;
  batch_id?: string;
};

export type ExamCreateInput = {
  title: string;
  course: string;
  batch: string;
  batchId?: string | null;
  type: ExamRecord["type"];
  date: string;
  passMark: number;
  status?: ExamRecord["status"];
};

export async function fetchExams(params?: ExamListParams): Promise<ExamRecord[]> {
  const res = await api.get("/exams", { params });
  return unwrapList<ExamRecord>(res.data);
}

export async function fetchExam(id: string): Promise<ExamRecord> {
  const res = await api.get(`/exams/${id}`);
  return unwrapItem<ExamRecord>(res.data);
}

export async function createExam(input: ExamCreateInput): Promise<ExamRecord> {
  const res = await api.post("/exams", {
    ...input,
    status: input.status ?? "scheduled",
  });
  return unwrapItem<ExamRecord>(res.data);
}

export async function updateExam(
  id: string,
  patch: Partial<ExamCreateInput>
): Promise<ExamRecord> {
  const res = await api.patch(`/exams/${id}`, patch);
  return unwrapItem<ExamRecord>(res.data);
}

export async function deleteExam(id: string): Promise<void> {
  await api.delete(`/exams/${id}`);
}

export async function updateExamGrades(
  id: string,
  grades: ExamGrade[]
): Promise<ExamRecord> {
  const res = await api.put(`/exams/${id}/grades`, { grades });
  return unwrapItem<ExamRecord>(res.data);
}
