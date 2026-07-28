<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'applicationCode' => $this->application_code,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'dateOfBirth' => optional($this->date_of_birth)->toDateString(),
            'gender' => $this->gender,
            'address' => $this->address,
            'city' => $this->city,
            'course' => $this->course,
            'preferredBatch' => $this->preferred_batch,
            'status' => $this->status,
            'source' => $this->source,
            'leadNotes' => $this->lead_notes,
            'nextFollowUp' => optional($this->next_follow_up)->toDateString(),
            'assignedBatch' => $this->assigned_batch,
            'waitingPosition' => $this->waiting_position,
            'rejectionReason' => $this->rejection_reason,
            'studentId' => $this->student_id,
            'createdAt' => optional($this->created_at)->toIso8601String(),
            'history' => AdmissionHistoryResource::collection($this->whenLoaded('history')),
        ];
    }
}
