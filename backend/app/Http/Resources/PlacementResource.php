<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlacementResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student' => $this->student,
            'studentId' => $this->student_id,
            'employer' => $this->employer,
            'employerId' => $this->employer_id,
            'role' => $this->role,
            'interviewDate' => optional($this->interview_date)->toDateString() ?? '',
            'status' => $this->status,
            'cvName' => $this->cv_name,
        ];
    }
}
