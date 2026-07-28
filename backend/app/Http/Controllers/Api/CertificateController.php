<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CertificateResource;
use App\Models\Certificate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Certificate::query()->with('verifyLog')->latest('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($studentId = $request->query('student_id')) {
            $query->where('student_id', $studentId);
        }

        return CertificateResource::collection($query->get())->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'number' => ['nullable', 'string', 'max:100', 'unique:certificates,number'],
            'student' => ['required', 'string', 'max:255'],
            'studentId' => ['nullable', 'uuid', 'exists:students,id'],
            'course' => ['required', 'string', 'max:255'],
            'issuedAt' => ['nullable', 'date'],
            'status' => ['required', 'in:issued,revoked,pending'],
        ]);

        $certificate = Certificate::create([
            'number' => $data['number'] ?? $this->generateNumber(),
            'student' => $data['student'],
            'student_id' => $data['studentId'] ?? null,
            'course' => $data['course'],
            'issued_at' => $data['issuedAt'] ?? ($data['status'] === 'issued' ? now() : null),
            'status' => $data['status'],
        ]);

        return (new CertificateResource($certificate->load('verifyLog')))->response()->setStatusCode(201);
    }

    public function show(Certificate $certificate): JsonResponse
    {
        return (new CertificateResource($certificate->load('verifyLog')))->response();
    }

    public function update(Request $request, Certificate $certificate): JsonResponse
    {
        $data = $request->validate([
            'number' => ['sometimes', 'string', 'max:100', 'unique:certificates,number,'.$certificate->id],
            'student' => ['sometimes', 'string', 'max:255'],
            'studentId' => ['sometimes', 'nullable', 'uuid', 'exists:students,id'],
            'course' => ['sometimes', 'string', 'max:255'],
            'issuedAt' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', 'in:issued,revoked,pending'],
        ]);

        $map = [
            'number' => 'number',
            'student' => 'student',
            'studentId' => 'student_id',
            'course' => 'course',
            'issuedAt' => 'issued_at',
            'status' => 'status',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $certificate->update($payload);

        return (new CertificateResource($certificate->fresh()->load('verifyLog')))->response();
    }

    private function generateNumber(): string
    {
        $sequence = Certificate::query()->count() + 1;

        return sprintf('CERT-%s-%04d', now()->format('Y'), $sequence);
    }
}
