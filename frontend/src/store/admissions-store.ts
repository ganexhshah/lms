"use client";

import { create } from "zustand";

import * as admissionsApi from "@/lib/api/admissions";
import { getApiErrorMessage } from "@/lib/api/utils";
import type {
  AdmissionApplication,
  AdmissionApplicationInput,
  AdmissionStatus,
} from "@/types/admission";
import type { Student } from "@/types/student";

type AdmissionsState = {
  applications: AdmissionApplication[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  load: () => Promise<void>;
  createApplication: (
    input: AdmissionApplicationInput
  ) => Promise<AdmissionApplication>;
  updateApplication: (
    id: string,
    patch: Partial<AdmissionApplication>
  ) => Promise<AdmissionApplication>;
  setStatus: (
    id: string,
    status: AdmissionStatus,
    detail?: string
  ) => Promise<AdmissionApplication>;
  approve: (id: string) => Promise<AdmissionApplication>;
  reject: (id: string, reason: string) => Promise<AdmissionApplication>;
  assignBatch: (id: string, batchId: string) => Promise<AdmissionApplication>;
  addToWaitingList: (id: string) => Promise<AdmissionApplication>;
  enroll: (id: string) => Promise<Student>;
  updateLead: (
    id: string,
    data: {
      leadNotes?: string;
      nextFollowUp?: string | null;
      source?: AdmissionApplication["source"];
    }
  ) => Promise<AdmissionApplication>;
  getApplication: (id: string) => AdmissionApplication | undefined;
};

function replaceApp(
  apps: AdmissionApplication[],
  app: AdmissionApplication
) {
  const idx = apps.findIndex((a) => a.id === app.id);
  if (idx === -1) return [app, ...apps];
  const next = apps.slice();
  next[idx] = app;
  return next;
}

export const useAdmissionsStore = create<AdmissionsState>((set, get) => ({
  applications: [],
  loading: false,
  loaded: false,
  error: null,

  getApplication: (id) => get().applications.find((a) => a.id === id),

  load: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const applications = await admissionsApi.fetchAdmissions();
      set({ applications, loading: false, loaded: true });
    } catch (e) {
      set({
        loading: false,
        loaded: true,
        error: getApiErrorMessage(e, "Failed to load admissions"),
      });
    }
  },

  createApplication: async (input) => {
    const app = await admissionsApi.createAdmission(input);
    set((s) => ({ applications: [app, ...s.applications] }));
    return app;
  },

  updateApplication: async (id, patch) => {
    const app = await admissionsApi.updateAdmission(id, patch);
    set((s) => ({ applications: replaceApp(s.applications, app) }));
    return app;
  },

  setStatus: async (id, status) => {
    const app = await admissionsApi.updateAdmission(id, { status });
    set((s) => ({ applications: replaceApp(s.applications, app) }));
    return app;
  },

  approve: async (id) => {
    const app = await admissionsApi.approveAdmission(id);
    set((s) => ({ applications: replaceApp(s.applications, app) }));
    return app;
  },

  reject: async (id, reason) => {
    const app = await admissionsApi.rejectAdmission(id, reason);
    set((s) => ({ applications: replaceApp(s.applications, app) }));
    return app;
  },

  assignBatch: async (id, batchId) => {
    const app = await admissionsApi.assignAdmissionBatch(id, batchId);
    set((s) => ({ applications: replaceApp(s.applications, app) }));
    return app;
  },

  addToWaitingList: async (id) => {
    const app = await admissionsApi.addAdmissionToWaitingList(id);
    set((s) => ({ applications: replaceApp(s.applications, app) }));
    return app;
  },

  enroll: async (id) => {
    const student = await admissionsApi.enrollAdmission(id);
    const app = await admissionsApi.fetchAdmission(id);
    set((s) => ({ applications: replaceApp(s.applications, app) }));
    return student;
  },

  updateLead: async (id, data) => {
    const app = await admissionsApi.updateAdmission(id, data);
    set((s) => ({ applications: replaceApp(s.applications, app) }));
    return app;
  },
}));
