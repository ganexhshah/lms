import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type { InventoryItem } from "@/types/ops";

export type InventoryListParams = {
  category?: string;
};

export type InventoryCreateInput = {
  name: string;
  category: InventoryItem["category"];
  stock?: number;
  unit: string;
  minStock?: number;
  lastPurchase?: string | null;
};

export async function fetchInventoryItems(
  params?: InventoryListParams
): Promise<InventoryItem[]> {
  const res = await api.get("/inventory/items", { params });
  return unwrapList<InventoryItem>(res.data);
}

export async function fetchInventoryItem(id: string): Promise<InventoryItem> {
  const res = await api.get(`/inventory/items/${id}`);
  return unwrapItem<InventoryItem>(res.data);
}

export async function createInventoryItem(
  input: InventoryCreateInput
): Promise<InventoryItem> {
  const res = await api.post("/inventory/items", input);
  return unwrapItem<InventoryItem>(res.data);
}

export async function updateInventoryItem(
  id: string,
  patch: Partial<InventoryCreateInput>
): Promise<InventoryItem> {
  const res = await api.patch(`/inventory/items/${id}`, patch);
  return unwrapItem<InventoryItem>(res.data);
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await api.delete(`/inventory/items/${id}`);
}

export async function restockInventoryItem(
  id: string,
  input: { date: string; qty: number; unitCost: number; note?: string }
): Promise<InventoryItem> {
  await api.post(`/inventory/items/${id}/purchases`, input);
  return fetchInventoryItem(id);
}

export async function logInventoryUsage(
  id: string,
  input: { date: string; qty: number; batch?: string; note?: string }
): Promise<InventoryItem> {
  await api.post(`/inventory/items/${id}/usages`, input);
  return fetchInventoryItem(id);
}
