<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentInvoiceResource;
use App\Http\Resources\PaymentReceiptResource;
use App\Http\Resources\PaymentReminderResource;
use App\Models\PaymentInvoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PaymentInvoice::query()
            ->with(['reminders', 'receipts'])
            ->latest('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($studentId = $request->query('student_id')) {
            $query->where('student_id', $studentId);
        }

        return PaymentInvoiceResource::collection($query->get())->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'number' => ['nullable', 'string', 'max:100', 'unique:payment_invoices,number'],
            'student' => ['required', 'string', 'max:255'],
            'studentId' => ['nullable', 'uuid', 'exists:students,id'],
            'course' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'integer', 'min:0'],
            'paid' => ['nullable', 'integer', 'min:0'],
            'dueDate' => ['required', 'date'],
            'status' => ['required', 'in:paid,partial,overdue,refunded'],
            'discount' => ['nullable', 'integer', 'min:0'],
        ]);

        $invoice = PaymentInvoice::create([
            'number' => $data['number'] ?? $this->generateInvoiceNumber(),
            'student' => $data['student'],
            'student_id' => $data['studentId'] ?? null,
            'course' => $data['course'],
            'amount' => $data['amount'],
            'paid' => $data['paid'] ?? 0,
            'due_date' => $data['dueDate'],
            'status' => $data['status'],
            'discount' => $data['discount'] ?? 0,
        ]);

        return (new PaymentInvoiceResource($invoice->load(['reminders', 'receipts'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(PaymentInvoice $invoice): JsonResponse
    {
        return (new PaymentInvoiceResource($invoice->load(['reminders', 'receipts'])))->response();
    }

    public function update(Request $request, PaymentInvoice $invoice): JsonResponse
    {
        $data = $request->validate([
            'number' => ['sometimes', 'string', 'max:100', 'unique:payment_invoices,number,'.$invoice->id],
            'student' => ['sometimes', 'string', 'max:255'],
            'studentId' => ['sometimes', 'nullable', 'uuid', 'exists:students,id'],
            'course' => ['sometimes', 'string', 'max:255'],
            'amount' => ['sometimes', 'integer', 'min:0'],
            'paid' => ['sometimes', 'integer', 'min:0'],
            'dueDate' => ['sometimes', 'date'],
            'status' => ['sometimes', 'in:paid,partial,overdue,refunded'],
            'discount' => ['sometimes', 'integer', 'min:0'],
        ]);

        $map = [
            'number' => 'number',
            'student' => 'student',
            'studentId' => 'student_id',
            'course' => 'course',
            'amount' => 'amount',
            'paid' => 'paid',
            'dueDate' => 'due_date',
            'status' => 'status',
            'discount' => 'discount',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $invoice->update($payload);

        return (new PaymentInvoiceResource($invoice->fresh()->load(['reminders', 'receipts'])))->response();
    }

    public function destroy(PaymentInvoice $invoice): JsonResponse
    {
        $invoice->delete();

        return response()->json(['data' => null]);
    }

    public function sendReminder(Request $request, PaymentInvoice $invoice): JsonResponse
    {
        $data = $request->validate([
            'channel' => ['required', 'in:sms,email,whatsapp'],
            'note' => ['nullable', 'string'],
        ]);

        $reminder = $invoice->reminders()->create([
            'sent_at' => now(),
            'channel' => $data['channel'],
            'note' => $data['note'] ?? '',
        ]);

        return (new PaymentReminderResource($reminder))->response()->setStatusCode(201);
    }

    public function logReceipt(Request $request, PaymentInvoice $invoice): JsonResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'integer', 'min:0'],
            'downloadedAt' => ['nullable', 'date'],
        ]);

        $receipt = $invoice->receipts()->create([
            'downloaded_at' => $data['downloadedAt'] ?? now(),
            'amount' => $data['amount'],
        ]);

        return (new PaymentReceiptResource($receipt))->response()->setStatusCode(201);
    }

    private function generateInvoiceNumber(): string
    {
        $sequence = PaymentInvoice::query()->count() + 1;

        return sprintf('INV-%s-%04d', now()->format('Ymd'), $sequence);
    }
}
