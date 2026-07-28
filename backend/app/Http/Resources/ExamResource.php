<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'course' => $this->course,
            'batch' => $this->batch,
            'batchId' => $this->batch_id,
            'type' => $this->type,
            'date' => optional($this->date)->toDateString(),
            'passMark' => $this->pass_mark,
            'status' => $this->status,
            'grades' => ExamGradeResource::collection($this->whenLoaded('grades')),
        ];
    }
}
