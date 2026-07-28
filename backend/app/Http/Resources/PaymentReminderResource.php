<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentReminderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sentAt' => optional($this->sent_at)->toIso8601String(),
            'channel' => $this->channel,
            'note' => $this->note ?? '',
        ];
    }
}
