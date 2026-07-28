"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCoursesStore } from "@/store/courses-store";
import type { Course } from "@/types/course";

type FeesTabProps = {
  course: Course;
};

export function FeesTab({ course }: FeesTabProps) {
  const setFees = useCoursesStore((s) => s.setFees);
  const [fee, setFee] = useState(course.fee);
  const [installments, setInstallments] = useState(course.installments);
  const [discountNotes, setDiscountNotes] = useState(course.discountNotes);

  async function save() {
    if (fee < 0 || installments < 1) {
      toast.error("Enter a valid fee and installment count");
      return;
    }
    try {
      await setFees(course.id, { fee, installments, discountNotes });
      toast.success("Fees updated");
    } catch {
      toast.error("Could not update fees");
    }
  }

  const perInstallment =
    installments > 0 ? Math.round(fee / installments) : fee;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Base fee, installment plan, and discount notes.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Base fee (Rs)</Label>
          <Input
            type="number"
            min={0}
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Installments</Label>
          <Input
            type="number"
            min={1}
            max={12}
            value={installments}
            onChange={(e) => setInstallments(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Discount / notes</Label>
          <Textarea
            value={discountNotes}
            onChange={(e) => setDiscountNotes(e.target.value)}
            rows={3}
            placeholder="Early-bird, corporate package, scholarships…"
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Approx. per installment:{" "}
        <span className="font-medium text-foreground tabular-nums">
          Rs {perInstallment.toLocaleString()}
        </span>
      </p>
      <Button size="sm" onClick={save}>
        <Save />
        Save fees
      </Button>
    </div>
  );
}
