import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type { AppNotification } from "@/types/ops";

export async function fetchNotifications(): Promise<AppNotification[]> {
  const res = await api.get("/notifications");
  return unwrapList<AppNotification>(res.data);
}

export async function createNotification(input: {
  title: string;
  body: string;
  href?: string | null;
  read?: boolean;
}): Promise<AppNotification> {
  const res = await api.post("/notifications", input);
  return unwrapItem<AppNotification>(res.data);
}

export async function markNotificationRead(
  id: string
): Promise<AppNotification> {
  const res = await api.post(`/notifications/${id}/read`);
  return unwrapItem<AppNotification>(res.data);
}

export async function markAllNotificationsRead(): Promise<AppNotification[]> {
  const res = await api.post("/notifications/read-all");
  return unwrapList<AppNotification>(res.data);
}
