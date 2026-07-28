<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'stock' => $this->stock,
            'unit' => $this->unit,
            'minStock' => $this->min_stock,
            'lastPurchase' => optional($this->last_purchase)->toDateString() ?? '',
            'purchases' => InventoryPurchaseResource::collection($this->whenLoaded('purchases')),
            'usage' => InventoryUsageResource::collection($this->whenLoaded('usage')),
        ];
    }
}
