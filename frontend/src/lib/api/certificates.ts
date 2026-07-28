import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type { CertificateRecord } from "@/types/ops";

export type CertificateListParams = {
  status?: string;
  student_id?: string;
};

export type CertificateCreateInput = {
  number?: string;
  student: string;
  studentId?: string | null;
  course: string;
  issuedAt?: string | null;
  status: CertificateRecord["status"];
};

export async function fetchCertificates(
  params?: CertificateListParams
): Promise<CertificateRecord[]> {
  const res = await api.get("/certificates", { params });
  return unwrapList<CertificateRecord>(res.data);
}

export async function fetchCertificate(id: string): Promise<CertificateRecord> {
  const res = await api.get(`/certificates/${id}`);
  return unwrapItem<CertificateRecord>(res.data);
}

export async function createCertificate(
  input: CertificateCreateInput
): Promise<CertificateRecord> {
  const res = await api.post("/certificates", input);
  return unwrapItem<CertificateRecord>(res.data);
}

export async function updateCertificate(
  id: string,
  patch: Partial<CertificateCreateInput>
): Promise<CertificateRecord> {
  const res = await api.patch(`/certificates/${id}`, patch);
  return unwrapItem<CertificateRecord>(res.data);
}
