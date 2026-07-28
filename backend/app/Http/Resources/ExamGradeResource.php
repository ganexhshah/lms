<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamGradeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'studentId' => $this->student_id,
            'studentName' => $this->student_name,
            'score' => (float) $this->score,
            'passed' => (bool) $this->passed,
            'comment' => $this->comment ?? '',
        ];
    }
}
