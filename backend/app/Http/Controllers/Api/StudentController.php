<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use App\Models\EmergencyContact;
use App\Models\Student;
use App\Models\StudentDocument;
use App\Services\CdnStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    private const RELATIONS = ['emergencyContacts', 'documents', 'history'];

    public function __construct(private CdnStorage $cdn) {}

    public function index(Request $request): JsonResponse
    {
        $query = Student::query()->with(self::RELATIONS)->latest('enrolled_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                    ->orWhere('last_name', 'ilike', "%{$search}%")
                    ->orWhere('student_code', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($course = $request->query('course')) {
            $query->where('course', $course);
        }

        if ($batch = $request->query('batch')) {
            $query->where('batch', $batch);
        }

        return StudentResource::collection($query->get())->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'firstName' => ['required', 'string', 'max:255'],
            'lastName' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:students,email'],
            'phone' => ['required', 'string', 'max:50'],
            'dateOfBirth' => ['required', 'date'],
            'gender' => ['required', 'in:male,female,other'],
            'address' => ['required', 'string'],
            'city' => ['required', 'string', 'max:255'],
            'course' => ['required', 'string', 'max:255'],
            'batch' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'in:active,inactive,graduated,on_hold'],
            'enrolledAt' => ['nullable', 'date'],
            'photoUrl' => ['nullable', 'string'],
            'bloodGroup' => ['nullable', 'string', 'max:10'],
            'nationality' => ['nullable', 'string', 'max:100'],
            'emergencyContacts' => ['nullable', 'array'],
            'emergencyContacts.*.name' => ['required_with:emergencyContacts', 'string', 'max:255'],
            'emergencyContacts.*.relationship' => ['required_with:emergencyContacts', 'string', 'max:100'],
            'emergencyContacts.*.phone' => ['required_with:emergencyContacts', 'string', 'max:50'],
            'emergencyContacts.*.email' => ['nullable', 'email'],
            'emergencyContacts.*.isPrimary' => ['sometimes', 'boolean'],
            'documents' => ['nullable', 'array'],
            'documents.*.name' => ['required_with:documents', 'string', 'max:255'],
            'documents.*.type' => ['required_with:documents', 'in:id_proof,certificate,photo,application,other'],
            'documents.*.sizeLabel' => ['nullable', 'string', 'max:50'],
            'documents.*.url' => ['nullable', 'string', 'max:2048'],
        ]);

        $student = Student::create([
            'student_code' => $this->generateStudentCode(),
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'date_of_birth' => $data['dateOfBirth'],
            'gender' => $data['gender'],
            'address' => $data['address'],
            'city' => $data['city'],
            'course' => $data['course'],
            'batch' => $data['batch'],
            'status' => $data['status'] ?? 'active',
            'enrolled_at' => $data['enrolledAt'] ?? now()->toDateString(),
            'photo_url' => $data['photoUrl'] ?? null,
            'blood_group' => $data['bloodGroup'] ?? null,
            'nationality' => $data['nationality'] ?? null,
        ]);

        $student->logHistory('registration', 'Student registered', "Enrolled in {$student->course} — {$student->batch}");

        foreach ($data['emergencyContacts'] ?? [] as $contact) {
            $student->emergencyContacts()->create([
                'name' => $contact['name'],
                'relationship' => $contact['relationship'],
                'phone' => $contact['phone'],
                'email' => $contact['email'] ?? null,
                'is_primary' => $contact['isPrimary'] ?? false,
            ]);
        }

        foreach ($data['documents'] ?? [] as $document) {
            $student->documents()->create([
                'name' => $document['name'],
                'type' => $document['type'],
                'size_label' => $document['sizeLabel'] ?? null,
                'url' => $document['url'] ?? null,
                'uploaded_at' => now(),
            ]);
        }

        return (new StudentResource($student->load(self::RELATIONS)))->response()->setStatusCode(201);
    }

    public function show(Student $student): JsonResponse
    {
        return (new StudentResource($student->load(self::RELATIONS)))->response();
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'firstName' => ['sometimes', 'string', 'max:255'],
            'lastName' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:students,email,'.$student->id],
            'phone' => ['sometimes', 'string', 'max:50'],
            'dateOfBirth' => ['sometimes', 'date'],
            'gender' => ['sometimes', 'in:male,female,other'],
            'address' => ['sometimes', 'string'],
            'city' => ['sometimes', 'string', 'max:255'],
            'course' => ['sometimes', 'string', 'max:255'],
            'batch' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'in:active,inactive,graduated,on_hold'],
            'enrolledAt' => ['sometimes', 'date'],
            'bloodGroup' => ['sometimes', 'nullable', 'string', 'max:10'],
            'nationality' => ['sometimes', 'nullable', 'string', 'max:100'],
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
            'batch' => 'batch',
            'status' => 'status',
            'enrolledAt' => 'enrolled_at',
            'bloodGroup' => 'blood_group',
            'nationality' => 'nationality',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $student->update($payload);
        $student->logHistory('profile', 'Profile updated', 'Student profile details were updated');

        return (new StudentResource($student->fresh()->load(self::RELATIONS)))->response();
    }

    public function updatePhoto(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'photoUrl' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        $photoUrl = $data['photoUrl'] ?? null;

        if ($request->hasFile('photo')) {
            if ($student->photo_url) {
                $this->cdn->delete($student->photo_url);
            }
            $uploaded = $this->cdn->put($request->file('photo'), 'students/photos');
            $photoUrl = $uploaded['url'];
        }

        $student->update(['photo_url' => $photoUrl]);
        $student->logHistory('photo', 'Photo updated', 'Profile photo was updated');

        return (new StudentResource($student->fresh()->load(self::RELATIONS)))->response();
    }

    public function storeEmergencyContact(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'relationship' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email'],
            'isPrimary' => ['sometimes', 'boolean'],
        ]);

        if (! empty($data['isPrimary'])) {
            $student->emergencyContacts()->update(['is_primary' => false]);
        }

        $student->emergencyContacts()->create([
            'name' => $data['name'],
            'relationship' => $data['relationship'],
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'is_primary' => $data['isPrimary'] ?? false,
        ]);

        $student->logHistory('emergency', 'Emergency contact added', "Added {$data['name']} as {$data['relationship']}");

        return (new StudentResource($student->fresh()->load(self::RELATIONS)))->response()->setStatusCode(201);
    }

    public function updateEmergencyContact(Request $request, Student $student, EmergencyContact $contact): JsonResponse
    {
        abort_unless($contact->student_id === $student->id, 404);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'relationship' => ['sometimes', 'string', 'max:100'],
            'phone' => ['sometimes', 'string', 'max:50'],
            'email' => ['sometimes', 'nullable', 'email'],
            'isPrimary' => ['sometimes', 'boolean'],
        ]);

        if (! empty($data['isPrimary'])) {
            $student->emergencyContacts()->where('id', '!=', $contact->id)->update(['is_primary' => false]);
        }

        $contact->update([
            'name' => $data['name'] ?? $contact->name,
            'relationship' => $data['relationship'] ?? $contact->relationship,
            'phone' => $data['phone'] ?? $contact->phone,
            'email' => array_key_exists('email', $data) ? $data['email'] : $contact->email,
            'is_primary' => $data['isPrimary'] ?? $contact->is_primary,
        ]);

        return (new StudentResource($student->fresh()->load(self::RELATIONS)))->response();
    }

    public function destroyEmergencyContact(Student $student, EmergencyContact $contact): JsonResponse
    {
        abort_unless($contact->student_id === $student->id, 404);
        $contact->delete();

        return (new StudentResource($student->fresh()->load(self::RELATIONS)))->response();
    }

    public function storeDocument(Request $request, Student $student): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:id_proof,certificate,photo,application,other'],
            'sizeLabel' => ['nullable', 'string', 'max:50'],
            'file' => ['nullable', 'file', 'max:20480'],
            'url' => ['nullable', 'string', 'max:2048'],
        ]);

        $sizeLabel = $data['sizeLabel'] ?? null;
        $url = $data['url'] ?? null;

        if ($request->hasFile('file')) {
            $uploaded = $this->cdn->put($request->file('file'), 'students/documents');
            $url = $uploaded['url'];
            $sizeLabel = $sizeLabel ?: $this->humanBytes($uploaded['size']);
        }

        $student->documents()->create([
            'name' => $data['name'],
            'type' => $data['type'],
            'size_label' => $sizeLabel,
            'url' => $url,
            'uploaded_at' => now(),
        ]);

        $student->logHistory('document', 'Document uploaded', "{$data['name']} added to profile");

        return (new StudentResource($student->fresh()->load(self::RELATIONS)))->response()->setStatusCode(201);
    }

    private function humanBytes(int $bytes): string
    {
        if ($bytes < 1024) {
            return $bytes.' B';
        }
        if ($bytes < 1048576) {
            return round($bytes / 1024, 1).' KB';
        }

        return round($bytes / 1048576, 1).' MB';
    }

    public function destroyDocument(Student $student, StudentDocument $document): JsonResponse
    {
        abort_unless($document->student_id === $student->id, 404);
        if ($document->url) {
            $this->cdn->delete($document->url);
        }
        $document->delete();

        return (new StudentResource($student->fresh()->load(self::RELATIONS)))->response();
    }

    public function issueIdCard(Student $student): JsonResponse
    {
        $student->update([
            'id_card_issued' => true,
            'id_card_issued_at' => now(),
        ]);

        $student->logHistory('id_card', 'ID card issued', "Card {$student->student_code} printed and handed over");

        return (new StudentResource($student->fresh()->load(self::RELATIONS)))->response();
    }

    private function generateStudentCode(): string
    {
        $year = now()->format('Y');
        $sequence = Student::query()->whereYear('created_at', $year)->count() + 1;

        return sprintf('VLM-%s-%03d', $year, $sequence);
    }
}
