export const STUDENT_TABS = [
  "profile",
  "photo",
  "emergency",
  "documents",
  "id-card",
  "history",
] as const;

export type StudentTab = (typeof STUDENT_TABS)[number];

export const STUDENT_TAB_LABELS: Record<StudentTab, string> = {
  profile: "Profile",
  photo: "Photo",
  emergency: "Emergency",
  documents: "Documents",
  "id-card": "ID card",
  history: "History",
};

export function parseStudentTab(value: string | null | undefined): StudentTab {
  if (value && (STUDENT_TABS as readonly string[]).includes(value)) {
    return value as StudentTab;
  }
  return "profile";
}

export function studentDetailHref(id: string, tab?: StudentTab) {
  const t = tab && tab !== "profile" ? `?tab=${tab}` : "";
  return `/dashboard/students/${id}${t}`;
}
