"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  CertificatePreview,
} from "@/components/certificates/certificate-preview";
import { ImageCropDialog } from "@/components/certificates/image-crop-dialog";
import { renderDesignToPdf } from "@/components/certificates/render-certificate-pdf";
import {
  CANVAS_PRESETS,
  FULL_CROP,
  GOOGLE_FONT_OPTIONS,
  defaultCertificateDesign,
  importLocalFont,
  loadGoogleFont,
  readImageAsDataUrl,
  uid,
  type CanvasPreset,
  type CertificateDesign,
  type CertificateElement,
  type ElementShape,
} from "@/components/certificates/certificate-design";
import { StudentPicker } from "@/components/students/student-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCertificateTemplateStore } from "@/store/certificate-template-store";
import { useOpsStore } from "@/store/ops-store";
import { useStudentsStore } from "@/store/students-store";
import { studentFullName } from "@/types/student";
import {
  ArrowLeft,
  BookmarkCheck,
  Crop,
  Download,
  ImagePlus,
  Loader2,
  Move,
  RotateCcw,
  Trash2,
  Type,
  Upload,
} from "lucide-react";

type CertificateStudioProps = {
  initial?: Partial<CertificateDesign>;
  certificateId?: string | null;
};

function FontSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <select
        className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontFamily: `"${value}", sans-serif` }}
      >
        {options.map((font) => (
          <option key={font} value={font} style={{ fontFamily: `"${font}", sans-serif` }}>
            {font}
          </option>
        ))}
      </select>
    </div>
  );
}

function SizeField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-muted-foreground text-[11px]">{value}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#0b1f4a]"
      />
    </div>
  );
}

function ImageSlot({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        <div className="flex gap-1">
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            <Upload /> Upload
          </Button>
          {value ? (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => onChange(null)}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const url = await readImageAsDataUrl(file);
            onChange(url);
            toast.success(`${label} updated`);
          } catch {
            toast.error("Could not read image");
          }
          e.target.value = "";
        }}
      />
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt={label}
          className="mt-1 h-16 w-full rounded border object-contain bg-muted/30"
        />
      ) : (
        <p className="text-muted-foreground text-[11px]">No image — using default</p>
      )}
    </div>
  );
}

export function CertificateStudio({
  initial,
  certificateId = null,
}: CertificateStudioProps) {
  const router = useRouter();
  const students = useStudentsStore((s) => s.students);
  const createCertificate = useOpsStore((s) => s.createCertificate);
  const updateCertificate = useOpsStore((s) => s.updateCertificate);
  const saveFinalTemplate = useCertificateTemplateStore(
    (s) => s.saveFinalTemplate
  );
  const savedAt = useCertificateTemplateStore((s) => s.savedAt);
  const finalTemplate = useCertificateTemplateStore((s) => s.finalTemplate);

  const [design, setDesign] = useState<CertificateDesign>(() =>
    defaultCertificateDesign(initial)
  );
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);
  const addImageRef = useRef<HTMLInputElement>(null);

  const fontOptions = useMemo(
    () => [...GOOGLE_FONT_OPTIONS, ...design.customFonts],
    [design.customFonts]
  );

  const selected = useMemo(
    () => design.elements.find((e) => e.id === selectedId) ?? null,
    [design.elements, selectedId]
  );

  useEffect(() => {
    const families = new Set([
      ...Object.values(design.fonts),
      ...GOOGLE_FONT_OPTIONS,
    ]);
    families.forEach((f) => {
      if (!design.customFonts.includes(f)) loadGoogleFont(f);
    });
  }, [design.fonts, design.customFonts]);

  function patch<K extends keyof CertificateDesign>(
    key: K,
    value: CertificateDesign[K]
  ) {
    setDesign((prev) => ({ ...prev, [key]: value }));
  }

  function patchNested<
    K extends "fonts" | "colors" | "sizes" | "layout" | "images" | "canvas",
  >(group: K, key: keyof CertificateDesign[K], value: CertificateDesign[K][typeof key]) {
    setDesign((prev) => ({
      ...prev,
      [group]: { ...prev[group], [key]: value },
    }));
  }

  function patchElement(id: string, patchEl: Partial<CertificateElement>) {
    setDesign((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? { ...el, ...patchEl } : el
      ),
    }));
  }

  function removeElement(id: string) {
    setDesign((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }));
    if (selectedId === id) setSelectedId(null);
  }

  async function addUserImage(file: File) {
    try {
      const src = await readImageAsDataUrl(file);
      const el: CertificateElement = {
        id: uid("img"),
        type: "image",
        x: 35,
        y: 30,
        w: 30,
        h: 28,
        visible: true,
        src,
        shape: "rounded",
        crop: FULL_CROP,
        label: file.name,
      };
      setDesign((prev) => ({ ...prev, elements: [...prev.elements, el] }));
      setSelectedId(el.id);
      toast.success("Image added — drag it on the canvas");
    } catch {
      toast.error("Could not add image");
    }
  }

  function openCropForSelected() {
    if (!selected) {
      toast.error("Click an image on the canvas first");
      return;
    }
    const src =
      selected.src ||
      (selected.type === "logo" ? design.images.logo : null) ||
      (selected.type === "seal" ? design.images.seal : null);
    if (!src) {
      toast.error("Upload an image on this layer before cropping");
      return;
    }
    setCropSource(src);
    setCropOpen(true);
  }

  function onStudentChange(studentId: string | null) {
    const student = students.find((s) => s.id === studentId);
    setDesign((prev) => ({
      ...prev,
      studentId,
      studentName: student ? studentFullName(student) : prev.studentName,
      course: student?.course || prev.course,
      batch: student?.batch || prev.batch,
    }));
  }

  async function handleImportFont(file: File) {
    try {
      const family = await importLocalFont(file);
      setDesign((prev) => ({
        ...prev,
        customFonts: prev.customFonts.includes(family)
          ? prev.customFonts
          : [...prev.customFonts, family],
        fonts: { ...prev.fonts, name: family },
      }));
      toast.success(`Font imported: ${family}`, {
        description: "Applied to student name — change any font slot to use it.",
      });
    } catch {
      toast.error("Could not import font");
    }
  }

  async function handleSaveDownload() {
    if (!design.studentName.trim()) {
      toast.error("Student name is required");
      return;
    }
    if (!design.course.trim()) {
      toast.error("Course is required");
      return;
    }
    if (!previewRef.current) {
      toast.error("Preview not ready");
      return;
    }

    setBusy(true);
    try {
      setSelectedId(null);
      await new Promise((r) => setTimeout(r, 80));
      const number =
        design.certificateNumber.trim() ||
        `CERT-${new Date().getFullYear()}-${String(
          Math.floor(Math.random() * 900) + 100
        )}`;
      const next = { ...design, certificateNumber: number };
      setDesign(next);
      await new Promise((r) => setTimeout(r, 150));
      if (!previewRef.current) throw new Error("Missing preview");

      const pdfUrl = await renderDesignToPdf(
        previewRef.current,
        next,
        `${number}.pdf`,
        true
      );

      if (certificateId) {
        await updateCertificate(certificateId, {
          studentId: next.studentId || "",
          student: next.studentName,
          course: next.course,
          number,
          issuedAt: next.issuedAt,
          status: "issued",
          pdfUrl,
          editUrl: null,
        });
      } else {
        const created = await createCertificate({
          studentId: next.studentId || "",
          student: next.studentName,
          course: next.course,
          number,
          issuedAt: next.issuedAt,
          pdfUrl,
        });
        router.replace(`/dashboard/certificates/editor?id=${created.id}`);
      }

      toast.success("Certificate saved & PDF downloaded", { description: number });
    } catch (e) {
      console.error(e);
      toast.error("Could not create PDF");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/certificates" />}
          >
            <ArrowLeft /> Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Certificate editor
            </h1>
            <p className="text-muted-foreground text-xs">
              Double-click text to edit · drag with X/Y guides · save as final for
              bulk
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDesign(defaultCertificateDesign(initial))}
          >
            <RotateCcw /> Reset
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              saveFinalTemplate(design);
              toast.success("Saved as final template", {
                description:
                  "Bulk generate will reuse this style for every student.",
              });
            }}
          >
            <BookmarkCheck /> Save as final
          </Button>
          <Button size="sm" onClick={handleSaveDownload} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Download />}
            Save & download PDF
          </Button>
        </div>
      </div>

      {savedAt && finalTemplate ? (
        <p className="text-muted-foreground -mt-2 text-[11px]">
          Final template saved {new Date(savedAt).toLocaleString()} — bulk
          certificates will use this style.
        </p>
      ) : null}

      <div className="grid flex-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="bg-card max-h-[calc(100vh-10rem)] overflow-y-auto rounded-xl border p-3 shadow-none">
          <Tabs defaultValue="content">
            <TabsList className="mb-3 grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="fonts">
                <Type className="size-3.5" /> Fonts
              </TabsTrigger>
              <TabsTrigger value="images">
                <ImagePlus className="size-3.5" /> Images
              </TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Student</Label>
                <StudentPicker
                  value={design.studentId}
                  onChange={onStudentChange}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Heading</Label>
                <Input
                  value={design.heading || "CERTIFICATE"}
                  onChange={(e) => patch("heading", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Student name</Label>
                <Input
                  value={design.studentName}
                  onChange={(e) => patch("studentName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Subtitle</Label>
                <Input
                  value={design.subtitle}
                  onChange={(e) => patch("subtitle", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Presented label</Label>
                <Input
                  value={design.presentedLabel}
                  onChange={(e) => patch("presentedLabel", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Course</Label>
                <Input
                  value={design.course}
                  onChange={(e) => patch("course", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">School / agency</Label>
                <Input
                  value={design.schoolName}
                  onChange={(e) => patch("schoolName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description override</Label>
                <Textarea
                  rows={3}
                  value={design.description}
                  onChange={(e) => patch("description", e.target.value)}
                  placeholder="Leave blank to auto-build"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Left signer</Label>
                  <Input
                    value={design.leftSigner}
                    onChange={(e) => patch("leftSigner", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Left title</Label>
                  <Input
                    value={design.leftTitle}
                    onChange={(e) => patch("leftTitle", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Right signer</Label>
                  <Input
                    value={design.rightSigner}
                    onChange={(e) => patch("rightSigner", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Right title</Label>
                  <Input
                    value={design.rightTitle}
                    onChange={(e) => patch("rightTitle", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Certificate #</Label>
                  <Input
                    value={design.certificateNumber}
                    onChange={(e) => patch("certificateNumber", e.target.value)}
                    placeholder="Auto"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Issued</Label>
                  <Input
                    type="date"
                    value={design.issuedAt}
                    onChange={(e) => patch("issuedAt", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Batch</Label>
                <Input
                  value={design.batch}
                  onChange={(e) => patch("batch", e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="fonts" className="space-y-3">
              <div className="rounded-lg border border-dashed p-3">
                <p className="mb-2 text-xs font-medium">Import custom font</p>
                <p className="text-muted-foreground mb-2 text-[11px]">
                  Upload .ttf, .otf, .woff, or .woff2
                </p>
                <input
                  ref={fontInputRef}
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await handleImportFont(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fontInputRef.current?.click()}
                >
                  <Upload /> Import font file
                </Button>
                {design.customFonts.length > 0 ? (
                  <p className="text-muted-foreground mt-2 text-[11px]">
                    Imported: {design.customFonts.join(", ")}
                  </p>
                ) : null}
              </div>

              <FontSelect
                label="Title font (CERTIFICATE)"
                value={design.fonts.title}
                options={fontOptions}
                onChange={(v) => patchNested("fonts", "title", v)}
              />
              <FontSelect
                label="Subtitle font"
                value={design.fonts.subtitle}
                options={fontOptions}
                onChange={(v) => patchNested("fonts", "subtitle", v)}
              />
              <FontSelect
                label="Name script font"
                value={design.fonts.name}
                options={fontOptions}
                onChange={(v) => patchNested("fonts", "name", v)}
              />
              <FontSelect
                label="Body / description"
                value={design.fonts.body}
                options={fontOptions}
                onChange={(v) => patchNested("fonts", "body", v)}
              />
              <FontSelect
                label="Label font"
                value={design.fonts.label}
                options={fontOptions}
                onChange={(v) => patchNested("fonts", "label", v)}
              />
              <FontSelect
                label="Signer font"
                value={design.fonts.signer}
                options={fontOptions}
                onChange={(v) => patchNested("fonts", "signer", v)}
              />

              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-medium">Font sizes</p>
                <SizeField
                  label="Title"
                  value={design.sizes.title}
                  min={24}
                  max={72}
                  onChange={(v) => patchNested("sizes", "title", v)}
                />
                <SizeField
                  label="Subtitle"
                  value={design.sizes.subtitle}
                  min={10}
                  max={28}
                  onChange={(v) => patchNested("sizes", "subtitle", v)}
                />
                <SizeField
                  label="Name"
                  value={design.sizes.name}
                  min={28}
                  max={80}
                  onChange={(v) => patchNested("sizes", "name", v)}
                />
                <SizeField
                  label="Body"
                  value={design.sizes.body}
                  min={8}
                  max={22}
                  onChange={(v) => patchNested("sizes", "body", v)}
                />
                <SizeField
                  label="Signer"
                  value={design.sizes.signer}
                  min={8}
                  max={20}
                  onChange={(v) => patchNested("sizes", "signer", v)}
                />
              </div>

              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-medium">Colors</p>
                {(
                  [
                    ["navy", "Navy / text"],
                    ["gold", "Gold accents"],
                    ["name", "Name color"],
                    ["background", "Background"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <Label className="text-xs">{label}</Label>
                    <Input
                      type="color"
                      className="h-8 w-14 cursor-pointer p-1"
                      value={design.colors[key]}
                      onChange={(e) =>
                        patchNested("colors", key, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-3">
              <div className="rounded-lg border border-dashed p-3 space-y-2">
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <Move className="size-3.5" /> Add & edit images
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Add a free image layer, then drag it on the certificate. Change
                  shape and crop below.
                </p>
                <input
                  ref={addImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await addUserImage(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addImageRef.current?.click()}
                >
                  <ImagePlus /> Add image layer
                </Button>
              </div>

              {selected ? (
                <div className="space-y-3 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium capitalize">
                      Selected: {selected.label || selected.type}
                    </p>
                    {selected.type === "image" ? (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => removeElement(selected.id)}
                      >
                        <Trash2 /> Remove
                      </Button>
                    ) : null}
                  </div>

                  {(selected.type === "image" ||
                    selected.type === "logo" ||
                    selected.type === "seal") && (
                    <>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Shape</Label>
                        <select
                          className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                          value={selected.shape || "rect"}
                          onChange={(e) =>
                            patchElement(selected.id, {
                              shape: e.target.value as ElementShape,
                            })
                          }
                        >
                          <option value="rect">Rectangle</option>
                          <option value="rounded">Rounded</option>
                          <option value="circle">Circle</option>
                          <option value="oval">Oval</option>
                        </select>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = async () => {
                              const file = input.files?.[0];
                              if (!file) return;
                              const src = await readImageAsDataUrl(file);
                              patchElement(selected.id, {
                                src,
                                crop: FULL_CROP,
                              });
                              if (selected.type === "logo") {
                                patchNested("images", "logo", src);
                              }
                              if (selected.type === "seal") {
                                patchNested("images", "seal", src);
                              }
                              toast.success("Image replaced");
                            };
                            input.click();
                          }}
                        >
                          <Upload /> Replace image
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={openCropForSelected}
                        >
                          <Crop /> Crop
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">X %</Label>
                      <Input
                        type="number"
                        value={Math.round(selected.x)}
                        onChange={(e) =>
                          patchElement(selected.id, {
                            x: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Y %</Label>
                      <Input
                        type="number"
                        value={Math.round(selected.y)}
                        onChange={(e) =>
                          patchElement(selected.id, {
                            y: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Width %</Label>
                      <Input
                        type="number"
                        value={Math.round(selected.w)}
                        onChange={(e) =>
                          patchElement(selected.id, {
                            w: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Height %</Label>
                      <Input
                        type="number"
                        value={Math.round(selected.h)}
                        onChange={(e) =>
                          patchElement(selected.id, {
                            h: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <label className="flex items-center justify-between gap-2 text-sm">
                    <span>Visible</span>
                    <Checkbox
                      checked={selected.visible}
                      onCheckedChange={(v) =>
                        patchElement(selected.id, { visible: Boolean(v) })
                      }
                    />
                  </label>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs rounded-lg border p-3">
                  Click any text, seal, logo, or image on the canvas to select it.
                  Drag to move; blue handle to resize.
                </p>
              )}

              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-medium">Template images</p>
                <ImageSlot
                  label="Background"
                  value={design.images.background}
                  onChange={(v) => patchNested("images", "background", v)}
                />
                <ImageSlot
                  label="Top-left corner art"
                  value={design.images.cornerTopLeft}
                  onChange={(v) => patchNested("images", "cornerTopLeft", v)}
                />
                <ImageSlot
                  label="Bottom-right corner art"
                  value={design.images.cornerBottomRight}
                  onChange={(v) =>
                    patchNested("images", "cornerBottomRight", v)
                  }
                />
              </div>

              <div className="space-y-1.5 border-t pt-3">
                <p className="text-xs font-medium">Layers</p>
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {design.elements.map((el) => (
                    <button
                      key={el.id}
                      type="button"
                      className={`flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-xs ${
                        selectedId === el.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedId(el.id)}
                    >
                      <span className="capitalize">
                        {el.label || el.type}
                      </span>
                      <span className="text-muted-foreground">
                        {el.visible ? "on" : "off"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-3">
              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-xs font-medium">Certificate size</p>
                <select
                  className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
                  value={design.canvas?.preset || "a4-landscape"}
                  onChange={(e) => {
                    const preset = e.target.value as CanvasPreset;
                    if (preset === "custom") {
                      patchNested("canvas", "preset", "custom");
                      return;
                    }
                    const p = CANVAS_PRESETS[preset];
                    setDesign((prev) => ({
                      ...prev,
                      canvas: {
                        preset,
                        widthMm: p.widthMm,
                        heightMm: p.heightMm,
                      },
                    }));
                  }}
                >
                  {Object.entries(CANVAS_PRESETS).map(([key, p]) => (
                    <option key={key} value={key}>
                      {p.label} ({p.widthMm}×{p.heightMm} mm)
                    </option>
                  ))}
                  <option value="custom">Custom</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Width mm</Label>
                    <Input
                      type="number"
                      value={design.canvas?.widthMm ?? 297}
                      onChange={(e) => {
                        setDesign((prev) => ({
                          ...prev,
                          canvas: {
                            ...prev.canvas,
                            preset: "custom",
                            widthMm: Number(e.target.value) || 297,
                          },
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Height mm</Label>
                    <Input
                      type="number"
                      value={design.canvas?.heightMm ?? 210}
                      onChange={(e) => {
                        setDesign((prev) => ({
                          ...prev,
                          canvas: {
                            ...prev.canvas,
                            preset: "custom",
                            heightMm: Number(e.target.value) || 210,
                          },
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>

              {(
                [
                  ["showCorners", "Corner decorations"],
                  ["showFrame", "Gold frame"],
                  ["showFiligree", "Corner filigree"],
                  ["showSeal", "Center seal"],
                  ["showLogo", "Logo"],
                  ["showDivider", "Name divider"],
                  ["showNumber", "Certificate number"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <span>{label}</span>
                  <Checkbox
                    checked={design.layout[key]}
                    onCheckedChange={(v) =>
                      patchNested("layout", key, Boolean(v))
                    }
                  />
                </label>
              ))}

              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-medium">Spacing</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Frame inset</Label>
                    <span className="text-muted-foreground text-[11px]">
                      {design.layout.frameInset}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    step={0.5}
                    value={design.layout.frameInset}
                    onChange={(e) =>
                      patchNested("layout", "frameInset", Number(e.target.value))
                    }
                    className="w-full accent-[#0b1f4a]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Side padding</Label>
                    <span className="text-muted-foreground text-[11px]">
                      {design.layout.contentPadX}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={18}
                    step={0.5}
                    value={design.layout.contentPadX}
                    onChange={(e) =>
                      patchNested(
                        "layout",
                        "contentPadX",
                        Number(e.target.value)
                      )
                    }
                    className="w-full accent-[#0b1f4a]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Top padding</Label>
                    <span className="text-muted-foreground text-[11px]">
                      {design.layout.contentPadTop}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={16}
                    step={0.5}
                    value={design.layout.contentPadTop}
                    onChange={(e) =>
                      patchNested(
                        "layout",
                        "contentPadTop",
                        Number(e.target.value)
                      )
                    }
                    className="w-full accent-[#0b1f4a]"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="bg-muted/40 flex min-h-[420px] flex-col items-center justify-start gap-2 overflow-auto rounded-xl border p-4 sm:p-6">
          <p className="text-muted-foreground self-start text-[11px]">
            Double-click text to type · pink lines = X/Y guides while dragging
          </p>
          <div className="w-full max-w-5xl">
            <CertificatePreview
              design={design}
              previewRef={previewRef}
              interactive
              selectedId={selectedId}
              onSelect={setSelectedId}
              onElementChange={patchElement}
              onDesignChange={(patchDesign) =>
                setDesign((prev) => ({ ...prev, ...patchDesign }))
              }
            />
          </div>
        </div>
      </div>

      <ImageCropDialog
        open={cropOpen}
        src={cropSource}
        initialCrop={selected?.crop || FULL_CROP}
        onOpenChange={setCropOpen}
        onApply={(croppedSrc, crop) => {
          if (!selectedId) return;
          patchElement(selectedId, { src: croppedSrc, crop });
          const el = design.elements.find((e) => e.id === selectedId);
          if (el?.type === "logo") patchNested("images", "logo", croppedSrc);
          if (el?.type === "seal") patchNested("images", "seal", croppedSrc);
        }}
      />
    </div>
  );
}
