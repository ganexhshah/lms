<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryUsage extends Model
{
    use HasUuids;

    protected $fillable = [
        'item_id',
        'date',
        'qty',
        'batch',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'qty' => 'integer',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }
}
