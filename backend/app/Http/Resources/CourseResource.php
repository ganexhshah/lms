<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'description' => $this->description,
            'durationWeeks' => $this->duration_weeks,
            'durationHours' => $this->duration_hours,
            'level' => $this->level,
            'status' => $this->status,
            'fee' => $this->fee,
            'installments' => $this->installments,
            'discountNotes' => $this->discount_notes,
            'syllabus' => $this->syllabus ?? [],
            'trainers' => $this->trainers ?? [],
            'materials' => $this->materials ?? [],
            'createdAt' => optional($this->created_at)->toIso8601String(),
            'updatedAt' => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
