import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type { Announcement } from "@/types/ops";

export type AnnouncementCreateInput = {
  channel: Announcement["channel"];
  title: string;
  body: string;
  sentAt?: string;
  audience: Announcement["audience"];
  audienceId?: string | null;
  audienceLabel?: string;
  deliveryLog?: Announcement["deliveryLog"];
};

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await api.get("/communication/announcements");
  return unwrapList<Announcement>(res.data);
}

export async function createAnnouncement(
  input: AnnouncementCreateInput
): Promise<Announcement> {
  const res = await api.post("/communication/announcements", input);
  return unwrapItem<Announcement>(res.data);
}

export async function updateAnnouncement(
  id: string,
  patch: Partial<AnnouncementCreateInput>
): Promise<Announcement> {
  const res = await api.patch(`/communication/announcements/${id}`, patch);
  return unwrapItem<Announcement>(res.data);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await api.delete(`/communication/announcements/${id}`);
}
