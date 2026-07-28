<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentInvoiceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'student' => $this->student,
            'studentId' => $this->student_id,
            'course' => $this->course,
            'amount' => $this->amount,
            'paid' => $this->paid,
            'dueDate' => optional($this->due_date)->toDateString(),
            'status' => $this->status,
            'discount' => $this->discount,
            'reminders' => PaymentReminderResource::collection($this->whenLoaded('reminders')),
            'receipts' => PaymentReceiptResource::collection($this->whenLoaded('receipts')),
        ];
    }
}
