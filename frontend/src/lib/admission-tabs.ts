export const ADMISSION_TABS = [
  "application",
  "lead",
  "approval",
  "batch",
  "history",
] as const;

export type AdmissionTab = (typeof ADMISSION_TABS)[number];

export const ADMISSION_TAB_LABELS: Record<AdmissionTab, string> = {
  application: "Application",
  lead: "Lead",
  approval: "Approval",
  batch: "Batch",
  history: "History",
};

export function parseAdmissionTab(
  value: string | null | undefined
): AdmissionTab {
  if (value && (ADMISSION_TABS as readonly string[]).includes(value)) {
    return value as AdmissionTab;
  }
  return "application";
}

export function admissionDetailHref(id: string, tab?: AdmissionTab) {
  const t = tab && tab !== "application" ? `?tab=${tab}` : "";
  return `/dashboard/admissions/${id}${t}`;
}
