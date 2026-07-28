<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Course::query()->latest('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($level = $request->query('level')) {
            $query->where('level', $level);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        return CourseResource::collection($query->get())->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'durationWeeks' => ['required', 'integer', 'min:0'],
            'durationHours' => ['required', 'integer', 'min:0'],
            'level' => ['required', 'in:beginner,intermediate,advanced'],
            'status' => ['required', 'in:draft,active,archived'],
            'fee' => ['required', 'integer', 'min:0'],
            'installments' => ['required', 'integer', 'min:1'],
            'discountNotes' => ['nullable', 'string'],
        ]);

        $course = Course::create([
            'code' => $this->generateCourseCode($data['title']),
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'duration_weeks' => $data['durationWeeks'],
            'duration_hours' => $data['durationHours'],
            'level' => $data['level'],
            'status' => $data['status'],
            'fee' => $data['fee'],
            'installments' => $data['installments'],
            'discount_notes' => $data['discountNotes'] ?? '',
            'syllabus' => [],
            'trainers' => [],
            'materials' => [],
        ]);

        return (new CourseResource($course))->response()->setStatusCode(201);
    }

    public function show(Course $course): JsonResponse
    {
        return (new CourseResource($course))->response();
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'durationWeeks' => ['sometimes', 'integer', 'min:0'],
            'durationHours' => ['sometimes', 'integer', 'min:0'],
            'level' => ['sometimes', 'in:beginner,intermediate,advanced'],
            'status' => ['sometimes', 'in:draft,active,archived'],
            'fee' => ['sometimes', 'integer', 'min:0'],
            'installments' => ['sometimes', 'integer', 'min:1'],
            'discountNotes' => ['sometimes', 'nullable', 'string'],
        ]);

        $map = [
            'title' => 'title',
            'description' => 'description',
            'durationWeeks' => 'duration_weeks',
            'durationHours' => 'duration_hours',
            'level' => 'level',
            'status' => 'status',
            'fee' => 'fee',
            'installments' => 'installments',
            'discountNotes' => 'discount_notes',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $course->update($payload);

        return (new CourseResource($course->fresh()))->response();
    }

    public function destroy(Course $course): JsonResponse
    {
        $course->delete();

        return response()->json(['data' => null]);
    }

    public function updateFees(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'fee' => ['required', 'integer', 'min:0'],
            'installments' => ['required', 'integer', 'min:1'],
            'discountNotes' => ['nullable', 'string'],
        ]);

        $course->update([
            'fee' => $data['fee'],
            'installments' => $data['installments'],
            'discount_notes' => $data['discountNotes'] ?? '',
        ]);

        return (new CourseResource($course->fresh()))->response();
    }

    public function updateSyllabus(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'syllabus' => ['required', 'array'],
            'syllabus.*.id' => ['nullable', 'string'],
            'syllabus.*.title' => ['required', 'string', 'max:255'],
            'syllabus.*.hours' => ['required', 'integer', 'min:0'],
            'syllabus.*.description' => ['nullable', 'string'],
        ]);

        $syllabus = array_map(function ($item) {
            return [
                'id' => $item['id'] ?? (string) Str::uuid(),
                'title' => $item['title'],
                'hours' => (int) $item['hours'],
                'description' => $item['description'] ?? '',
            ];
        }, $data['syllabus']);

        $course->update(['syllabus' => $syllabus]);

        return (new CourseResource($course->fresh()))->response();
    }

    public function updateTrainers(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'trainers' => ['required', 'array'],
            'trainers.*.id' => ['nullable', 'string'],
            'trainers.*.name' => ['required', 'string', 'max:255'],
            'trainers.*.role' => ['nullable', 'string', 'max:255'],
        ]);

        $trainers = array_map(function ($item) {
            return [
                'id' => $item['id'] ?? (string) Str::uuid(),
                'name' => $item['name'],
                'role' => $item['role'] ?? '',
            ];
        }, $data['trainers']);

        $course->update(['trainers' => $trainers]);

        return (new CourseResource($course->fresh()))->response();
    }

    public function updateMaterials(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'materials' => ['required', 'array'],
            'materials.*.id' => ['nullable', 'string'],
            'materials.*.name' => ['required', 'string', 'max:255'],
            'materials.*.type' => ['required', 'in:pdf,video,link,other'],
            'materials.*.sizeLabel' => ['nullable', 'string', 'max:50'],
            'materials.*.uploadedAt' => ['nullable', 'date'],
        ]);

        $materials = array_map(function ($item) {
            return [
                'id' => $item['id'] ?? (string) Str::uuid(),
                'name' => $item['name'],
                'type' => $item['type'],
                'sizeLabel' => $item['sizeLabel'] ?? '',
                'uploadedAt' => $item['uploadedAt'] ?? now()->toDateString(),
            ];
        }, $data['materials']);

        $course->update(['materials' => $materials]);

        return (new CourseResource($course->fresh()))->response();
    }

    private function generateCourseCode(string $title): string
    {
        $initials = collect(preg_split('/\s+/', trim($title)))
            ->map(fn ($word) => strtoupper(substr($word, 0, 1)))
            ->implode('');

        $sequence = Course::query()->count() + 1;

        return sprintf('CRS-%s%02d', $initials ?: 'GEN', $sequence);
    }
}
