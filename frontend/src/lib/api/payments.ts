import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type { PaymentInvoice } from "@/types/ops";

export type PaymentListParams = {
  status?: string;
  student_id?: string;
};

export type InvoiceCreateInput = {
  number?: string;
  student: string;
  studentId?: string | null;
  course: string;
  amount: number;
  paid?: number;
  dueDate: string;
  status: PaymentInvoice["status"];
  discount?: number;
};

export async function fetchInvoices(
  params?: PaymentListParams
): Promise<PaymentInvoice[]> {
  const res = await api.get("/payments/invoices", { params });
  return unwrapList<PaymentInvoice>(res.data);
}

export async function fetchInvoice(id: string): Promise<PaymentInvoice> {
  const res = await api.get(`/payments/invoices/${id}`);
  return unwrapItem<PaymentInvoice>(res.data);
}

export async function createInvoice(
  input: InvoiceCreateInput
): Promise<PaymentInvoice> {
  const res = await api.post("/payments/invoices", input);
  return unwrapItem<PaymentInvoice>(res.data);
}

export async function updateInvoice(
  id: string,
  patch: Partial<InvoiceCreateInput>
): Promise<PaymentInvoice> {
  const res = await api.patch(`/payments/invoices/${id}`, patch);
  return unwrapItem<PaymentInvoice>(res.data);
}

export async function deleteInvoice(id: string): Promise<void> {
  await api.delete(`/payments/invoices/${id}`);
}

export async function sendInvoiceReminder(
  id: string,
  channel: PaymentInvoice["reminders"][0]["channel"],
  note?: string
): Promise<PaymentInvoice> {
  const res = await api.post(`/payments/invoices/${id}/reminders`, {
    channel,
    note,
  });
  // Backend returns reminder resource; refetch invoice for full state
  void res;
  return fetchInvoice(id);
}

export async function logInvoiceReceipt(
  id: string,
  amount: number
): Promise<PaymentInvoice> {
  await api.post(`/payments/invoices/${id}/receipts`, { amount });
  return fetchInvoice(id);
}
