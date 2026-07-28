<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'studentCode' => $this->student_code,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'dateOfBirth' => optional($this->date_of_birth)->toDateString(),
            'gender' => $this->gender,
            'address' => $this->address,
            'city' => $this->city,
            'course' => $this->course,
            'batch' => $this->batch,
            'status' => $this->status,
            'enrolledAt' => optional($this->enrolled_at)->toDateString(),
            'photoUrl' => $this->photo_url,
            'bloodGroup' => $this->blood_group,
            'nationality' => $this->nationality,
            'idCardIssued' => (bool) $this->id_card_issued,
            'idCardIssuedAt' => optional($this->id_card_issued_at)->toIso8601String(),
            'emergencyContacts' => EmergencyContactResource::collection($this->whenLoaded('emergencyContacts')),
            'documents' => StudentDocumentResource::collection($this->whenLoaded('documents')),
            'history' => HistoryEventResource::collection($this->whenLoaded('history')),
        ];
    }
}
