"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Download, Send, User, Wallet } from "lucide-react";

import { SoftBadge } from "@/components/shared/soft-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { useOpsStore } from "@/store/ops-store";
import type { PaymentReminder } from "@/types/ops";

const STATUS_TONE: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  paid: "default",
  partial: "secondary",
  overdue: "destructive",
  refunded: "outline",
};

const REMINDER_CHANNELS: PaymentReminder["channel"][] = ["sms", "email", "whatsapp"];

export default function PaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const payments = useOpsStore((s) => s.payments);
  const recordPayment = useOpsStore((s) => s.recordPayment);
  const refundPayment = useOpsStore((s) => s.refundPayment);
  const updatePayment = useOpsStore((s) => s.updatePayment);
  const sendPaymentReminder = useOpsStore((s) => s.sendPaymentReminder);
  const logReceiptDownload = useOpsStore((s) => s.logReceiptDownload);
  const invoice = payments.find((p) => p.id === params.id);

  const [amount, setAmount] = useState(5000);
  const [discount, setDiscount] = useState(invoice?.discount ?? 0);

  if (!invoice) {
    return (
      <EmptyState
        icon={Wallet}
        title="Invoice not found"
        action={
          <Button size="sm" nativeButton={false} render={<Link href="/dashboard/payments" />}>
            <ArrowLeft /> Back
          </Button>
        }
      />
    );
  }

  const reminders = invoice.reminders ?? [];
  const receipts = invoice.receipts ?? [];
  const balance = Math.max(0, invoice.amount - invoice.paid);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button size="icon-sm" variant="outline" nativeButton={false} render={<Link href="/dashboard/payments" />}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{invoice.number}</h1>
          <p className="text-sm text-muted-foreground">{invoice.student} · {invoice.course}</p>
          <SoftBadge tone={STATUS_TONE[invoice.status] ?? "secondary"} className="mt-1.5">{invoice.status}</SoftBadge>
        </div>
      </div>
      <Card className="shadow-none">
        <Tabs defaultValue="invoice">
          <CardHeader className="border-b pb-0">
            <TabsList variant="line">
              <TabsTrigger value="invoice">Invoice</TabsTrigger>
              <TabsTrigger value="installments">Installments</TabsTrigger>
              <TabsTrigger value="discounts">Discounts</TabsTrigger>
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
              <TabsTrigger value="refunds">Refunds</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <TabsContent value="invoice" className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Student</p>
                  <p className="text-sm font-medium">{invoice.student}</p>
                </div>
                {invoice.studentId ? (
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/dashboard/students/${invoice.studentId}`} />}
                  >
                    <User /> View student
                  </Button>
                ) : null}
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <Item label="Amount" value={`Rs ${invoice.amount.toLocaleString()}`} />
                <Item label="Paid" value={`Rs ${invoice.paid.toLocaleString()}`} />
                <Item label="Due date" value={invoice.dueDate} />
                <Item label="Balance" value={`Rs ${balance.toLocaleString()}`} />
                <Item label="Discount" value={`Rs ${invoice.discount.toLocaleString()}`} />
              </div>
              {balance > 0 ? (
                <div className="space-y-3 rounded-lg border p-3">
                  <p className="text-sm font-medium">Record payment</p>
                  <div className="flex items-end gap-2">
                    <div className="max-w-xs flex-1 space-y-1.5">
                      <Label className="text-xs">Amount (Rs)</Label>
                      <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        recordPayment(invoice.id, amount);
                        toast.success("Payment recorded");
                      }}
                    >
                      Record payment
                    </Button>
                  </div>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="installments" className="space-y-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Remaining balance</p>
                <p className="text-2xl font-semibold tabular-nums">Rs {balance.toLocaleString()}</p>
              </div>
              {balance > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Suggested installment plans</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[2, 3, 4].map((count) => (
                      <div key={count} className="rounded-lg border p-3 text-sm">
                        <p className="text-xs text-muted-foreground">{count} installments</p>
                        <p className="font-semibold tabular-nums">
                          Rs {Math.ceil(balance / count).toLocaleString()} / mo
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Invoice is fully paid — no installments remaining.</p>
              )}
              <div className="space-y-1.5 max-w-xs">
                <Label className="text-xs">Record installment (Rs)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              </div>
              <Button size="sm" onClick={() => { recordPayment(invoice.id, amount); toast.success("Installment recorded"); }}>
                Record installment
              </Button>
            </TabsContent>

            <TabsContent value="discounts" className="space-y-3">
              <div className="space-y-1.5 max-w-xs">
                <Label className="text-xs">Discount (Rs)</Label>
                <Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
              </div>
              <Button size="sm" onClick={() => { updatePayment(invoice.id, { discount }); toast.success("Discount saved"); }}>
                Save discount
              </Button>
            </TabsContent>

            <TabsContent value="receipts" className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Paid so far: Rs {invoice.paid.toLocaleString()}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    logReceiptDownload(invoice.id);
                    toast.success("PDF downloaded (demo)");
                  }}
                >
                  <Download /> Download receipt
                </Button>
              </div>
              {receipts.length === 0 ? (
                <EmptyState icon={Download} title="No receipts yet" description="Download a receipt to log it here." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Downloaded</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.downloadedAt}</TableCell>
                        <TableCell>Rs {r.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="reminders" className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted-foreground mr-auto">Send a reminder via:</p>
                {REMINDER_CHANNELS.map((channel) => (
                  <Button
                    key={channel}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      sendPaymentReminder(invoice.id, channel);
                      toast.success(`Reminder sent via ${channel}`);
                    }}
                  >
                    <Send /> <span className="capitalize">{channel}</span>
                  </Button>
                ))}
              </div>
              {reminders.length === 0 ? (
                <EmptyState icon={Send} title="No reminders sent" description="Send a reminder to log it here." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sent</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reminders.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.sentAt}</TableCell>
                        <TableCell><SoftBadge tone="outline">{r.channel}</SoftBadge></TableCell>
                        <TableCell className="text-muted-foreground">{r.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="refunds" className="space-y-3">
              {invoice.status === "refunded" ? (
                <p className="text-sm text-muted-foreground">This invoice has already been refunded.</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Mark this invoice as refunded.</p>
                  <Button size="sm" variant="destructive" onClick={() => { refundPayment(invoice.id); toast.success("Refund processed"); }}>
                    Process refund
                  </Button>
                </>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
