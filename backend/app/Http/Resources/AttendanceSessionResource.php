<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceSessionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => optional($this->date)->toDateString(),
            'batch' => $this->batch,
            'batchId' => $this->batch_id,
            'course' => $this->course,
            'present' => $this->present,
            'absent' => $this->absent,
            'method' => $this->method,
            'records' => AttendanceRecordResource::collection($this->whenLoaded('records')),
            'notifiedAt' => optional($this->notified_at)?->toIso8601String(),
        ];
    }
}
