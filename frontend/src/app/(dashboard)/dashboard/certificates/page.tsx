"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Award,
  BadgeCheck,
  CheckSquare,
  Loader2,
  Pencil,
  Plus,
  ScanLine,
  Sparkles,
} from "lucide-react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchField } from "@/components/shared/search-field";
import {
  BulkHtmlCertificateRunner,
  type BulkStudentItem,
} from "@/components/certificates/bulk-html-runner";
import { StudentPicker } from "@/components/students/student-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchCanvaStatus,
  generateCanvaCertificatesBulk,
  generateCanvaCertificate,
  startCanvaConnect,
  type CanvaBulkCertificateResult,
  type CanvaCertificateDraft,
  type CanvaStatus,
} from "@/lib/api/canva";
import { useOpsStore } from "@/store/ops-store";
import { useCertificateTemplateStore } from "@/store/certificate-template-store";
import { useStudentsStore } from "@/store/students-store";
import { studentFullName } from "@/types/student";
import type { CertificateRecord } from "@/types/ops";
import { Checkbox } from "@/components/ui/checkbox";
type EligibleRow = {
  studentId: string;
  student: string;
  course: string;
};

type DialogMode = "single" | "bulk";

type CertificateDraft = {
  studentId: string | null;
  course: string;
  certificateNumber: string;
  issuedAt: string;
  schoolName: string;
  batch: string;
  studentName: string;
};

const today = new Date().toISOString().slice(0, 10);

function emptyDraft(schoolName = "Vellum LMS"): CertificateDraft {
  return {
    studentId: null,
    course: "",
    certificateNumber: "",
    issuedAt: today,
    schoolName,
    batch: "",
    studentName: "",
  };
}

function CertificatesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const certificates = useOpsStore((s) => s.certificates);
  const exams = useOpsStore((s) => s.exams);
  const issueCertificate = useOpsStore((s) => s.issueCertificate);
  const createCertificate = useOpsStore((s) => s.createCertificate);
  const verifyCertificate = useOpsStore((s) => s.verifyCertificate);
  const students = useStudentsStore((s) => s.students);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [verify, setVerify] = useState("");
  const [verifyResult, setVerifyResult] = useState<
    CertificateRecord | null | undefined
  >(undefined);
  const [canva, setCanva] = useState<CanvaStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [useCanva, setUseCanva] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("single");
  const [draft, setDraft] = useState<CertificateDraft>(emptyDraft());
  const [selectedEligible, setSelectedEligible] = useState<string[]>([]);
  const [bulkHtmlItems, setBulkHtmlItems] = useState<BulkStudentItem[] | null>(
    null
  );
  const [bulkProgress, setBulkProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  const finalTemplate = useCertificateTemplateStore((s) => s.finalTemplate);
  const getFinalTemplate = useCertificateTemplateStore(
    (s) => s.getFinalTemplate
  );

  useEffect(() => {
    fetchCanvaStatus()
      .then((status) => {
        setCanva(status);
        setDraft((prev) =>
          prev.schoolName
            ? prev
            : {
                ...prev,
                schoolName: status.schoolName || "Vellum LMS",
              }
        );
      })
      .catch(() => setCanva(null));
  }, []);

  useEffect(() => {
    const status = searchParams.get("canva");
    if (status === "connected") {
      toast.success("Canva connected");
      fetchCanvaStatus().then(setCanva).catch(() => null);
    } else if (status === "error") {
      toast.error(searchParams.get("message") || "Canva connect failed");
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return certificates;
    return certificates.filter((c) =>
      `${c.number} ${c.student} ${c.course}`.toLowerCase().includes(q)
    );
  }, [certificates, query]);

  const eligible = useMemo(() => {
    const seen = new Set<string>();
    const rows: EligibleRow[] = [];
    for (const exam of exams) {
      for (const grade of exam.grades) {
        if (!grade.passed) continue;
        const key = `${grade.studentId}::${exam.course}`;
        if (seen.has(key)) continue;
        const alreadyIssued = certificates.some(
          (c) =>
            c.studentId === grade.studentId &&
            c.course === exam.course &&
            c.status === "issued"
        );
        if (alreadyIssued) continue;
        seen.add(key);
        rows.push({
          studentId: grade.studentId,
          student: grade.studentName,
          course: exam.course,
        });
      }
    }
    return rows;
  }, [exams, certificates]);

  const selectedRows = useMemo(
    () =>
      eligible.filter((row) =>
        selectedEligible.includes(`${row.studentId}::${row.course}`)
      ),
    [eligible, selectedEligible]
  );

  async function connectCanva() {
    try {
      setBusy(true);
      const url = await startCanvaConnect();
      window.location.href = url;
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Could not start Canva connect";
      toast.error(msg);
      setBusy(false);
    }
  }

  async function generateWithCanva(
    input: CanvaCertificateDraft & { student: string }
  ) {
    try {
      setBusy(true);
      const design = await generateCanvaCertificate(input);
      const number =
        (design.meta?.certificate_number as string | undefined) ||
        design.subjectKey ||
        "";
      createCertificate({
        studentId: input.studentId,
        student: input.student,
        course: (design.meta?.course as string | undefined) || input.course,
        number,
        issuedAt:
          (design.meta?.issued_at as string | undefined) || input.issuedAt || today,
        pdfUrl: design.cdnUrl || design.exportUrl || null,
        editUrl: design.editUrl || null,
      });
      toast.success("Canva certificate ready", { description: number });
      const url = design.cdnUrl || design.exportUrl || design.editUrl;
      if (url) window.open(url, "_blank", "noopener");
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Canva certificate failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  function resetDialog(nextMode: DialogMode = "single") {
    setDialogMode(nextMode);
    setDraft(emptyDraft(canva?.schoolName || "Vellum LMS"));
  }

  function openHtmlEditor(prefill?: {
    studentId?: string | null;
    studentName?: string;
    course?: string;
    id?: string | null;
  }) {
    const params = new URLSearchParams();
    if (prefill?.id) params.set("id", prefill.id);
    if (prefill?.studentId) params.set("studentId", prefill.studentId);
    if (prefill?.studentName) params.set("studentName", prefill.studentName);
    if (prefill?.course) params.set("course", prefill.course);
    const qs = params.toString();
    router.push(
      qs
        ? `/dashboard/certificates/editor?${qs}`
        : "/dashboard/certificates/editor"
    );
  }

  function openSingleDialog(prefill?: Partial<CertificateDraft>) {
    // Prefer full-page HTML editor unless Canva template mode is forced
    if (!useCanva || !canva?.connected || !canva.certificateTemplate) {
      openHtmlEditor({
        studentId: prefill?.studentId ?? null,
        studentName: prefill?.studentName ?? "",
        course: prefill?.course ?? "",
      });
      return;
    }

    setDialogMode("single");
    setDraft({
      ...emptyDraft(canva?.schoolName || "Vellum LMS"),
      ...prefill,
    });
    setOpen(true);
  }

  function openBulkDialog() {
    if (selectedRows.length === 0) {
      toast.error("Select at least one eligible student");
      return;
    }

    // Prefer saved final HTML template style for bulk
    if (finalTemplate && !(useCanva && canva?.connected && canva.certificateTemplate)) {
      const items: BulkStudentItem[] = selectedRows.map((row) => ({
        studentId: row.studentId,
        studentName: row.student,
        course: row.course,
        issuedAt: today,
      }));
      setBusy(true);
      setBulkProgress({ done: 0, total: items.length });
      setBulkHtmlItems(items);
      toast.message("Generating with your final template…", {
        description: `${items.length} certificate(s)`,
      });
      return;
    }

    setDialogMode("bulk");
    setDraft({
      ...emptyDraft(canva?.schoolName || "Vellum LMS"),
      course:
        selectedRows.every((row) => row.course === selectedRows[0]?.course)
          ? selectedRows[0]?.course ?? ""
          : "",
    });
    setOpen(true);
  }

  function toggleEligible(row: EligibleRow, checked: boolean) {
    const key = `${row.studentId}::${row.course}`;
    setSelectedEligible((prev) =>
      checked ? [...prev, key] : prev.filter((item) => item !== key)
    );
  }

  function toggleAllEligible(checked: boolean) {
    setSelectedEligible(
      checked ? eligible.map((row) => `${row.studentId}::${row.course}`) : []
    );
  }

  function validateDraft() {
    if (dialogMode === "single" && !draft.studentId) {
      toast.error("Select a student");
      return false;
    }
    if (dialogMode === "single" && !draft.course.trim()) {
      toast.error("Course is required");
      return false;
    }
    if (dialogMode === "bulk" && selectedRows.length === 0) {
      toast.error("Select eligible students for bulk generation");
      return false;
    }
    if (!draft.issuedAt) {
      toast.error("Issued date is required");
      return false;
    }
    if (!draft.schoolName.trim()) {
      toast.error("School name is required");
      return false;
    }
    return true;
  }

  function buildSinglePayload(): (CanvaCertificateDraft & { student: string }) | null {
    if (!draft.studentId) return null;
    const student = students.find((s) => s.id === draft.studentId);
    if (!student) return null;
    return {
      studentId: draft.studentId,
      student: draft.studentName.trim() || studentFullName(student),
      course: draft.course.trim(),
      certificateNumber: draft.certificateNumber.trim() || undefined,
      issuedAt: draft.issuedAt,
      schoolName: draft.schoolName.trim(),
      batch: draft.batch.trim() || undefined,
      studentName: draft.studentName.trim() || undefined,
    };
  }

  function buildBulkPayload(): (CanvaCertificateDraft & { student: string })[] {
    return selectedRows.map((row) => ({
      studentId: row.studentId,
      student: row.student,
      course: draft.course.trim() || row.course,
      certificateNumber: undefined,
      issuedAt: draft.issuedAt,
      schoolName: draft.schoolName.trim(),
      batch: draft.batch.trim() || undefined,
      studentName: undefined,
    }));
  }

  async function generateBulkWithCanva(
    items: (CanvaCertificateDraft & { student: string })[]
  ) {
    try {
      setBusy(true);
      const results = await generateCanvaCertificatesBulk({
        items: items.map((item) => {
          const rest = { ...item };
          delete (rest as { student?: string }).student;
          return rest;
        }),
      });

      let successCount = 0;
      let failedCount = 0;

      results.forEach((result: CanvaBulkCertificateResult, index) => {
        const source = items[index];
        if (result.success && result.design) {
          successCount += 1;
          createCertificate({
            studentId: source.studentId,
            student: source.student,
            course:
              (result.design.meta?.course as string | undefined) || source.course,
            number:
              (result.design.meta?.certificate_number as string | undefined) ||
              result.design.subjectKey ||
              undefined,
            issuedAt:
              (result.design.meta?.issued_at as string | undefined) ||
              source.issuedAt ||
              today,
            pdfUrl: result.design.cdnUrl || result.design.exportUrl || null,
            editUrl: result.design.editUrl || null,
          });
        } else {
          failedCount += 1;
        }
      });

      if (successCount > 0) {
        toast.success(`Generated ${successCount} Canva certificate(s)`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} certificate(s) failed to generate`);
      }
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Bulk Canva certificate generation failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function submitGenerate() {
    if (!validateDraft()) return;

    if (dialogMode === "single") {
      const payload = buildSinglePayload();
      if (!payload) {
        toast.error("Could not build certificate draft");
        return;
      }

      if (useCanva && canva?.connected && canva.certificateTemplate) {
        await generateWithCanva(payload);
      } else {
        createCertificate({
          studentId: payload.studentId,
          student: payload.student,
          course: payload.course,
          number: payload.certificateNumber || undefined,
          issuedAt: payload.issuedAt,
        });
        toast.success("Certificate generated");
      }
    } else {
      const payload = buildBulkPayload();
      if (useCanva && canva?.connected && canva.certificateTemplate) {
        await generateBulkWithCanva(payload);
      } else {
        payload.forEach((item) => {
          createCertificate({
            studentId: item.studentId,
            student: item.student,
            course: item.course,
            issuedAt: item.issuedAt,
          });
        });
        toast.success(`Generated ${payload.length} certificate(s)`);
      }
    }

    setOpen(false);
    resetDialog(dialogMode);
    setSelectedEligible([]);
  }

  function runVerify() {
    if (!verify.trim()) return toast.error("Enter a certificate number");
    const found = verifyCertificate(verify);
    setVerifyResult(found);
    if (found) toast.success(`Valid · ${found.student} · ${found.course}`);
    else toast.error("Certificate not found");
  }

  async function downloadPdf(cert: CertificateRecord) {
    const url = cert.pdfUrl;
    if (!url) {
      toast.error("No PDF for this certificate", {
        description: "Open Edit to create and download a PDF.",
      });
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${cert.number || "certificate"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success("PDF downloaded", { description: cert.number });
    } catch {
      // CORS / expired Canva export URL — open in a new tab as fallback
      window.open(url, "_blank", "noopener");
      toast.success("Opened PDF", {
        description: "Use the browser download button if it does not save automatically.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Design on the full-page editor, save as final, then bulk-generate with the same style."
        actions={
          <div className="flex flex-wrap gap-2">
            {canva?.configured && !canva.connected ? (
              <Button
                size="sm"
                variant="outline"
                onClick={connectCanva}
                disabled={busy}
              >
                {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Connect Canva
              </Button>
            ) : null}
            {canva?.connected ? <SoftBadge>Canva connected</SoftBadge> : null}
            {finalTemplate ? <SoftBadge>Final style ready</SoftBadge> : null}
            <Button size="sm" onClick={() => openHtmlEditor()}>
              <Plus /> Generate
            </Button>
          </div>
        }
      />

      {eligible.length > 0 ? (
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base flex items-center gap-1.5">
                <Sparkles className="size-4" /> Eligible for certificate
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                {selectedRows.length > 0 ? (
                  <SoftBadge>{selectedRows.length} selected</SoftBadge>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openBulkDialog}
                  disabled={busy || selectedRows.length === 0}
                >
                  <CheckSquare />
                  {finalTemplate
                    ? "Bulk with final style"
                    : canva?.connected
                      ? "Bulk Canva generate"
                      : "Bulk generate"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        eligible.length > 0 &&
                        selectedEligible.length === eligible.length
                      }
                      onCheckedChange={(value) => toggleAllEligible(Boolean(value))}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eligible.map((row) => (
                  <TableRow key={`${row.studentId}-${row.course}`}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEligible.includes(
                          `${row.studentId}::${row.course}`
                        )}
                        onCheckedChange={(value) =>
                          toggleEligible(row, Boolean(value))
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{row.student}</TableCell>
                    <TableCell>{row.course}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="xs"
                        onClick={() =>
                          openSingleDialog({
                            studentId: row.studentId,
                            studentName: row.student,
                            course: row.course,
                          })
                        }
                        disabled={busy}
                      >
                        <Award /> Edit & download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Card className="shadow-none">
        <Tabs defaultValue="list">
          <CardHeader className="border-b pb-0 space-y-3">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Certificates</CardTitle>
              <SearchField
                value={query}
                onChange={setQuery}
                className="max-w-xs"
                placeholder="Search…"
              />
            </div>
            <TabsList variant="line">
              <TabsTrigger value="list">All</TabsTrigger>
              <TabsTrigger value="verify">QR verify</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="list">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={Award}
                  title="No certificates"
                  description="Generate a certificate to get started."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">
                          {c.number || "—"}
                        </TableCell>
                        <TableCell>{c.student}</TableCell>
                        <TableCell>{c.course}</TableCell>
                        <TableCell>{c.issuedAt || "—"}</TableCell>
                        <TableCell>
                          <SoftBadge>{c.status}</SoftBadge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {c.status === "pending" ? (
                            <Button
                              size="xs"
                              onClick={() => {
                                issueCertificate(c.id);
                                toast.success("Certificate issued");
                              }}
                            >
                              Issue
                            </Button>
                          ) : null}
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() =>
                              openHtmlEditor({
                                id: c.id,
                                studentId: c.studentId || null,
                                studentName: c.student,
                                course: c.course,
                              })
                            }
                          >
                            <Pencil />
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              if (c.pdfUrl) {
                                void downloadPdf(c);
                                return;
                              }
                              openHtmlEditor({
                                id: c.id,
                                studentId: c.studentId || null,
                                studentName: c.student,
                                course: c.course,
                              });
                            }}
                            title={
                              c.pdfUrl
                                ? "Download PDF"
                                : "Open editor to create & download PDF"
                            }
                          >
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            <TabsContent value="verify" className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label className="text-xs">Certificate number</Label>
                <Input
                  value={verify}
                  onChange={(e) => setVerify(e.target.value)}
                  placeholder="CERT-2026-088"
                />
              </div>
              <Button size="sm" onClick={runVerify}>
                <ScanLine /> Verify
              </Button>

              {verifyResult !== undefined ? (
                verifyResult ? (
                  <div className="space-y-3 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="size-4 text-primary" />
                      <p className="text-sm font-medium">
                        {verifyResult.student}
                      </p>
                      <SoftBadge>{verifyResult.status}</SoftBadge>
                    </div>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">Course</dt>
                        <dd>{verifyResult.course}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Issued</dt>
                        <dd>{verifyResult.issuedAt || "—"}</dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  <p className="text-sm text-destructive">
                    No certificate found with that number.
                  </p>
                )
              ) : null}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "bulk"
                ? `Generate ${selectedRows.length} certificates`
                : "Generate certificate"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            {dialogMode === "single" ? (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Student</Label>
                  <StudentPicker
                    value={draft.studentId}
                    onChange={(value) =>
                      setDraft((prev) => ({ ...prev, studentId: value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Student name override</Label>
                  <Input
                    value={draft.studentName}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        studentName: e.target.value,
                      }))
                    }
                    placeholder="Optional display name override"
                  />
                </div>
              </>
            ) : (
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                {selectedRows.length} selected student(s) will be generated.
                Leave course blank to keep each student&apos;s current eligible
                course.
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Course</Label>
              <Input
                value={draft.course}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, course: e.target.value }))
                }
                placeholder={
                  dialogMode === "bulk"
                    ? "Optional bulk course override"
                    : "Barista Level 1"
                }
              />
            </div>
            {dialogMode === "single" ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Certificate number</Label>
                <Input
                  value={draft.certificateNumber}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      certificateNumber: e.target.value,
                    }))
                  }
                  placeholder="Optional custom number"
                />
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label className="text-xs">Issued date</Label>
              <Input
                type="date"
                value={draft.issuedAt}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, issuedAt: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">School name</Label>
              <Input
                value={draft.schoolName}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, schoolName: e.target.value }))
                }
                placeholder="Vellum LMS"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Batch override</Label>
              <Input
                value={draft.batch}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, batch: e.target.value }))
                }
                placeholder="Optional batch override"
              />
            </div>
            {canva?.connected && canva.certificateTemplate ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useCanva}
                  onChange={(e) => setUseCanva(e.target.checked)}
                />
                Design with Canva template
              </label>
            ) : canva?.configured && !canva.certificateTemplate ? (
              <p className="text-xs text-muted-foreground">
                Set CANVA_CERTIFICATE_TEMPLATE_ID to enable Canva designs.
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetDialog(dialogMode);
              }}
            >
              Cancel
            </Button>
            <Button onClick={submitGenerate} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : null}
              {dialogMode === "bulk" ? "Generate selected" : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {bulkHtmlItems ? (
        <BulkHtmlCertificateRunner
          template={getFinalTemplate()}
          items={bulkHtmlItems}
          onProgress={(done, total) => setBulkProgress({ done, total })}
          onError={(msg) => toast.error(msg)}
          onComplete={(results) => {
            results.forEach((r) => {
              createCertificate({
                studentId: r.studentId,
                student: r.studentName,
                course: r.course,
                number: r.number,
                issuedAt: r.issuedAt,
                pdfUrl: r.pdfUrl,
              });
            });
            toast.success(
              `Generated ${results.length} certificate(s) with final style`
            );
            setBulkHtmlItems(null);
            setBulkProgress(null);
            setBusy(false);
            setSelectedEligible([]);
          }}
        />
      ) : null}

      {bulkProgress ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg">
          Generating certificates… {bulkProgress.done}/{bulkProgress.total}
        </div>
      ) : null}
    </div>
  );
}

export default function CertificatesPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading certificates…</div>
      }
    >
      <CertificatesInner />
    </Suspense>
  );
}
