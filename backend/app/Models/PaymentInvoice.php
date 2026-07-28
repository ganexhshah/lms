<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentInvoice extends Model
{
    use HasUuids;

    protected $fillable = [
        'number',
        'student',
        'student_id',
        'course',
        'amount',
        'paid',
        'due_date',
        'status',
        'discount',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'amount' => 'integer',
            'paid' => 'integer',
            'discount' => 'integer',
        ];
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(PaymentReminder::class, 'invoice_id')->orderByDesc('sent_at');
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(PaymentReceipt::class, 'invoice_id')->orderByDesc('downloaded_at');
    }
}
