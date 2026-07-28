"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { CertificateStudio } from "@/components/certificates/certificate-studio";
import {
  applyTemplateToStudent,
  defaultCertificateDesign,
} from "@/components/certificates/certificate-design";
import { useCertificateTemplateStore } from "@/store/certificate-template-store";
import { useOpsStore } from "@/store/ops-store";
import { useStudentsStore } from "@/store/students-store";
import { studentFullName } from "@/types/student";

function EditorInner() {
  const searchParams = useSearchParams();
  const certificates = useOpsStore((s) => s.certificates);
  const students = useStudentsStore((s) => s.students);
  const finalTemplate = useCertificateTemplateStore((s) => s.finalTemplate);

  const id = searchParams.get("id");
  const studentId = searchParams.get("studentId");
  const course = searchParams.get("course") || "";
  const studentName = searchParams.get("studentName") || "";

  const initial = useMemo(() => {
    const styleBase = finalTemplate
      ? defaultCertificateDesign(finalTemplate)
      : defaultCertificateDesign();

    if (id) {
      const cert = certificates.find((c) => c.id === id);
      if (cert) {
        return defaultCertificateDesign({
          ...styleBase,
          studentId: cert.studentId || null,
          studentName: cert.student,
          course: cert.course,
          certificateNumber: cert.number,
          issuedAt: cert.issuedAt || undefined,
        });
      }
    }

    if (studentId) {
      const student = students.find((s) => s.id === studentId);
      const name =
        studentName || (student ? studentFullName(student) : "");
      const courseName = course || student?.course || "";
      if (finalTemplate) {
        return applyTemplateToStudent(styleBase, {
          studentId,
          studentName: name,
          course: courseName,
          batch: student?.batch || "",
        });
      }
      return defaultCertificateDesign({
        studentId,
        studentName: name,
        course: courseName,
        batch: student?.batch || "",
      });
    }

    if (studentName || course) {
      return defaultCertificateDesign({
        ...styleBase,
        studentName,
        course,
      });
    }

    return styleBase;
  }, [id, studentId, course, studentName, certificates, students, finalTemplate]);

  return <CertificateStudio initial={initial} certificateId={id} />;
}

export default function CertificateEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground text-sm">Loading editor…</div>
      }
    >
      <EditorInner />
    </Suspense>
  );
}
