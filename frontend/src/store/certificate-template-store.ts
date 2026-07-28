"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  defaultCertificateDesign,
  toFinalTemplate,
  type CertificateDesign,
} from "@/components/certificates/certificate-design";

type CertificateTemplateState = {
  finalTemplate: CertificateDesign | null;
  savedAt: string | null;
  saveFinalTemplate: (design: CertificateDesign) => void;
  clearFinalTemplate: () => void;
  getFinalTemplate: () => CertificateDesign;
};

export const useCertificateTemplateStore = create<CertificateTemplateState>()(
  persist(
    (set, get) => ({
      finalTemplate: null,
      savedAt: null,
      saveFinalTemplate: (design) =>
        set({
          finalTemplate: toFinalTemplate(design),
          savedAt: new Date().toISOString(),
        }),
      clearFinalTemplate: () => set({ finalTemplate: null, savedAt: null }),
      getFinalTemplate: () =>
        get().finalTemplate
          ? defaultCertificateDesign(get().finalTemplate!)
          : defaultCertificateDesign(),
    }),
    {
      name: "vellum-certificate-final-template",
      partialize: (s) => ({
        finalTemplate: s.finalTemplate,
        savedAt: s.savedAt,
      }),
    }
  )
);
