"use client";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

import type { CertificateDesign } from "@/components/certificates/certificate-design";

export async function renderDesignToPdf(
  element: HTMLElement,
  design: CertificateDesign,
  fileName: string,
  download = true
): Promise<string> {
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    backgroundColor: design.colors.background || "#ffffff",
  });
  const img = canvas.toDataURL("image/png");
  const w = design.canvas?.widthMm || 297;
  const h = design.canvas?.heightMm || 210;
  const pdf = new jsPDF({
    orientation: w >= h ? "landscape" : "portrait",
    unit: "mm",
    format: [w, h],
  });
  pdf.addImage(img, "PNG", 0, 0, w, h);
  const blob = pdf.output("blob");
  const objectUrl = URL.createObjectURL(blob);

  if (download) {
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return objectUrl;
}
