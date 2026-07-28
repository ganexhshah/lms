<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'category',
        'stock',
        'unit',
        'min_stock',
        'last_purchase',
    ];

    protected function casts(): array
    {
        return [
            'stock' => 'integer',
            'min_stock' => 'integer',
            'last_purchase' => 'date',
        ];
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(InventoryPurchase::class, 'item_id')->orderByDesc('date');
    }

    public function usage(): HasMany
    {
        return $this->hasMany(InventoryUsage::class, 'item_id')->orderByDesc('date');
    }
}
