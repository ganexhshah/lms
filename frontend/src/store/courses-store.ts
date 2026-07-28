"use client";

import { create } from "zustand";

import * as coursesApi from "@/lib/api/courses";
import { getApiErrorMessage } from "@/lib/api/utils";
import type {
  Course,
  CourseCreateInput,
  CourseMaterial,
  CourseStatus,
  CourseTrainerRef,
  SyllabusItem,
} from "@/types/course";

type CoursesState = {
  courses: Course[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  load: () => Promise<void>;
  createCourse: (input: CourseCreateInput) => Promise<Course>;
  updateCourse: (id: string, patch: Partial<Course>) => Promise<Course>;
  setStatus: (id: string, status: CourseStatus) => Promise<Course>;
  setFees: (
    id: string,
    data: { fee: number; installments: number; discountNotes: string }
  ) => Promise<Course>;
  setSyllabus: (id: string, syllabus: SyllabusItem[]) => Promise<Course>;
  addSyllabusItem: (
    id: string,
    item: Omit<SyllabusItem, "id">
  ) => Promise<Course>;
  removeSyllabusItem: (courseId: string, itemId: string) => Promise<Course>;
  setTrainers: (id: string, trainers: CourseTrainerRef[]) => Promise<Course>;
  addMaterial: (
    id: string,
    material: Omit<CourseMaterial, "id" | "uploadedAt">
  ) => Promise<Course>;
  removeMaterial: (courseId: string, materialId: string) => Promise<Course>;
  getCourse: (id: string) => Course | undefined;
};

function replaceCourse(courses: Course[], course: Course) {
  const idx = courses.findIndex((c) => c.id === course.id);
  if (idx === -1) return [course, ...courses];
  const next = courses.slice();
  next[idx] = course;
  return next;
}

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: [],
  loading: false,
  loaded: false,
  error: null,

  getCourse: (id) => get().courses.find((c) => c.id === id),

  load: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const courses = await coursesApi.fetchCourses();
      set({ courses, loading: false, loaded: true });
    } catch (e) {
      set({
        loading: false,
        loaded: true,
        error: getApiErrorMessage(e, "Failed to load courses"),
      });
    }
  },

  createCourse: async (input) => {
    const course = await coursesApi.createCourse(input);
    set((s) => ({ courses: [course, ...s.courses] }));
    return course;
  },

  updateCourse: async (id, patch) => {
    const course = await coursesApi.updateCourse(id, patch);
    set((s) => ({ courses: replaceCourse(s.courses, course) }));
    return course;
  },

  setStatus: async (id, status) => get().updateCourse(id, { status }),

  setFees: async (id, data) => {
    const course = await coursesApi.updateCourseFees(id, data);
    set((s) => ({ courses: replaceCourse(s.courses, course) }));
    return course;
  },

  setSyllabus: async (id, syllabus) => {
    const course = await coursesApi.updateCourseSyllabus(id, syllabus);
    set((s) => ({ courses: replaceCourse(s.courses, course) }));
    return course;
  },

  addSyllabusItem: async (id, item) => {
    const current = get().getCourse(id);
    if (!current) throw new Error("Course not found");
    const syllabus = [
      ...current.syllabus,
      { ...item, id: crypto.randomUUID() },
    ];
    return get().setSyllabus(id, syllabus);
  },

  removeSyllabusItem: async (courseId, itemId) => {
    const current = get().getCourse(courseId);
    if (!current) throw new Error("Course not found");
    return get().setSyllabus(
      courseId,
      current.syllabus.filter((s) => s.id !== itemId)
    );
  },

  setTrainers: async (id, trainers) => {
    const course = await coursesApi.updateCourseTrainers(id, trainers);
    set((s) => ({ courses: replaceCourse(s.courses, course) }));
    return course;
  },

  addMaterial: async (id, material) => {
    const current = get().getCourse(id);
    if (!current) throw new Error("Course not found");
    const materials: CourseMaterial[] = [
      {
        ...material,
        id: crypto.randomUUID(),
        uploadedAt: new Date().toISOString().slice(0, 10),
      },
      ...current.materials,
    ];
    const course = await coursesApi.updateCourseMaterials(id, materials);
    set((s) => ({ courses: replaceCourse(s.courses, course) }));
    return course;
  },

  removeMaterial: async (courseId, materialId) => {
    const current = get().getCourse(courseId);
    if (!current) throw new Error("Course not found");
    const materials = current.materials.filter((m) => m.id !== materialId);
    const course = await coursesApi.updateCourseMaterials(courseId, materials);
    set((s) => ({ courses: replaceCourse(s.courses, course) }));
    return course;
  },
}));
