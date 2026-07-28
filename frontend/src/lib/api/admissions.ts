import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type {
  AdmissionApplication,
  AdmissionApplicationInput,
} from "@/types/admission";
import type { Student } from "@/types/student";

export type AdmissionListParams = {
  status?: string;
  course?: string;
  search?: string;
};

export async function fetchAdmissions(
  params?: AdmissionListParams
): Promise<AdmissionApplication[]> {
  const res = await api.get("/admissions", { params });
  return unwrapList<AdmissionApplication>(res.data);
}

export async function fetchAdmission(id: string): Promise<AdmissionApplication> {
  const res = await api.get(`/admissions/${id}`);
  return unwrapItem<AdmissionApplication>(res.data);
}

export async function createAdmission(
  input: AdmissionApplicationInput
): Promise<AdmissionApplication> {
  const res = await api.post("/admissions", input);
  return unwrapItem<AdmissionApplication>(res.data);
}

export async function updateAdmission(
  id: string,
  patch: Partial<AdmissionApplication>
): Promise<AdmissionApplication> {
  const res = await api.patch(`/admissions/${id}`, patch);
  return unwrapItem<AdmissionApplication>(res.data);
}

export async function approveAdmission(id: string): Promise<AdmissionApplication> {
  const res = await api.post(`/admissions/${id}/approve`);
  return unwrapItem<AdmissionApplication>(res.data);
}

export async function rejectAdmission(
  id: string,
  rejectionReason: string
): Promise<AdmissionApplication> {
  const res = await api.post(`/admissions/${id}/reject`, { rejectionReason });
  return unwrapItem<AdmissionApplication>(res.data);
}

export async function assignAdmissionBatch(
  id: string,
  batchId: string
): Promise<AdmissionApplication> {
  const res = await api.post(`/admissions/${id}/assign-batch`, { batchId });
  return unwrapItem<AdmissionApplication>(res.data);
}

export async function addAdmissionToWaitingList(
  id: string,
  waitingPosition?: number
): Promise<AdmissionApplication> {
  const res = await api.post(
    `/admissions/${id}/waiting-list`,
    typeof waitingPosition === "number" ? { waitingPosition } : {}
  );
  return unwrapItem<AdmissionApplication>(res.data);
}

export async function enrollAdmission(id: string): Promise<Student> {
  const res = await api.post(`/admissions/${id}/enroll`);
  return unwrapItem<Student>(res.data);
}
