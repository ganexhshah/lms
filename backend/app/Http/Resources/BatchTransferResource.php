<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BatchTransferResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'studentId' => $this->student_id,
            'studentName' => trim(($this->student?->first_name ?? '').' '.($this->student?->last_name ?? '')),
            'fromBatchId' => $this->from_batch_id,
            'toBatchId' => $this->to_batch_id,
            'toBatchName' => $this->toBatch?->name,
            'date' => optional($this->date)->toIso8601String(),
            'note' => $this->note,
        ];
    }
}
