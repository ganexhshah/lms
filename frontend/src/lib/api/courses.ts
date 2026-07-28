import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type {
  Course,
  CourseCreateInput,
  CourseMaterial,
  CourseTrainerRef,
  SyllabusItem,
} from "@/types/course";

export type CourseListParams = {
  search?: string;
  status?: string;
  level?: string;
};

export async function fetchCourses(params?: CourseListParams): Promise<Course[]> {
  const res = await api.get("/courses", { params });
  return unwrapList<Course>(res.data);
}

export async function fetchCourse(id: string): Promise<Course> {
  const res = await api.get(`/courses/${id}`);
  return unwrapItem<Course>(res.data);
}

export async function createCourse(input: CourseCreateInput): Promise<Course> {
  const res = await api.post("/courses", input);
  return unwrapItem<Course>(res.data);
}

export async function updateCourse(
  id: string,
  patch: Partial<Course>
): Promise<Course> {
  const res = await api.patch(`/courses/${id}`, patch);
  return unwrapItem<Course>(res.data);
}

export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/courses/${id}`);
}

export async function updateCourseFees(
  id: string,
  data: { fee: number; installments: number; discountNotes: string }
): Promise<Course> {
  const res = await api.patch(`/courses/${id}/fees`, data);
  return unwrapItem<Course>(res.data);
}

export async function updateCourseSyllabus(
  id: string,
  syllabus: SyllabusItem[]
): Promise<Course> {
  const res = await api.patch(`/courses/${id}/syllabus`, { syllabus });
  return unwrapItem<Course>(res.data);
}

export async function updateCourseTrainers(
  id: string,
  trainers: CourseTrainerRef[]
): Promise<Course> {
  const res = await api.patch(`/courses/${id}/trainers`, { trainers });
  return unwrapItem<Course>(res.data);
}

export async function updateCourseMaterials(
  id: string,
  materials: CourseMaterial[]
): Promise<Course> {
  const res = await api.patch(`/courses/${id}/materials`, { materials });
  return unwrapItem<Course>(res.data);
}
