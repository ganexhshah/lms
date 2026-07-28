"use client";

import { useEffect, useRef } from "react";

import { useAuthStore } from "@/store/auth-store";
import { useAdmissionsStore } from "@/store/admissions-store";
import { useCoursesStore } from "@/store/courses-store";
import { useLandingContentStore } from "@/store/landing-content-store";
import { useOpsStore } from "@/store/ops-store";
import { useStudentsStore } from "@/store/students-store";

const LEGACY_STORAGE_KEYS = [
  "vellum-courses",
  "vellum-students",
  "vellum-admissions",
  "vellum-ops-v2",
  "vellum-landing-content",
];

function clearLegacyLocalStorage() {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

/**
 * After auth is ready, load domain data from the API once per session.
 * Mount inside the dashboard AuthGuard so token is present.
 */
export function DataBootstrap({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const started = useRef(false);

  useEffect(() => {
    clearLegacyLocalStorage();
  }, []);

  useEffect(() => {
    if (!hydrated || !token || started.current) return;
    started.current = true;
    void Promise.all([
      useCoursesStore.getState().load(),
      useStudentsStore.getState().load(),
      useAdmissionsStore.getState().load(),
      useOpsStore.getState().load(),
      useLandingContentStore.getState().load(),
    ]);
  }, [hydrated, token]);

  return <>{children}</>;
}
