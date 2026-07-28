export type ElementShape = "rect" | "rounded" | "circle" | "oval";

export type CropRect = {
  /** left % of source (0-100) */
  x: number;
  /** top % of source (0-100) */
  y: number;
  /** width % of source (1-100) */
  w: number;
  /** height % of source (1-100) */
  h: number;
};

export type CertificateElementType =
  | "title"
  | "subtitle"
  | "label"
  | "name"
  | "description"
  | "divider"
  | "number"
  | "leftSigner"
  | "rightSigner"
  | "seal"
  | "logo"
  | "image";

export type CertificateElement = {
  id: string;
  type: CertificateElementType;
  /** left % of canvas */
  x: number;
  /** top % of canvas */
  y: number;
  /** width % of canvas */
  w: number;
  /** height % of canvas (images / seal / logo) */
  h: number;
  visible: boolean;
  /** freeform user images */
  src?: string | null;
  shape?: ElementShape;
  crop?: CropRect;
  label?: string;
};

export type CertificateDesign = {
  studentId: string | null;
  studentName: string;
  course: string;
  certificateNumber: string;
  issuedAt: string;
  schoolName: string;
  batch: string;
  /** Main heading, default CERTIFICATE */
  heading: string;
  subtitle: string;
  presentedLabel: string;
  description: string;
  leftSigner: string;
  leftTitle: string;
  rightSigner: string;
  rightTitle: string;

  fonts: {
    title: string;
    subtitle: string;
    label: string;
    name: string;
    body: string;
    signer: string;
  };

  colors: {
    navy: string;
    gold: string;
    background: string;
    name: string;
  };

  sizes: {
    title: number;
    subtitle: number;
    name: number;
    body: number;
    label: number;
    signer: number;
  };

  /** Physical / export canvas size in millimeters */
  canvas: {
    preset: CanvasPreset;
    widthMm: number;
    heightMm: number;
  };

  layout: {
    showCorners: boolean;
    showFrame: boolean;
    showFiligree: boolean;
    showSeal: boolean;
    showLogo: boolean;
    showNumber: boolean;
    showDivider: boolean;
    frameInset: number;
    contentPadX: number;
    contentPadTop: number;
  };

  images: {
    logo: string | null;
    seal: string | null;
    background: string | null;
    cornerTopLeft: string | null;
    cornerBottomRight: string | null;
  };

  /** Draggable / editable layers on the canvas */
  elements: CertificateElement[];

  /** User-imported font families */
  customFonts: string[];
};

export type CanvasPreset =
  | "a4-landscape"
  | "a4-portrait"
  | "letter-landscape"
  | "square"
  | "custom";

export const CANVAS_PRESETS: Record<
  Exclude<CanvasPreset, "custom">,
  { widthMm: number; heightMm: number; label: string }
> = {
  "a4-landscape": { widthMm: 297, heightMm: 210, label: "A4 Landscape" },
  "a4-portrait": { widthMm: 210, heightMm: 297, label: "A4 Portrait" },
  "letter-landscape": {
    widthMm: 279.4,
    heightMm: 215.9,
    label: "Letter Landscape",
  },
  square: { widthMm: 210, heightMm: 210, label: "Square" },
};

export const GOOGLE_FONT_OPTIONS = [
  "Montserrat",
  "Great Vibes",
  "Playfair Display",
  "Cinzel",
  "Pinyon Script",
  "Allura",
  "Alex Brush",
  "Dancing Script",
  "Lora",
  "Cormorant Garamond",
  "Oswald",
  "Raleway",
  "Poppins",
  "Roboto Slab",
  "Libre Baskerville",
  "Parisienne",
  "Tangerine",
  "Italianno",
] as const;

export const FULL_CROP: CropRect = { x: 0, y: 0, w: 100, h: 100 };

export function uid(prefix = "el"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function defaultElements(): CertificateElement[] {
  return [
    {
      id: "el-logo",
      type: "logo",
      x: 42,
      y: 6,
      w: 16,
      h: 8,
      visible: true,
      shape: "rect",
      crop: FULL_CROP,
    },
    {
      id: "el-title",
      type: "title",
      x: 18,
      y: 12,
      w: 64,
      h: 8,
      visible: true,
    },
    {
      id: "el-subtitle",
      type: "subtitle",
      x: 20,
      y: 19,
      w: 60,
      h: 4,
      visible: true,
    },
    {
      id: "el-label",
      type: "label",
      x: 18,
      y: 28,
      w: 64,
      h: 4,
      visible: true,
    },
    {
      id: "el-name",
      type: "name",
      x: 12,
      y: 33,
      w: 76,
      h: 12,
      visible: true,
    },
    {
      id: "el-divider",
      type: "divider",
      x: 30,
      y: 46,
      w: 40,
      h: 2,
      visible: true,
    },
    {
      id: "el-description",
      type: "description",
      x: 18,
      y: 50,
      w: 64,
      h: 12,
      visible: true,
    },
    {
      id: "el-number",
      type: "number",
      x: 30,
      y: 62,
      w: 40,
      h: 3,
      visible: true,
    },
    {
      id: "el-left",
      type: "leftSigner",
      x: 10,
      y: 78,
      w: 24,
      h: 10,
      visible: true,
    },
    {
      id: "el-seal",
      type: "seal",
      x: 42,
      y: 72,
      w: 16,
      h: 22,
      visible: true,
      shape: "circle",
      crop: FULL_CROP,
    },
    {
      id: "el-right",
      type: "rightSigner",
      x: 66,
      y: 78,
      w: 24,
      h: 10,
      visible: true,
    },
  ];
}

export function defaultCertificateDesign(
  partial?: Partial<CertificateDesign>
): CertificateDesign {
  const today = new Date().toISOString().slice(0, 10);
  const base: CertificateDesign = {
    studentId: null,
    studentName: "",
    course: "",
    certificateNumber: "",
    issuedAt: today,
    schoolName: "Vellum LMS",
    batch: "",
    heading: "CERTIFICATE",
    subtitle: "OF PARTICIPATION",
    presentedLabel: "THIS CERTIFICATE IS PRESENTED TO",
    description: "",
    leftSigner: "MICHAEL HENSON",
    leftTitle: "Art Director",
    rightSigner: "LUCY HARDING",
    rightTitle: "Academy Head",
    fonts: {
      title: "Montserrat",
      subtitle: "Montserrat",
      label: "Montserrat",
      name: "Great Vibes",
      body: "Montserrat",
      signer: "Montserrat",
    },
    colors: {
      navy: "#0b1f4a",
      gold: "#c9a227",
      background: "#ffffff",
      name: "#c9a227",
    },
    sizes: {
      title: 42,
      subtitle: 16,
      name: 54,
      body: 13,
      label: 11,
      signer: 12,
    },
    canvas: {
      preset: "a4-landscape",
      widthMm: 297,
      heightMm: 210,
    },
    layout: {
      showCorners: true,
      showFrame: true,
      showFiligree: true,
      showSeal: true,
      showLogo: true,
      showNumber: true,
      showDivider: true,
      frameInset: 5.5,
      contentPadX: 10,
      contentPadTop: 9,
    },
    images: {
      logo: null,
      seal: null,
      background: null,
      cornerTopLeft: null,
      cornerBottomRight: null,
    },
    elements: defaultElements(),
    customFonts: [],
  };

  return {
    ...base,
    ...partial,
    fonts: { ...base.fonts, ...partial?.fonts },
    colors: { ...base.colors, ...partial?.colors },
    sizes: { ...base.sizes, ...partial?.sizes },
    canvas: { ...base.canvas, ...partial?.canvas },
    layout: { ...base.layout, ...partial?.layout },
    images: { ...base.images, ...partial?.images },
    elements: partial?.elements?.length ? partial.elements : base.elements,
    customFonts: partial?.customFonts ?? base.customFonts,
  };
}

/** Style-only template (student fields cleared for bulk reuse) */
export function toFinalTemplate(design: CertificateDesign): CertificateDesign {
  return defaultCertificateDesign({
    ...design,
    studentId: null,
    studentName: "",
    course: "",
    certificateNumber: "",
    batch: "",
    issuedAt: new Date().toISOString().slice(0, 10),
  });
}

/** Merge saved style template with one student's data */
export function applyTemplateToStudent(
  template: CertificateDesign,
  data: {
    studentId: string;
    studentName: string;
    course: string;
    batch?: string;
    certificateNumber?: string;
    issuedAt?: string;
  }
): CertificateDesign {
  return defaultCertificateDesign({
    ...template,
    studentId: data.studentId,
    studentName: data.studentName,
    course: data.course,
    batch: data.batch || "",
    certificateNumber:
      data.certificateNumber ||
      `CERT-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 900) + 100
      )}`,
    issuedAt: data.issuedAt || new Date().toISOString().slice(0, 10),
  });
}

export function loadGoogleFont(family: string) {
  if (typeof document === "undefined") return;
  const id = `cert-gf-${family.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap`;
  document.head.appendChild(link);
}

export async function importLocalFont(file: File): Promise<string> {
  const family = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  const base64 = btoa(binary);
  const ext = file.name.split(".").pop()?.toLowerCase() || "ttf";
  const format =
    ext === "woff2"
      ? "woff2"
      : ext === "woff"
        ? "woff"
        : ext === "otf"
          ? "opentype"
          : "truetype";
  const mime =
    ext === "woff2"
      ? "font/woff2"
      : ext === "woff"
        ? "font/woff"
        : ext === "otf"
          ? "font/otf"
          : "font/ttf";

  const styleId = `cert-custom-font-${family.replace(/\s+/g, "-").toLowerCase()}`;
  let style = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = styleId;
    document.head.appendChild(style);
  }
  style.textContent = `
    @font-face {
      font-family: "${family}";
      src: url(data:${mime};base64,${base64}) format("${format}");
      font-display: swap;
    }
  `;
  return family;
}

export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function shapeRadius(shape: ElementShape | undefined): string {
  if (shape === "circle" || shape === "oval") return "9999px";
  if (shape === "rounded") return "12px";
  return "0";
}

/** Apply crop region to an image and return a new data URL */
export function cropImageToDataUrl(
  src: string,
  crop: CropRect
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const sx = (crop.x / 100) * img.naturalWidth;
      const sy = (crop.y / 100) * img.naturalHeight;
      const sw = (crop.w / 100) * img.naturalWidth;
      const sh = (crop.h / 100) * img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sw));
      canvas.height = Math.max(1, Math.round(sh));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No canvas"));
        return;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}
