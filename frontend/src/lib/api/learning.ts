import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type { LearningItem } from "@/types/ops";

export type LearningCreateInput = {
  title: string;
  type: LearningItem["type"];
  course: string;
  progress?: number;
  status: LearningItem["status"];
  url?: string;
  description?: string;
};

export async function fetchLearningItems(): Promise<LearningItem[]> {
  const res = await api.get("/learning/items");
  return unwrapList<LearningItem>(res.data);
}

export async function fetchLearningItem(id: string): Promise<LearningItem> {
  const res = await api.get(`/learning/items/${id}`);
  return unwrapItem<LearningItem>(res.data);
}

export async function createLearningItem(
  input: LearningCreateInput
): Promise<LearningItem> {
  const res = await api.post("/learning/items", input);
  return unwrapItem<LearningItem>(res.data);
}

export async function updateLearningItem(
  id: string,
  patch: Partial<LearningCreateInput>
): Promise<LearningItem> {
  const res = await api.patch(`/learning/items/${id}`, patch);
  return unwrapItem<LearningItem>(res.data);
}

export async function deleteLearningItem(id: string): Promise<void> {
  await api.delete(`/learning/items/${id}`);
}
