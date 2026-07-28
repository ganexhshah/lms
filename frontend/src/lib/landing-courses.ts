import type { Course } from "@/types/course";
import type { LandingContent } from "@/types/landing";
import { formatNpr } from "@/types/landing";

const FALLBACK_IMAGES = [
  "/landing/landing-course-barista.png",
  "/landing/landing-course-roast.png",
  "/landing/landing-course-latte.png",
];

export type PublicCourseCard = {
  id: string;
  title: string;
  description: string;
  tag: string;
  instructor: string;
  rating: number;
  price: string;
  fee: number;
  image: string;
  durationWeeks: number;
  durationHours: number;
  level: string;
  course: Course;
};

export function levelToTag(level: Course["level"]) {
  if (level === "beginner") return "Barista course";
  if (level === "intermediate") return "Roastery course";
  return "Hostess";
}

export function toPublicCourseCard(
  course: Course,
  content: LandingContent,
  index = 0
): PublicCourseCard {
  const meta = content.courseMeta[course.id];
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    tag: meta?.tag || levelToTag(course.level),
    instructor: course.trainers[0]?.name || "Vellum Trainer",
    rating: meta?.rating ?? 4.8,
    price: formatNpr(course.fee),
    fee: course.fee,
    image:
      meta?.coverImage ||
      FALLBACK_IMAGES[index % FALLBACK_IMAGES.length] ||
      FALLBACK_IMAGES[0]!,
    durationWeeks: course.durationWeeks,
    durationHours: course.durationHours,
    level: course.level,
    course,
  };
}

export function getLandingCourses(
  courses: Course[],
  content: LandingContent
): PublicCourseCard[] {
  const { featuredCourseIds, courseMeta } = content;
  const active = courses.filter((c) => c.status === "active");

  const ordered: Course[] = [];
  for (const id of featuredCourseIds) {
    const found = active.find((c) => c.id === id);
    if (!found) continue;
    if (courseMeta[id]?.showOnLanding === false) continue;
    ordered.push(found);
  }

  for (const c of active) {
    if (ordered.some((o) => o.id === c.id)) continue;
    if (courseMeta[c.id]?.showOnLanding) ordered.push(c);
  }

  const list = ordered.length > 0 ? ordered : active;
  return list.map((c, i) => toPublicCourseCard(c, content, i));
}

export function getAllPublicCourses(
  courses: Course[],
  content: LandingContent
): PublicCourseCard[] {
  return courses
    .filter((c) => c.status === "active")
    .map((c, i) => toPublicCourseCard(c, content, i));
}
