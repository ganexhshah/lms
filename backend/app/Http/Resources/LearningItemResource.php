<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LearningItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'type' => $this->type,
            'course' => $this->course,
            'progress' => $this->progress,
            'status' => $this->status,
            'url' => $this->url ?? '',
            'description' => $this->description ?? '',
        ];
    }
}
