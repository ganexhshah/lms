<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone ?? '',
            'specialty' => $this->specialty ?? '',
            'status' => $this->status,
            'salary' => $this->salary,
            'rating' => (float) $this->rating,
            'schedule' => $this->schedule ?? '',
            'scheduleSlots' => TrainerScheduleSlotResource::collection($this->whenLoaded('scheduleSlots')),
            'salaryHistory' => TrainerSalaryEntryResource::collection($this->whenLoaded('salaryHistory')),
            'ratingHistory' => TrainerRatingEventResource::collection($this->whenLoaded('ratingHistory')),
        ];
    }
}
