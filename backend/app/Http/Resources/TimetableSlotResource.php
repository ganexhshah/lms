<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimetableSlotResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'day' => $this->day,
            'time' => $this->time,
            'course' => $this->course,
            'batch' => $this->batch,
            'batchId' => $this->batch_id,
            'trainer' => $this->trainer,
            'trainerId' => $this->trainer_id,
            'room' => $this->room,
        ];
    }
}
