<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentDocumentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'sizeLabel' => $this->size_label,
            'url' => $this->url,
            'uploadedAt' => optional($this->uploaded_at)->toIso8601String(),
        ];
    }
}
