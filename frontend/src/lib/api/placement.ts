import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type { EmployerRecord, PlacementRecord } from "@/types/ops";

export type EmployerCreateInput = {
  name: string;
  contact?: string;
  email?: string;
  city?: string;
};

export type PlacementCreateInput = {
  student: string;
  studentId?: string | null;
  employer: string;
  employerId?: string | null;
  role: string;
  interviewDate?: string | null;
  status: PlacementRecord["status"];
  cvName?: string | null;
};

export async function fetchEmployers(): Promise<EmployerRecord[]> {
  const res = await api.get("/placement/employers");
  return unwrapList<EmployerRecord>(res.data);
}

export async function createEmployer(
  input: EmployerCreateInput
): Promise<EmployerRecord> {
  const res = await api.post("/placement/employers", input);
  return unwrapItem<EmployerRecord>(res.data);
}

export async function updateEmployer(
  id: string,
  patch: Partial<EmployerCreateInput>
): Promise<EmployerRecord> {
  const res = await api.patch(`/placement/employers/${id}`, patch);
  return unwrapItem<EmployerRecord>(res.data);
}

export async function deleteEmployer(id: string): Promise<void> {
  await api.delete(`/placement/employers/${id}`);
}

export async function fetchPlacements(): Promise<PlacementRecord[]> {
  const res = await api.get("/placement/placements");
  return unwrapList<PlacementRecord>(res.data);
}

export async function createPlacement(
  input: PlacementCreateInput
): Promise<PlacementRecord> {
  const res = await api.post("/placement/placements", input);
  return unwrapItem<PlacementRecord>(res.data);
}

export async function updatePlacement(
  id: string,
  patch: Partial<PlacementCreateInput>
): Promise<PlacementRecord> {
  const res = await api.patch(`/placement/placements/${id}`, patch);
  return unwrapItem<PlacementRecord>(res.data);
}

export async function deletePlacement(id: string): Promise<void> {
  await api.delete(`/placement/placements/${id}`);
}
