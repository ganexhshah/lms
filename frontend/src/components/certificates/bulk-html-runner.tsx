"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { CertificatePreview } from "@/components/certificates/certificate-preview";
import {
  applyTemplateToStudent,
  loadGoogleFont,
  type CertificateDesign,
} from "@/components/certificates/certificate-design";
import { renderDesignToPdf } from "@/components/certificates/render-certificate-pdf";

export type BulkStudentItem = {
  studentId: string;
  studentName: string;
  course: string;
  batch?: string;
  issuedAt?: string;
};

export type BulkHtmlResult = {
  studentId: string;
  studentName: string;
  course: string;
  number: string;
  issuedAt: string;
  pdfUrl: string;
};

type Props = {
  template: CertificateDesign;
  items: BulkStudentItem[];
  onProgress?: (done: number, total: number) => void;
  onComplete: (results: BulkHtmlResult[]) => void;
  onError?: (message: string) => void;
};

export function BulkHtmlCertificateRunner({
  template,
  items,
  onProgress,
  onComplete,
  onError,
}: Props) {
  const [job, setJob] = useState<{
    index: number;
    design: CertificateDesign;
  } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<BulkHtmlResult[]>([]);
  const startedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onProgressRef = useRef(onProgress);
  const onErrorRef = useRef(onError);
  onCompleteRef.current = onComplete;
  onProgressRef.current = onProgress;
  onErrorRef.current = onError;

  useEffect(() => {
    Object.values(template.fonts).forEach((f) => loadGoogleFont(f));
  }, [template]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    resultsRef.current = [];

    if (!items.length) {
      onCompleteRef.current([]);
      return;
    }

    const first = items[0]!;
    setJob({
      index: 0,
      design: applyTemplateToStudent(template, {
        studentId: first.studentId,
        studentName: first.studentName,
        course: first.course,
        batch: first.batch,
        issuedAt: first.issuedAt,
      }),
    });
  }, [items, template]);

  useEffect(() => {
    if (!job) return;
    let cancelled = false;

    (async () => {
      try {
        await new Promise((r) => setTimeout(r, 250));
        if (cancelled || !previewRef.current) return;

        const number = job.design.certificateNumber;
        const pdfUrl = await renderDesignToPdf(
          previewRef.current,
          job.design,
          `${number}.pdf`,
          true
        );

        resultsRef.current.push({
          studentId: job.design.studentId || items[job.index]!.studentId,
          studentName: job.design.studentName,
          course: job.design.course,
          number,
          issuedAt: job.design.issuedAt,
          pdfUrl,
        });

        onProgressRef.current?.(job.index + 1, items.length);

        const next = job.index + 1;
        if (next >= items.length) {
          onCompleteRef.current(resultsRef.current);
          return;
        }

        const item = items[next]!;
        setJob({
          index: next,
          design: applyTemplateToStudent(template, {
            studentId: item.studentId,
            studentName: item.studentName,
            course: item.course,
            batch: item.batch,
            issuedAt: item.issuedAt,
          }),
        });
      } catch (e) {
        console.error(e);
        onErrorRef.current?.("Bulk HTML certificate generation failed");
        onCompleteRef.current(resultsRef.current);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [job, items, template]);

  if (!job || typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: -9999,
        top: 0,
        width: 1100,
        zIndex: -1,
        pointerEvents: "none",
      }}
    >
      <CertificatePreview design={job.design} previewRef={previewRef} />
    </div>,
    document.body
  );
}
