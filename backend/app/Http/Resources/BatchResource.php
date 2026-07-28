<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BatchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'course' => $this->course,
            'courseId' => $this->course_id,
            'shift' => $this->shift,
            'capacity' => $this->capacity,
            'enrolled' => $this->relationLoaded('students') ? $this->students->count() : $this->students()->count(),
            'startDate' => optional($this->start_date)->toDateString(),
            'endDate' => optional($this->end_date)->toDateString(),
            'progress' => $this->progress,
            'trainer' => $this->trainer,
            'trainerId' => $this->trainer_id,
            'room' => $this->room,
            'status' => $this->status,
            'studentIds' => $this->relationLoaded('students')
                ? $this->students->pluck('id')->values()
                : $this->students()->pluck('students.id')->values(),
            'transfers' => BatchTransferResource::collection($this->transfers),
        ];
    }
}
