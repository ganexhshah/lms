import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";

export type CanvaStatus = {
  configured: boolean;
  connected: boolean;
  idCardTemplate: boolean;
  certificateTemplate: boolean;
  schoolName: string;
};

export type CanvaDesign = {
  id: string;
  type: "id_card" | "certificate";
  studentId: string | null;
  subjectKey: string | null;
  canvaDesignId: string;
  editUrl: string | null;
  viewUrl: string | null;
  exportUrl: string | null;
  cdnUrl: string | null;
  status: string;
  meta: Record<string, unknown> | null;
  createdAt: string | null;
};

export type CanvaCertificateDraft = {
  studentId: string;
  course: string;
  certificateNumber?: string;
  issuedAt?: string;
  schoolName?: string;
  batch?: string;
  studentName?: string;
};

export type CanvaBulkCertificateResult = {
  studentId: string;
  success: boolean;
  design?: CanvaDesign;
  error?: string;
};

export async function fetchCanvaStatus(): Promise<CanvaStatus> {
  const res = await api.get("/canva/status");
  return unwrapItem<CanvaStatus>(res.data);
}

export async function startCanvaConnect(): Promise<string> {
  const res = await api.post("/canva/connect");
  return unwrapItem<{ authorizeUrl: string }>(res.data).authorizeUrl;
}

export async function disconnectCanva(): Promise<void> {
  await api.delete("/canva/connect");
}

export async function generateCanvaIdCard(studentId: string): Promise<CanvaDesign> {
  const res = await api.post(`/canva/id-cards/${studentId}`);
  return unwrapItem<CanvaDesign>(res.data);
}

export async function generateCanvaCertificate(input: {
  studentId: string;
  course: string;
  certificateNumber?: string;
  issuedAt?: string;
  schoolName?: string;
  batch?: string;
  studentName?: string;
}): Promise<CanvaDesign> {
  const res = await api.post("/canva/certificates", input);
  return unwrapItem<CanvaDesign>(res.data);
}

export async function generateCanvaCertificatesBulk(input: {
  items: CanvaCertificateDraft[];
}): Promise<CanvaBulkCertificateResult[]> {
  const res = await api.post("/canva/certificates/bulk", input);
  return unwrapList<CanvaBulkCertificateResult>(res.data);
}

export async function fetchCanvaDesigns(params?: {
  type?: "id_card" | "certificate";
  studentId?: string;
}): Promise<CanvaDesign[]> {
  const res = await api.get("/canva/designs", { params });
  return unwrapList<CanvaDesign>(res.data);
}
