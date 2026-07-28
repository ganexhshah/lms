<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CanvaConnection;
use App\Models\CanvaDesign;
use App\Models\Student;
use App\Services\Canva\CanvaClient;
use App\Services\Canva\CanvaDesignService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Throwable;

class CanvaController extends Controller
{
    public function __construct(
        private CanvaClient $canva,
        private CanvaDesignService $designs,
    ) {}

    public function status(Request $request): JsonResponse
    {
        $connected = CanvaConnection::query()
            ->where('user_id', $request->user()->id)
            ->exists();

        return response()->json([
            'data' => [
                'configured' => $this->canva->isConfigured(),
                'connected' => $connected,
                'idCardTemplate' => filled(config('canva.templates.id_card')),
                'certificateTemplate' => filled(config('canva.templates.certificate')),
                'schoolName' => config('canva.school_name'),
            ],
        ]);
    }

    public function connect(Request $request): JsonResponse
    {
        if (! $this->canva->isConfigured()) {
            return response()->json([
                'message' => 'Add CANVA_CLIENT_ID and CANVA_CLIENT_SECRET to backend .env',
            ], 422);
        }

        return response()->json([
            'data' => [
                'authorizeUrl' => $this->canva->createAuthUrl($request->user()),
            ],
        ]);
    }

    public function callback(Request $request): RedirectResponse
    {
        $frontend = rtrim((string) config('canva.frontend_redirect'), '/');

        try {
            $data = $request->validate([
                'code' => ['required', 'string'],
                'state' => ['required', 'string'],
            ]);
            $this->canva->handleCallback($data['code'], $data['state']);

            return redirect()->away($frontend.'?canva=connected');
        } catch (Throwable $e) {
            return redirect()->away($frontend.'?canva=error&message='.urlencode($e->getMessage()));
        }
    }

    public function disconnect(Request $request): JsonResponse
    {
        CanvaConnection::query()->where('user_id', $request->user()->id)->delete();

        return response()->json(['data' => ['connected' => false]]);
    }

    public function generateIdCard(Request $request, Student $student): JsonResponse
    {
        try {
            $design = $this->designs->generateIdCard($request->user(), $student);

            $student->update([
                'id_card_issued' => true,
                'id_card_issued_at' => now(),
            ]);
            $student->logHistory('id_card', 'ID card generated via Canva', $design->subject_key);

            return response()->json(['data' => $this->designPayload($design)], 201);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function generateCertificate(Request $request): JsonResponse
    {
        $data = $request->validate($this->certificateRules());

        $student = Student::query()->findOrFail($data['studentId']);

        try {
            $design = $this->designs->generateCertificate($request->user(), $student, $data);

            $student->logHistory(
                'other',
                'Certificate generated via Canva',
                ($design->meta['certificate_number'] ?? $design->subject_key).' — '.($design->meta['course'] ?? $data['course'])
            );

            return response()->json(['data' => $this->designPayload($design)], 201);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function generateCertificatesBulk(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1', 'max:25'],
            'items.*.studentId' => ['required', 'uuid', 'exists:students,id'],
            'items.*.course' => ['required', 'string', 'max:255'],
            'items.*.certificateNumber' => ['nullable', 'string', 'max:100'],
            'items.*.issuedAt' => ['nullable', 'date'],
            'items.*.schoolName' => ['nullable', 'string', 'max:255'],
            'items.*.batch' => ['nullable', 'string', 'max:255'],
            'items.*.studentName' => ['nullable', 'string', 'max:255'],
        ]);

        $results = [];

        foreach ($data['items'] as $item) {
            $student = Student::query()->findOrFail($item['studentId']);

            try {
                $design = $this->designs->generateCertificate($request->user(), $student, $item);
                $student->logHistory(
                    'other',
                    'Certificate generated via Canva',
                    ($design->meta['certificate_number'] ?? $design->subject_key).' — '.($design->meta['course'] ?? $item['course'])
                );

                $results[] = [
                    'studentId' => $student->id,
                    'success' => true,
                    'design' => $this->designPayload($design),
                ];
            } catch (Throwable $e) {
                $results[] = [
                    'studentId' => $student->id,
                    'success' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json(['data' => $results]);
    }

    public function latest(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['nullable', 'in:id_card,certificate'],
            'studentId' => ['nullable', 'uuid'],
        ]);

        $query = CanvaDesign::query()
            ->where('user_id', $request->user()->id)
            ->latest();

        if (! empty($data['type'])) {
            $query->where('type', $data['type']);
        }
        if (! empty($data['studentId'])) {
            $query->where('student_id', $data['studentId']);
        }

        $items = $query->limit(20)->get()->map(fn (CanvaDesign $d) => $this->designPayload($d));

        return response()->json(['data' => $items]);
    }

    /**
     * @return array<string, mixed>
     */
    private function designPayload(CanvaDesign $design): array
    {
        return [
            'id' => $design->id,
            'type' => $design->type,
            'studentId' => $design->student_id,
            'subjectKey' => $design->subject_key,
            'canvaDesignId' => $design->canva_design_id,
            'editUrl' => $design->edit_url,
            'viewUrl' => $design->view_url,
            'exportUrl' => $design->export_url,
            'cdnUrl' => $design->cdn_url,
            'status' => $design->status,
            'meta' => $design->meta,
            'createdAt' => optional($design->created_at)?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function certificateRules(): array
    {
        return [
            'studentId' => ['required', 'uuid', 'exists:students,id'],
            'course' => ['required', 'string', 'max:255'],
            'certificateNumber' => ['nullable', 'string', 'max:100'],
            'issuedAt' => ['nullable', 'date'],
            'schoolName' => ['nullable', 'string', 'max:255'],
            'batch' => ['nullable', 'string', 'max:255'],
            'studentName' => ['nullable', 'string', 'max:255'],
        ];
    }
}
