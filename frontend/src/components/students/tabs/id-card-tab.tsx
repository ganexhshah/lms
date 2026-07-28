"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CreditCard,
  Download,
  ExternalLink,
  Loader2,
  Printer,
  Sparkles,
} from "lucide-react";

import { IdCardPreview } from "@/components/students/id-card-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchCanvaStatus,
  generateCanvaIdCard,
  startCanvaConnect,
  type CanvaDesign,
  type CanvaStatus,
} from "@/lib/api/canva";
import { useStudentsStore } from "@/store/students-store";
import { studentFullName, type Student } from "@/types/student";

type IdCardTabProps = {
  student: Student;
};

export function IdCardTab({ student }: IdCardTabProps) {
  const issueIdCard = useStudentsStore((s) => s.issueIdCard);
  const [canva, setCanva] = useState<CanvaStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [design, setDesign] = useState<CanvaDesign | null>(null);

  useEffect(() => {
    fetchCanvaStatus()
      .then(setCanva)
      .catch(() => setCanva(null));
  }, []);

  function handleIssue() {
    issueIdCard(student.id);
    toast.success("ID card generated", {
      description: student.studentCode,
    });
  }

  function handlePrint() {
    if (!student.idCardIssued) issueIdCard(student.id);
    window.print();
    toast.success("Print dialog opened");
  }

  function handleDownload() {
    if (!student.idCardIssued) issueIdCard(student.id);
    const blob = new Blob(
      [
        `Vellum LMS Student ID Card\n`,
        `Code: ${student.studentCode}\n`,
        `Name: ${studentFullName(student)}\n`,
        `Course: ${student.course}\n`,
        `Batch: ${student.batch}\n`,
        `Blood group: ${student.bloodGroup}\n`,
        `Issued: ${new Date().toISOString().slice(0, 10)}\n`,
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${student.studentCode}-id-card.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ID card file downloaded");
  }

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

  async function generateWithCanva() {
    try {
      setBusy(true);
      const result = await generateCanvaIdCard(student.id);
      setDesign(result);
      issueIdCard(student.id);
      toast.success("Canva ID card ready", {
        description: result.subjectKey ?? student.studentCode,
      });
      if (result.editUrl) window.open(result.editUrl, "_blank", "noopener");
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Canva generation failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const downloadUrl = design?.cdnUrl || design?.exportUrl;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
      <IdCardPreview student={student} />
      <div className="flex flex-col gap-2 lg:min-w-[200px]">
        <Button onClick={handleIssue} disabled={student.idCardIssued}>
          <CreditCard />
          {student.idCardIssued ? "Already issued" : "Generate card"}
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer />
          Print
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download />
          Download
        </Button>

        {canva?.configured ? (
          <>
            <div className="my-1 border-t" />
            {!canva.connected ? (
              <Button variant="secondary" onClick={connectCanva} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Connect Canva
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={generateWithCanva}
                disabled={busy || !canva.idCardTemplate}
              >
                {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Generate with Canva
              </Button>
            )}
            {!canva.idCardTemplate ? (
              <p className="text-[11px] text-muted-foreground">
                Set CANVA_ID_CARD_TEMPLATE_ID in backend .env
              </p>
            ) : null}
            {design?.editUrl ? (
              <Button
                variant="outline"
                onClick={() => window.open(design.editUrl!, "_blank", "noopener")}
              >
                <ExternalLink />
                Open in Canva
              </Button>
            ) : null}
            {downloadUrl ? (
              <Button
                variant="outline"
                onClick={() => window.open(downloadUrl, "_blank", "noopener")}
              >
                <Download />
                Download PDF
              </Button>
            ) : null}
          </>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            Add Canva Client ID/Secret to enable Canva ID cards.
          </p>
        )}

        {student.idCardIssued ? (
          <Badge variant="secondary" className="justify-center">
            Issued {student.idCardIssuedAt}
          </Badge>
        ) : (
          <Badge variant="outline" className="justify-center">
            Not issued
          </Badge>
        )}
      </div>
    </div>
  );
}
