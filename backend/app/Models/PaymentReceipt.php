<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentReceipt extends Model
{
    use HasUuids;

    protected $fillable = [
        'invoice_id',
        'downloaded_at',
        'amount',
    ];

    protected function casts(): array
    {
        return [
            'downloaded_at' => 'datetime',
            'amount' => 'integer',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(PaymentInvoice::class, 'invoice_id');
    }
}
