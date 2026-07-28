<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdmissionResource;
use App\Http\Resources\StudentResource;
use App\Models\Admission;
use App\Models\Batch;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdmissionController extends Controller
{
    private const RELATIONS = ['history'];

    public function index(Request $request): JsonResponse
    {
        $query = Admission::query()->with(self::RELATIONS)->latest('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($course = $request->query('course')) {
            $query->where('course', $course);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                    ->orWhere('last_name', 'ilike', "%{$search}%")
                    ->orWhere('application_code', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        return AdmissionResource::collection($query->get())->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'firstName' => ['required', 'string', 'max:255'],
            'lastName' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'phone' => ['required', 'string', 'max:50'],
            'dateOfBirth' => ['required', 'date'],
            'gender' => ['required', 'in:male,female,other'],
            'address' => ['required', 'string'],
            'city' => ['required', 'string', 'max:255'],
            'course' => ['required', 'string', 'max:255'],
            'preferredBatch' => ['nullable', 'string', 'max:255'],
            'source' => ['required', 'in:website,walk-in,referral,social,phone'],
            'leadNotes' => ['nullable', 'string'],
        ]);

        $admission = Admission::create([
            'application_code' => $this->generateApplicationCode(),
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'date_of_birth' => $data['dateOfBirth'],
            'gender' => $data['gender'],
            'address' => $data['address'],
            'city' => $data['city'],
            'course' => $data['course'],
            'preferred_batch' => $data['preferredBatch'] ?? null,
            'status' => 'lead',
            'source' => $data['source'],
            'lead_notes' => $data['leadNotes'] ?? '',
        ]);

        $admission->logHistory('Application submitted', 'New admission application created');

        return (new AdmissionResource($admission->load(self::RELATIONS)))->response()->setStatusCode(201);
    }

    public function show(Admission $admission): JsonResponse
    {
        return (new AdmissionResource($admission->load(self::RELATIONS)))->response();
    }

    public function update(Request $request, Admission $admission): JsonResponse
    {
        $data = $request->validate([
            'firstName' => ['sometimes', 'string', 'max:255'],
            'lastName' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email'],
            'phone' => ['sometimes', 'string', 'max:50'],
            'dateOfBirth' => ['sometimes', 'date'],
            'gender' => ['sometimes', 'in:male,female,other'],
            'address' => ['sometimes', 'string'],
            'city' => ['sometimes', 'string', 'max:255'],
            'course' => ['sometimes', 'string', 'max:255'],
            'preferredBatch' => ['sometimes', 'nullable', 'string', 'max:255'],
            'source' => ['sometimes', 'in:website,walk-in,referral,social,phone'],
            'leadNotes' => ['sometimes', 'nullable', 'string'],
            'nextFollowUp' => ['sometimes', 'nullable', 'date'],
        ]);

        $map = [
            'firstName' => 'first_name',
            'lastName' => 'last_name',
            'email' => 'email',
            'phone' => 'phone',
            'dateOfBirth' => 'date_of_birth',
            'gender' => 'gender',
            'address' => 'address',
            'city' => 'city',
            'course' => 'course',
            'preferredBatch' => 'preferred_batch',
            'source' => 'source',
            'leadNotes' => 'lead_notes',
            'nextFollowUp' => 'next_follow_up',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $admission->update($payload);

        return (new AdmissionResource($admission->fresh()->load(self::RELATIONS)))->response();
    }

    public function approve(Admission $admission): JsonResponse
    {
        $admission->update(['status' => 'approved']);
        $admission->logHistory('Application approved', 'Admission approved for enrollment');

        return (new AdmissionResource($admission->fresh()->load(self::RELATIONS)))->response();
    }

    public function reject(Request $request, Admission $admission): JsonResponse
    {
        $data = $request->validate([
            'rejectionReason' => ['required', 'string'],
        ]);

        $admission->update([
            'status' => 'rejected',
            'rejection_reason' => $data['rejectionReason'],
        ]);
        $admission->logHistory('Application rejected', $data['rejectionReason']);

        return (new AdmissionResource($admission->fresh()->load(self::RELATIONS)))->response();
    }

    public function assignBatch(Request $request, Admission $admission): JsonResponse
    {
        $data = $request->validate([
            'batchId' => ['required', 'uuid', 'exists:batches,id'],
        ]);

        $batch = Batch::findOrFail($data['batchId']);

        $admission->update([
            'assigned_batch' => $batch->name,
            'assigned_batch_id' => $batch->id,
        ]);
        $admission->logHistory('Batch assigned', "Assigned to {$batch->name}");

        return (new AdmissionResource($admission->fresh()->load(self::RELATIONS)))->response();
    }

    public function waitingList(Request $request, Admission $admission): JsonResponse
    {
        $data = $request->validate([
            'waitingPosition' => ['sometimes', 'integer', 'min:1'],
        ]);

        $position = $data['waitingPosition']
            ?? (Admission::query()->where('status', 'waiting')->where('course', $admission->course)->count() + 1);

        $admission->update([
            'status' => 'waiting',
            'waiting_position' => $position,
        ]);
        $admission->logHistory('Moved to waiting list', "Waiting position #{$position}");

        return (new AdmissionResource($admission->fresh()->load(self::RELATIONS)))->response();
    }

    public function enroll(Admission $admission): JsonResponse
    {
        $student = DB::transaction(function () use ($admission) {
            $student = Student::create([
                'student_code' => $this->generateStudentCode(),
                'first_name' => $admission->first_name,
                'last_name' => $admission->last_name,
                'email' => $admission->email,
                'phone' => $admission->phone,
                'date_of_birth' => $admission->date_of_birth,
                'gender' => $admission->gender,
                'address' => $admission->address,
                'city' => $admission->city,
                'course' => $admission->course,
                'batch' => $admission->assigned_batch ?? $admission->preferred_batch ?? '',
                'status' => 'active',
                'enrolled_at' => now()->toDateString(),
            ]);

            $student->logHistory('registration', 'Student registered', "Enrolled via admission {$admission->application_code}");

            if ($admission->assigned_batch_id) {
                $batch = Batch::find($admission->assigned_batch_id);
                if ($batch) {
                    $batch->students()->syncWithoutDetaching([$student->id => ['enrolled_at' => now()]]);
                    $student->logHistory('batch', 'Batch assigned', "Enrolled in {$batch->name}");
                }
            }

            $admission->update([
                'status' => 'enrolled',
                'student_id' => $student->id,
            ]);
            $admission->logHistory('Enrolled', "Converted to student {$student->student_code}");

            return $student;
        });

        return (new StudentResource($student->load(['emergencyContacts', 'documents', 'history'])))->response()->setStatusCode(201);
    }

    private function generateApplicationCode(): string
    {
        $year = now()->format('Y');
        $sequence = Admission::query()->whereYear('created_at', $year)->count() + 1;

        return sprintf('APP-%s-%03d', $year, $sequence);
    }

    private function generateStudentCode(): string
    {
        $year = now()->format('Y');
        $sequence = Student::query()->whereYear('created_at', $year)->count() + 1;

        return sprintf('VLM-%s-%03d', $year, $sequence);
    }
}
