"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Wallet } from "lucide-react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchField } from "@/components/shared/search-field";
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
import { useOpsStore } from "@/store/ops-store";
import { useStudentsStore } from "@/store/students-store";
import { studentFullName } from "@/types/student";

const STATUS_TONE: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  paid: "default",
  partial: "secondary",
  overdue: "destructive",
  refunded: "outline",
};

export default function PaymentsPage() {
  const router = useRouter();
  const payments = useOpsStore((s) => s.payments);
  const createInvoice = useOpsStore((s) => s.createInvoice);
  const students = useStudentsStore((s) => s.students);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [discount, setDiscount] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) =>
      `${p.number} ${p.student} ${p.course}`.toLowerCase().includes(q)
    );
  }, [payments, query]);

  const due = payments.filter((p) => p.status === "overdue" || p.status === "partial").length;
  const selectedStudent = students.find((s) => s.id === studentId) ?? null;

  function resetForm() {
    setStudentId(null);
    setAmount(0);
    setDueDate("");
    setDiscount(0);
  }

  async function create() {
    if (!selectedStudent) {
      toast.error("Select a student");
      return;
    }
    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    if (!dueDate) {
      toast.error("Due date is required");
      return;
    }
    try {
      const invoice = await createInvoice({
        studentId: selectedStudent.id,
        student: studentFullName(selectedStudent),
        course: selectedStudent.course,
        amount,
        dueDate,
        discount,
      });
      toast.success("Invoice created");
      setOpen(false);
      resetForm();
      router.push(`/dashboard/payments/${invoice.id}`);
    } catch {
      toast.error("Could not create invoice");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Invoices, installments, discounts, receipts, reminders, refunds."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus />
            New invoice
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Invoices" value={String(payments.length)} />
        <Stat label="Needs attention" value={String(due)} />
        <Stat
          label="Collected"
          value={`Rs ${payments.reduce((s, p) => s + p.paid, 0).toLocaleString()}`}
        />
      </div>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Invoices</CardTitle>
          <SearchField value={query} onChange={setQuery} className="max-w-xs" placeholder="Search…" />
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <EmptyState icon={Wallet} title="No invoices" description="Create an invoice to get started." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/payments/${p.id}`)}>
                    <TableCell className="font-mono text-xs">{p.number}</TableCell>
                    <TableCell>
                      <p className="font-medium">{p.student}</p>
                      <p className="text-xs text-muted-foreground">{p.course}</p>
                    </TableCell>
                    <TableCell>Rs {p.amount.toLocaleString()}</TableCell>
                    <TableCell>Rs {p.paid.toLocaleString()}</TableCell>
                    <TableCell><SoftBadge tone={STATUS_TONE[p.status] ?? "secondary"}>{p.status}</SoftBadge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New invoice</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Student</Label>
              <StudentPicker value={studentId} onChange={setStudentId} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Course</Label>
              <Input value={selectedStudent?.course ?? ""} disabled placeholder="Select a student first" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Amount (Rs)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Discount (Rs)</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Due date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create}>Create invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="shadow-none">
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
