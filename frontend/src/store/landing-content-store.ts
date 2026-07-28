"use client";

import { create } from "zustand";

import * as landingApi from "@/lib/api/landing";
import { fetchPublicLanding } from "@/lib/api/public";
import { getApiErrorMessage } from "@/lib/api/utils";
import {
  defaultLandingContent,
  formatNpr,
  type LandingContent,
  type LandingMiniCourse,
  type LandingTestimonial,
} from "@/types/landing";

export type { LandingContent, LandingMiniCourse, LandingTestimonial };
export { defaultLandingContent as defaultContent, formatNpr };

type LandingContentState = {
  content: LandingContent;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  load: () => Promise<void>;
  loadPublic: () => Promise<void>;
  updateContent: (patch: Partial<LandingContent>) => Promise<void>;
  setMiniCourses: (items: LandingMiniCourse[]) => Promise<void>;
  setTestimonials: (items: LandingTestimonial[]) => Promise<void>;
  setFeaturedCourseIds: (ids: string[]) => Promise<void>;
  setCourseMeta: (
    courseId: string,
    meta: LandingContent["courseMeta"][string]
  ) => Promise<void>;
  resetContent: () => Promise<void>;
};

function mergeContent(base: LandingContent, incoming: LandingContent): LandingContent {
  return {
    ...base,
    ...incoming,
    featuredCourseIds: incoming.featuredCourseIds ?? [],
    courseMeta: incoming.courseMeta ?? {},
    miniCourses: incoming.miniCourses ?? base.miniCourses,
    testimonials: incoming.testimonials ?? base.testimonials,
  };
}

export const useLandingContentStore = create<LandingContentState>((set, get) => ({
  content: {
    ...defaultLandingContent,
    featuredCourseIds: [],
    courseMeta: {},
  },
  loading: false,
  loaded: false,
  error: null,

  load: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const content = await landingApi.fetchLanding();
      set({
        content: mergeContent(defaultLandingContent, content),
        loading: false,
        loaded: true,
      });
    } catch (e) {
      set({
        loading: false,
        loaded: true,
        error: getApiErrorMessage(e, "Failed to load landing content"),
      });
    }
  },

  loadPublic: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const content = await fetchPublicLanding();
      set({
        content: mergeContent(defaultLandingContent, content),
        loading: false,
        loaded: true,
      });
    } catch (e) {
      set({
        content: {
          ...defaultLandingContent,
          featuredCourseIds: [],
          courseMeta: {},
        },
        loading: false,
        loaded: true,
        error: getApiErrorMessage(e, "Failed to load public landing"),
      });
    }
  },

  updateContent: async (patch) => {
    const content = await landingApi.updateLanding(patch);
    set({ content: mergeContent(get().content, content) });
  },

  setMiniCourses: async (items) => {
    await get().updateContent({ miniCourses: items });
  },

  setTestimonials: async (items) => {
    await get().updateContent({ testimonials: items });
  },

  setFeaturedCourseIds: async (ids) => {
    await get().updateContent({ featuredCourseIds: ids });
  },

  setCourseMeta: async (courseId, meta) => {
    const courseMeta = {
      ...get().content.courseMeta,
      [courseId]: { ...get().content.courseMeta[courseId], ...meta },
    };
    await get().updateContent({ courseMeta });
  },

  resetContent: async () => {
    const content = await landingApi.updateLanding({
      ...defaultLandingContent,
      featuredCourseIds: [],
      courseMeta: {},
    });
    set({ content: mergeContent(defaultLandingContent, content) });
  },
}));
