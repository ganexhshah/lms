import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type {
  RatingEvent,
  SalaryEntry,
  TrainerRecord,
  TrainerScheduleSlot,
} from "@/types/ops";

export type TrainerListParams = {
  status?: string;
  search?: string;
};

export type TrainerCreateInput = {
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  status: TrainerRecord["status"];
  salary?: number;
  rating?: number;
  schedule?: string;
};

export async function fetchTrainers(
  params?: TrainerListParams
): Promise<TrainerRecord[]> {
  const res = await api.get("/trainers", { params });
  return unwrapList<TrainerRecord>(res.data);
}

export async function fetchTrainer(id: string): Promise<TrainerRecord> {
  const res = await api.get(`/trainers/${id}`);
  return unwrapItem<TrainerRecord>(res.data);
}

export async function createTrainer(
  input: TrainerCreateInput
): Promise<TrainerRecord> {
  const res = await api.post("/trainers", input);
  return unwrapItem<TrainerRecord>(res.data);
}

export async function updateTrainer(
  id: string,
  patch: Partial<TrainerCreateInput>
): Promise<TrainerRecord> {
  const res = await api.patch(`/trainers/${id}`, patch);
  return unwrapItem<TrainerRecord>(res.data);
}

export async function deleteTrainer(id: string): Promise<void> {
  await api.delete(`/trainers/${id}`);
}

export async function addTrainerScheduleSlot(
  trainerId: string,
  slot: Omit<TrainerScheduleSlot, "id">
): Promise<TrainerScheduleSlot> {
  const res = await api.post(`/trainers/${trainerId}/schedule`, slot);
  return unwrapItem<TrainerScheduleSlot>(res.data);
}

export async function removeTrainerScheduleSlot(
  trainerId: string,
  slotId: string
): Promise<void> {
  await api.delete(`/trainers/${trainerId}/schedule/${slotId}`);
}

export async function addTrainerSalary(
  trainerId: string,
  entry: Omit<SalaryEntry, "id">
): Promise<SalaryEntry> {
  const res = await api.post(`/trainers/${trainerId}/salary`, entry);
  return unwrapItem<SalaryEntry>(res.data);
}

export async function addTrainerRating(
  trainerId: string,
  entry: Omit<RatingEvent, "id">
): Promise<RatingEvent> {
  const res = await api.post(`/trainers/${trainerId}/ratings`, entry);
  return unwrapItem<RatingEvent>(res.data);
}
