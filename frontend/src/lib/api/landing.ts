import { api } from "./client";
import { unwrapItem } from "./utils";
import type { LandingContent } from "@/types/landing";

export async function fetchLanding(): Promise<LandingContent> {
  const res = await api.get("/landing");
  return unwrapItem<LandingContent>(res.data);
}

export async function updateLanding(
  patch: Partial<LandingContent>
): Promise<LandingContent> {
  const res = await api.put("/landing", patch);
  return unwrapItem<LandingContent>(res.data);
}
