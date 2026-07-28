import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type { TimetableSlot } from "@/types/ops";

export type TimetableSlotInput = {
  day: string;
  time: string;
  course: string;
  batch: string;
  batchId?: string | null;
  trainer: string;
  trainerId?: string | null;
  room?: string;
};

export async function fetchTimetableSlots(): Promise<TimetableSlot[]> {
  const res = await api.get("/timetable/slots");
  return unwrapList<TimetableSlot>(res.data);
}

export async function fetchTimetableSlot(id: string): Promise<TimetableSlot> {
  const res = await api.get(`/timetable/slots/${id}`);
  return unwrapItem<TimetableSlot>(res.data);
}

export async function createTimetableSlot(
  input: TimetableSlotInput
): Promise<TimetableSlot> {
  const res = await api.post("/timetable/slots", input);
  return unwrapItem<TimetableSlot>(res.data);
}

export async function updateTimetableSlot(
  id: string,
  patch: Partial<TimetableSlotInput>
): Promise<TimetableSlot> {
  const res = await api.patch(`/timetable/slots/${id}`, patch);
  return unwrapItem<TimetableSlot>(res.data);
}

export async function deleteTimetableSlot(id: string): Promise<void> {
  await api.delete(`/timetable/slots/${id}`);
}
