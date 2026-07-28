"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  cropImageToDataUrl,
  type CropRect,
  FULL_CROP,
} from "@/components/certificates/certificate-design";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ImageCropDialogProps = {
  open: boolean;
  src: string | null;
  initialCrop?: CropRect;
  onOpenChange: (open: boolean) => void;
  onApply: (croppedSrc: string, crop: CropRect) => void;
};

export function ImageCropDialog({
  open,
  src,
  initialCrop,
  onOpenChange,
  onApply,
}: ImageCropDialogProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState<CropRect>(initialCrop || FULL_CROP);
  const [busy, setBusy] = useState(false);
  const drag = useRef<{
    mode: "move" | "resize";
    startX: number;
    startY: number;
    origin: CropRect;
  } | null>(null);

  useEffect(() => {
    if (open) setCrop(initialCrop || FULL_CROP);
  }, [open, initialCrop, src]);

  function onPointerDown(
    e: React.PointerEvent,
    mode: "move" | "resize"
  ) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origin: { ...crop },
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const dx = ((e.clientX - drag.current.startX) / rect.width) * 100;
    const dy = ((e.clientY - drag.current.startY) / rect.height) * 100;
    const o = drag.current.origin;

    if (drag.current.mode === "move") {
      const x = Math.min(100 - o.w, Math.max(0, o.x + dx));
      const y = Math.min(100 - o.h, Math.max(0, o.y + dy));
      setCrop({ ...o, x, y });
      return;
    }

    const w = Math.min(100 - o.x, Math.max(8, o.w + dx));
    const h = Math.min(100 - o.y, Math.max(8, o.h + dy));
    setCrop({ ...o, w, h });
  }

  function onPointerUp() {
    drag.current = null;
  }

  async function apply() {
    if (!src) return;
    setBusy(true);
    try {
      const cropped = await cropImageToDataUrl(src, crop);
      onApply(cropped, crop);
      onOpenChange(false);
      toast.success("Image cropped");
    } catch {
      toast.error("Crop failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
          <DialogDescription>
            Drag the box to move. Drag the corner handle to resize. Apply to bake
            the crop.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={stageRef}
          className="relative mx-auto aspect-video w-full max-w-lg overflow-hidden rounded-md bg-black/80 select-none"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt="Crop source"
              className="h-full w-full object-contain opacity-80"
              draggable={false}
            />
          ) : null}

          <div
            className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
            style={{
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.w}%`,
              height: `${crop.h}%`,
            }}
            onPointerDown={(e) => onPointerDown(e, "move")}
          >
            <div
              className="absolute right-0 bottom-0 size-4 translate-x-1/2 translate-y-1/2 cursor-se-resize rounded-sm bg-white"
              onPointerDown={(e) => onPointerDown(e, "resize")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => setCrop(FULL_CROP)}
            disabled={busy}
          >
            Reset
          </Button>
          <Button onClick={apply} disabled={busy || !src}>
            Apply crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
