<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'channel' => $this->channel,
            'title' => $this->title,
            'body' => $this->body,
            'sentAt' => optional($this->sent_at)->toIso8601String(),
            'audience' => $this->audience,
            'audienceId' => $this->audience_id,
            'audienceLabel' => $this->audience_label ?? '',
            'deliveryLog' => $this->delivery_log ?? [],
        ];
    }
}
