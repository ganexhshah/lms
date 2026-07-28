export const COURSE_TABS = [
  "details",
  "fees",
  "syllabus",
  "trainers",
  "materials",
] as const;

export type CourseTab = (typeof COURSE_TABS)[number];

export const COURSE_TAB_LABELS: Record<CourseTab, string> = {
  details: "Details",
  fees: "Fees",
  syllabus: "Syllabus",
  trainers: "Trainers",
  materials: "Materials",
};

export function parseCourseTab(value: string | null | undefined): CourseTab {
  if (value && (COURSE_TABS as readonly string[]).includes(value)) {
    return value as CourseTab;
  }
  return "details";
}

export function courseDetailHref(id: string, tab?: CourseTab) {
  const t = tab && tab !== "details" ? `?tab=${tab}` : "";
  return `/dashboard/courses/${id}${t}`;
}
