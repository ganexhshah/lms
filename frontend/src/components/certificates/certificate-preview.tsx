"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type Ref,
} from "react";

import { cn } from "@/lib/utils";
import {
  shapeRadius,
  type CertificateDesign,
  type CertificateElement,
  type CertificateElementType,
  type ElementShape,
} from "@/components/certificates/certificate-design";

type DesignTextKey =
  | "heading"
  | "subtitle"
  | "presentedLabel"
  | "studentName"
  | "description"
  | "certificateNumber"
  | "leftSigner"
  | "leftTitle"
  | "rightSigner"
  | "rightTitle";

type CertificatePreviewProps = {
  design: CertificateDesign;
  className?: string;
  previewRef?: Ref<HTMLDivElement>;
  interactive?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onElementChange?: (id: string, patch: Partial<CertificateElement>) => void;
  onDesignChange?: (patch: Partial<CertificateDesign>) => void;
};

const TEXT_TYPES: CertificateElementType[] = [
  "title",
  "subtitle",
  "label",
  "name",
  "description",
  "number",
  "leftSigner",
  "rightSigner",
];

function CornerWave({
  position,
  navy,
  gold,
}: {
  position: "top-left" | "bottom-right";
  navy: string;
  gold: string;
}) {
  const isTop = position === "top-left";
  return (
    <svg
      className={cn(
        "pointer-events-none absolute z-[1]",
        isTop ? "left-0 top-0 h-[48%] w-[44%]" : "bottom-0 right-0 h-[48%] w-[44%]"
      )}
      viewBox="0 0 420 320"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={`gold-wave-${position}`}
          x1="0%"
          y1="20%"
          x2="100%"
          y2="80%"
        >
          <stop offset="0%" stopColor="#f0d78c" />
          <stop offset="35%" stopColor={gold} />
          <stop offset="70%" stopColor="#b8860b" />
          <stop offset="100%" stopColor="#7a5a10" />
        </linearGradient>
      </defs>
      {isTop ? (
        <g>
          <path
            fill="#071833"
            d="M0 0 H300 C240 30 200 70 175 120 C145 185 95 235 0 285 Z"
          />
          <path
            fill={navy}
            d="M0 0 H245 C200 40 170 80 150 125 C125 185 80 230 0 270 Z"
          />
          <path
            fill={`url(#gold-wave-${position})`}
            d="M0 55 C95 40 155 75 175 130 C190 175 175 220 130 255 C90 285 40 300 0 305 V250 C45 240 80 215 95 180 C115 125 70 90 0 95 Z"
          />
          <path
            fill={navy}
            d="M0 105 C70 95 115 120 125 160 C135 200 100 235 50 265 C25 280 8 288 0 292 Z"
          />
        </g>
      ) : (
        <g>
          <path
            fill="#071833"
            d="M420 320 H120 C180 290 220 250 245 200 C275 135 325 85 420 35 Z"
          />
          <path
            fill={navy}
            d="M420 320 H175 C220 280 250 240 270 195 C295 135 340 90 420 50 Z"
          />
          <path
            fill={`url(#gold-wave-${position})`}
            d="M420 265 C325 280 265 245 245 190 C230 145 245 100 290 65 C330 35 380 20 420 15 V70 C375 80 340 105 325 140 C305 195 350 230 420 225 Z"
          />
          <path
            fill={navy}
            d="M420 215 C350 225 305 200 295 160 C285 120 320 85 370 55 C395 40 412 32 420 28 Z"
          />
        </g>
      )}
    </svg>
  );
}

function Filigree({
  position,
  gold,
}: {
  position: "top-right" | "bottom-left";
  gold: string;
}) {
  const isTop = position === "top-right";
  return (
    <svg
      className={cn(
        "pointer-events-none absolute z-[2] h-[15%] w-[17%] opacity-95",
        isTop ? "right-[6.5%] top-[5.5%]" : "bottom-[5.5%] left-[6.5%]"
      )}
      viewBox="0 0 140 110"
      fill="none"
      aria-hidden
      style={isTop ? undefined : { transform: "rotate(180deg)" }}
    >
      <g stroke={gold} strokeWidth="1.15" fill={gold}>
        <path d="M8 95 C25 78 48 58 72 48 C92 40 112 34 132 28" fill="none" />
        <path d="M72 48 C62 32 68 16 82 12 C96 8 108 18 104 30 C101 40 88 46 72 48 Z" />
        <path d="M104 30 C112 16 128 14 136 24 C144 34 138 46 126 48 C116 50 106 42 104 30 Z" />
        <circle cx="132" cy="28" r="2.4" />
      </g>
    </svg>
  );
}

function GoldSeal({ gold }: { gold: string }) {
  const light = "#e8d48b";
  const dark = "#8a6a14";
  return (
    <svg className="h-full w-full" viewBox="0 0 120 140" aria-hidden>
      <defs>
        <radialGradient id="seal-face" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f3e6b0" />
          <stop offset="40%" stopColor={gold} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <linearGradient id="ribbon" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={light} />
          <stop offset="50%" stopColor={gold} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <path fill="url(#ribbon)" d="M48 88 L38 132 L52 122 L58 95 Z" />
      <path fill="url(#ribbon)" d="M72 88 L82 132 L68 122 L62 95 Z" />
      <circle cx="60" cy="58" r="42" fill={dark} />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={60 + Math.cos(a) * 42}
            cy={58 + Math.sin(a) * 42}
            r="5.2"
            fill={gold}
          />
        );
      })}
      <circle cx="60" cy="58" r="36" fill="url(#seal-face)" />
      <circle cx="60" cy="58" r="7" fill={light} />
      <circle cx="60" cy="58" r="3.5" fill={dark} />
    </svg>
  );
}

function CroppedImage({
  src,
  shape,
  alt,
}: {
  src: string;
  shape?: ElementShape;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ""}
      draggable={false}
      className="h-full w-full object-cover"
      style={{ borderRadius: shapeRadius(shape) }}
    />
  );
}

function EditableText({
  value,
  editing,
  className,
  style,
  onChange,
  multiline,
}: {
  value: string;
  editing: boolean;
  className?: string;
  style?: React.CSSProperties;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing]);

  if (!editing) {
    return (
      <div className={className} style={style}>
        {value}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(className, "outline-none ring-1 ring-[#2563eb]/60 rounded-sm")}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={(e) => onChange(e.currentTarget.innerText.replace(/\n+/g, multiline ? "\n" : " ").trim())}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
        if (e.key === "Escape") {
          (e.target as HTMLElement).blur();
        }
      }}
    >
      {value}
    </div>
  );
}

function ElementContent({
  el,
  design,
  editing,
  onDesignChange,
}: {
  el: CertificateElement;
  design: CertificateDesign;
  editing: boolean;
  onDesignChange?: (patch: Partial<CertificateDesign>) => void;
}) {
  const { colors, fonts, sizes, images } = design;
  const ff = (name: string) => `"${name}", Georgia, serif`;

  const description =
    design.description?.trim() ||
    `For your valuable contribution and participation in the ${
      design.course || "course"
    }${design.batch ? ` (${design.batch})` : ""}. Presented with pride by the team at ${
      design.schoolName || "Vellum LMS"
    }.`;

  const setText = (key: DesignTextKey, value: string) => {
    onDesignChange?.({ [key]: value });
  };

  switch (el.type) {
    case "title":
      return (
        <EditableText
          editing={editing}
          value={design.heading || "CERTIFICATE"}
          onChange={(v) => setText("heading", v || "CERTIFICATE")}
          className="flex h-full items-center justify-center font-extrabold tracking-[0.08em] uppercase"
          style={{
            color: colors.navy,
            fontFamily: ff(fonts.title),
            fontSize: `clamp(${sizes.title * 0.4}px, ${sizes.title * 0.08}vw, ${sizes.title}px)`,
          }}
        />
      );
    case "subtitle":
      return (
        <EditableText
          editing={editing}
          value={(design.subtitle || "OF PARTICIPATION").toUpperCase()}
          onChange={(v) => setText("subtitle", v)}
          className="flex h-full items-center justify-center font-medium tracking-[0.28em]"
          style={{
            color: colors.navy,
            fontFamily: ff(fonts.subtitle),
            fontSize: `clamp(${sizes.subtitle * 0.5}px, ${sizes.subtitle * 0.085}vw, ${sizes.subtitle}px)`,
          }}
        />
      );
    case "label":
      return (
        <EditableText
          editing={editing}
          value={design.presentedLabel || "THIS CERTIFICATE IS PRESENTED TO"}
          onChange={(v) => setText("presentedLabel", v)}
          className="flex h-full items-center justify-center font-semibold tracking-[0.22em]"
          style={{
            color: colors.navy,
            fontFamily: ff(fonts.label),
            fontSize: `clamp(${sizes.label * 0.5}px, ${sizes.label * 0.09}vw, ${sizes.label}px)`,
          }}
        />
      );
    case "name":
      return (
        <EditableText
          editing={editing}
          value={design.studentName || "Student Name"}
          onChange={(v) => setText("studentName", v)}
          className="flex h-full items-center justify-center leading-none"
          style={{
            color: colors.name,
            fontFamily: ff(fonts.name),
            fontSize: `clamp(${sizes.name * 0.35}px, ${sizes.name * 0.085}vw, ${sizes.name}px)`,
          }}
        />
      );
    case "divider":
      return (
        <div className="flex h-full w-full items-center gap-2 px-1">
          <div className="h-px flex-1" style={{ background: colors.gold }} />
          <div
            className="size-1.5 rotate-45 shrink-0 sm:size-2"
            style={{ background: colors.gold }}
          />
          <div className="h-px flex-1" style={{ background: colors.gold }} />
        </div>
      );
    case "description":
      return (
        <EditableText
          editing={editing}
          multiline
          value={description}
          onChange={(v) => setText("description", v)}
          className="flex h-full items-start justify-center text-center leading-relaxed font-medium"
          style={{
            color: colors.navy,
            fontFamily: ff(fonts.body),
            fontSize: `clamp(${sizes.body * 0.5}px, ${sizes.body * 0.085}vw, ${sizes.body}px)`,
          }}
        />
      );
    case "number":
      return (
        <EditableText
          editing={editing}
          value={
            design.certificateNumber
              ? `No. ${design.certificateNumber}`
              : "No. CERT-XXXX"
          }
          onChange={(v) =>
            setText(
              "certificateNumber",
              v.replace(/^No\.\s*/i, "").trim()
            )
          }
          className="flex h-full items-center justify-center tracking-wider opacity-70"
          style={{
            color: colors.navy,
            fontFamily: ff(fonts.body),
            fontSize: `clamp(8px, 0.9vw, 11px)`,
          }}
        />
      );
    case "leftSigner":
      return (
        <div className="flex h-full flex-col justify-end text-left">
          <EditableText
            editing={editing}
            value={design.leftSigner || "MICHAEL HENSON"}
            onChange={(v) => setText("leftSigner", v)}
            className="font-bold tracking-wide uppercase"
            style={{
              color: colors.navy,
              fontFamily: ff(fonts.signer),
              fontSize: `clamp(${sizes.signer * 0.5}px, ${sizes.signer * 0.085}vw, ${sizes.signer}px)`,
            }}
          />
          <EditableText
            editing={editing}
            value={design.leftTitle || "Art Director"}
            onChange={(v) => setText("leftTitle", v)}
            className="mt-0.5 font-medium"
            style={{
              color: colors.navy,
              fontFamily: ff(fonts.signer),
              fontSize: `clamp(${sizes.signer * 0.4}px, ${sizes.signer * 0.075}vw, ${sizes.signer * 0.9}px)`,
            }}
          />
        </div>
      );
    case "rightSigner":
      return (
        <div className="flex h-full flex-col justify-end text-right">
          <EditableText
            editing={editing}
            value={design.rightSigner || "LUCY HARDING"}
            onChange={(v) => setText("rightSigner", v)}
            className="font-bold tracking-wide uppercase"
            style={{
              color: colors.navy,
              fontFamily: ff(fonts.signer),
              fontSize: `clamp(${sizes.signer * 0.5}px, ${sizes.signer * 0.085}vw, ${sizes.signer}px)`,
            }}
          />
          <EditableText
            editing={editing}
            value={design.rightTitle || "Academy Head"}
            onChange={(v) => setText("rightTitle", v)}
            className="mt-0.5 font-medium"
            style={{
              color: colors.navy,
              fontFamily: ff(fonts.signer),
              fontSize: `clamp(${sizes.signer * 0.4}px, ${sizes.signer * 0.075}vw, ${sizes.signer * 0.9}px)`,
            }}
          />
        </div>
      );
    case "seal": {
      const src = el.src || images.seal;
      if (src) {
        return <CroppedImage src={src} shape={el.shape || "circle"} alt="Seal" />;
      }
      return <GoldSeal gold={colors.gold} />;
    }
    case "logo": {
      const src = el.src || images.logo;
      if (!src) {
        return (
          <div className="text-muted-foreground flex h-full items-center justify-center text-[10px] opacity-50">
            Logo
          </div>
        );
      }
      return <CroppedImage src={src} shape={el.shape || "rect"} alt="Logo" />;
    }
    case "image":
      if (!el.src) {
        return (
          <div className="flex h-full items-center justify-center border border-dashed border-black/20 text-[10px] opacity-60">
            Image
          </div>
        );
      }
      return (
        <CroppedImage
          src={el.src}
          shape={el.shape || "rect"}
          alt={el.label || "Image"}
        />
      );
    default:
      return null;
  }
}

function snap(value: number, targets: number[], threshold = 1.2) {
  for (const t of targets) {
    if (Math.abs(value - t) <= threshold) return t;
  }
  return value;
}

export function CertificatePreview({
  design,
  className,
  previewRef,
  interactive = false,
  selectedId = null,
  onSelect,
  onElementChange,
  onDesignChange,
}: CertificatePreviewProps) {
  const { colors, layout, images, elements, canvas } = design;
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [guides, setGuides] = useState<{
    v: number[];
    h: number[];
    x: number;
    y: number;
  } | null>(null);
  const dragRef = useRef<{
    id: string;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    origin: CertificateElement;
  } | null>(null);

  const aspect =
    canvas?.widthMm && canvas?.heightMm
      ? canvas.widthMm / canvas.heightMm
      : 1.414;

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      canvasRef.current = node;
      if (typeof previewRef === "function") previewRef(node);
      else if (previewRef) {
        (previewRef as { current: HTMLDivElement | null }).current = node;
      }
    },
    [previewRef]
  );

  function startDrag(
    e: PointerEvent<HTMLDivElement>,
    el: CertificateElement,
    mode: "move" | "resize"
  ) {
    if (!interactive || editingId) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(el.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      id: el.id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origin: { ...el },
    };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!interactive || !dragRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    const o = dragRef.current.origin;

    if (dragRef.current.mode === "move") {
      let x = Math.min(100 - o.w, Math.max(0, o.x + dx));
      let y = Math.min(100 - o.h, Math.max(0, o.y + dy));

      const centerX = x + o.w / 2;
      const centerY = y + o.h / 2;
      const snapXs = [50];
      const snapYs = [50];
      elements.forEach((other) => {
        if (other.id === o.id || !other.visible) return;
        snapXs.push(other.x, other.x + other.w / 2, other.x + other.w);
        snapYs.push(other.y, other.y + other.h / 2, other.y + other.h);
      });

      const snappedCX = snap(centerX, snapXs);
      const snappedCY = snap(centerY, snapYs);
      x = Math.min(100 - o.w, Math.max(0, snappedCX - o.w / 2));
      y = Math.min(100 - o.h, Math.max(0, snappedCY - o.h / 2));

      const vGuides = [50];
      const hGuides = [50];
      if (Math.abs(x + o.w / 2 - 50) < 1.5) vGuides.push(50);
      if (Math.abs(y + o.h / 2 - 50) < 1.5) hGuides.push(50);
      elements.forEach((other) => {
        if (other.id === o.id || !other.visible) return;
        const ocx = other.x + other.w / 2;
        const ocy = other.y + other.h / 2;
        if (Math.abs(x + o.w / 2 - ocx) < 1.5) vGuides.push(ocx);
        if (Math.abs(y + o.h / 2 - ocy) < 1.5) hGuides.push(ocy);
        if (Math.abs(x - other.x) < 1.5) vGuides.push(other.x);
        if (Math.abs(y - other.y) < 1.5) hGuides.push(other.y);
      });

      setGuides({
        v: [...new Set(vGuides)],
        h: [...new Set(hGuides)],
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
      });
      onElementChange?.(dragRef.current.id, { x, y });
      return;
    }

    const w = Math.min(100 - o.x, Math.max(4, o.w + dx));
    const h = Math.min(100 - o.y, Math.max(3, o.h + dy));
    setGuides({
      v: [o.x + w],
      h: [o.y + h],
      x: Math.round(o.x * 10) / 10,
      y: Math.round(o.y * 10) / 10,
    });
    onElementChange?.(dragRef.current.id, { w, h });
  }

  function endDrag() {
    dragRef.current = null;
    setGuides(null);
  }

  return (
    <div
      ref={setRefs}
      className={cn(
        "relative w-full overflow-hidden shadow-sm ring-1 ring-black/10",
        className
      )}
      style={{
        backgroundColor: colors.background,
        color: colors.navy,
        aspectRatio: `${aspect}`,
      }}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={() => {
        if (interactive) {
          onSelect?.(null);
          setEditingId(null);
        }
      }}
    >
      {images.background ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={images.background}
          alt=""
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        />
      ) : null}

      {layout.showCorners ? (
        images.cornerTopLeft ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images.cornerTopLeft}
            alt=""
            className="pointer-events-none absolute left-0 top-0 z-[1] h-[48%] w-[44%] object-contain object-left-top"
          />
        ) : (
          <CornerWave position="top-left" navy={colors.navy} gold={colors.gold} />
        )
      ) : null}

      {layout.showCorners ? (
        images.cornerBottomRight ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images.cornerBottomRight}
            alt=""
            className="pointer-events-none absolute bottom-0 right-0 z-[1] h-[48%] w-[44%] object-contain object-right-bottom"
          />
        ) : (
          <CornerWave
            position="bottom-right"
            navy={colors.navy}
            gold={colors.gold}
          />
        )
      ) : null}

      {layout.showFrame ? (
        <div
          className="pointer-events-none absolute z-[2] border-[1.5px]"
          style={{
            borderColor: colors.gold,
            inset: `${layout.frameInset}%`,
          }}
        />
      ) : null}

      {layout.showFiligree ? (
        <>
          <Filigree position="top-right" gold={colors.gold} />
          <Filigree position="bottom-left" gold={colors.gold} />
        </>
      ) : null}

      {/* Alignment guides */}
      {interactive && guides
        ? guides.v.map((x) => (
            <div
              key={`v-${x}`}
              className="pointer-events-none absolute top-0 bottom-0 z-[20] w-px bg-[#ec4899]"
              style={{ left: `${x}%` }}
            />
          ))
        : null}
      {interactive && guides
        ? guides.h.map((y) => (
            <div
              key={`h-${y}`}
              className="pointer-events-none absolute left-0 right-0 z-[20] h-px bg-[#ec4899]"
              style={{ top: `${y}%` }}
            />
          ))
        : null}
      {interactive && guides ? (
        <div className="pointer-events-none absolute top-2 left-2 z-[21] rounded bg-black/70 px-2 py-1 font-mono text-[10px] text-white">
          X {guides.x}% · Y {guides.y}%
        </div>
      ) : null}

      {/* Always-on center axis (subtle) when interactive */}
      {interactive && !guides ? (
        <>
          <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 z-[2] w-px -translate-x-1/2 bg-[#94a3b8]/25" />
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-[2] h-px -translate-y-1/2 bg-[#94a3b8]/25" />
        </>
      ) : null}

      {elements
        .filter((el) => el.visible)
        .filter((el) => {
          if (el.type === "seal" && !layout.showSeal && !el.src) return false;
          if (el.type === "logo" && !layout.showLogo && !el.src && !images.logo)
            return false;
          if (el.type === "divider" && !layout.showDivider) return false;
          if (el.type === "number" && !layout.showNumber) return false;
          return true;
        })
        .map((el) => {
          const selected = interactive && selectedId === el.id;
          const editing =
            interactive && editingId === el.id && TEXT_TYPES.includes(el.type);
          return (
            <div
              key={el.id}
              className={cn(
                "absolute z-[3]",
                interactive && !editing && "cursor-move",
                selected &&
                  "ring-2 ring-[#2563eb] ring-offset-1 ring-offset-transparent"
              )}
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.w}%`,
                height: `${el.h}%`,
                borderRadius:
                  el.type === "image" || el.type === "logo" || el.type === "seal"
                    ? shapeRadius(el.shape)
                    : undefined,
                overflow:
                  el.type === "image" || el.type === "logo" || el.type === "seal"
                    ? "hidden"
                    : undefined,
              }}
              onClick={(e) => {
                if (!interactive) return;
                e.stopPropagation();
                onSelect?.(el.id);
              }}
              onDoubleClick={(e) => {
                if (!interactive || !TEXT_TYPES.includes(el.type)) return;
                e.stopPropagation();
                onSelect?.(el.id);
                setEditingId(el.id);
              }}
              onPointerDown={(e) => {
                if (editing) return;
                startDrag(e, el, "move");
              }}
            >
              <ElementContent
                el={el}
                design={design}
                editing={!!editing}
                onDesignChange={onDesignChange}
              />
              {selected && !editing ? (
                <>
                  <div className="pointer-events-none absolute -top-5 left-0 rounded bg-[#2563eb] px-1.5 py-0.5 font-mono text-[9px] text-white">
                    X {Math.round(el.x)}% · Y {Math.round(el.y)}%
                  </div>
                  <div
                    className="absolute right-0 bottom-0 z-10 size-3 translate-x-1/2 translate-y-1/2 cursor-se-resize rounded-sm bg-[#2563eb] ring-2 ring-white"
                    onPointerDown={(e) => startDrag(e, el, "resize")}
                  />
                </>
              ) : null}
              {selected && editing ? (
                <div className="pointer-events-none absolute -top-5 left-0 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] text-white">
                  Editing text — click outside to save
                </div>
              ) : null}
            </div>
          );
        })}
    </div>
  );
}
