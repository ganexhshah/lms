<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BatchResource;
use App\Models\Batch;
use App\Models\BatchTransfer;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BatchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Batch::query()->with('students')->latest('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($courseId = $request->query('course_id')) {
            $query->where('course_id', $courseId);
        }

        return BatchResource::collection($query->get())->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'course' => ['required', 'string', 'max:255'],
            'courseId' => ['nullable', 'uuid', 'exists:courses,id'],
            'shift' => ['required', 'in:morning,evening'],
            'capacity' => ['required', 'integer', 'min:1'],
            'startDate' => ['required', 'date'],
            'endDate' => ['required', 'date', 'after_or_equal:startDate'],
            'progress' => ['nullable', 'integer', 'min:0', 'max:100'],
            'trainer' => ['nullable', 'string', 'max:255'],
            'trainerId' => ['nullable', 'string', 'max:100'],
            'room' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:upcoming,active,completed'],
        ]);

        $batch = Batch::create([
            'name' => $data['name'],
            'course' => $data['course'],
            'course_id' => $data['courseId'] ?? null,
            'shift' => $data['shift'],
            'capacity' => $data['capacity'],
            'start_date' => $data['startDate'],
            'end_date' => $data['endDate'],
            'progress' => $data['progress'] ?? 0,
            'trainer' => $data['trainer'] ?? null,
            'trainer_id' => $data['trainerId'] ?? null,
            'room' => $data['room'] ?? null,
            'status' => $data['status'],
        ]);

        return (new BatchResource($batch->load('students')))->response()->setStatusCode(201);
    }

    public function show(Batch $batch): JsonResponse
    {
        return (new BatchResource($batch->load('students')))->response();
    }

    public function update(Request $request, Batch $batch): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'course' => ['sometimes', 'string', 'max:255'],
            'courseId' => ['sometimes', 'nullable', 'uuid', 'exists:courses,id'],
            'shift' => ['sometimes', 'in:morning,evening'],
            'capacity' => ['sometimes', 'integer', 'min:1'],
            'startDate' => ['sometimes', 'date'],
            'endDate' => ['sometimes', 'date'],
            'progress' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'trainer' => ['sometimes', 'nullable', 'string', 'max:255'],
            'trainerId' => ['sometimes', 'nullable', 'string', 'max:100'],
            'room' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'in:upcoming,active,completed'],
        ]);

        $map = [
            'name' => 'name',
            'course' => 'course',
            'courseId' => 'course_id',
            'shift' => 'shift',
            'capacity' => 'capacity',
            'startDate' => 'start_date',
            'endDate' => 'end_date',
            'progress' => 'progress',
            'trainer' => 'trainer',
            'trainerId' => 'trainer_id',
            'room' => 'room',
            'status' => 'status',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $batch->update($payload);

        return (new BatchResource($batch->fresh()->load('students')))->response();
    }

    public function destroy(Batch $batch): JsonResponse
    {
        $batch->delete();

        return response()->json(['data' => null]);
    }

    public function enrollStudent(Request $request, Batch $batch): JsonResponse
    {
        $data = $request->validate([
            'studentId' => ['required', 'uuid', 'exists:students,id'],
        ]);

        if ($batch->students()->count() >= $batch->capacity) {
            throw ValidationException::withMessages([
                'studentId' => ['This batch is already at full capacity.'],
            ]);
        }

        $student = Student::findOrFail($data['studentId']);
        $batch->students()->syncWithoutDetaching([$student->id => ['enrolled_at' => now()]]);
        $student->update(['batch' => $batch->name]);
        $student->logHistory('batch', 'Batch assigned', "Enrolled in {$batch->name}");

        return (new BatchResource($batch->fresh()->load('students')))->response();
    }

    public function removeStudent(Request $request, Batch $batch): JsonResponse
    {
        $data = $request->validate([
            'studentId' => ['required', 'uuid', 'exists:students,id'],
        ]);

        $batch->students()->detach($data['studentId']);

        $student = Student::find($data['studentId']);
        $student?->logHistory('batch', 'Removed from batch', "Removed from {$batch->name}");

        return (new BatchResource($batch->fresh()->load('students')))->response();
    }

    public function transferStudent(Request $request, Batch $batch): JsonResponse
    {
        $data = $request->validate([
            'studentId' => ['required', 'uuid', 'exists:students,id'],
            'toBatchId' => ['required', 'uuid', 'exists:batches,id'],
            'note' => ['nullable', 'string'],
        ]);

        if ($data['toBatchId'] === $batch->id) {
            throw ValidationException::withMessages([
                'toBatchId' => ['Choose a different batch to transfer into.'],
            ]);
        }

        $toBatch = Batch::findOrFail($data['toBatchId']);

        if ($toBatch->students()->count() >= $toBatch->capacity) {
            throw ValidationException::withMessages([
                'toBatchId' => ['The destination batch is already at full capacity.'],
            ]);
        }

        $student = Student::findOrFail($data['studentId']);

        DB::transaction(function () use ($batch, $toBatch, $student, $data) {
            $batch->students()->detach($student->id);
            $toBatch->students()->syncWithoutDetaching([$student->id => ['enrolled_at' => now()]]);
            $student->update(['batch' => $toBatch->name]);

            BatchTransfer::create([
                'student_id' => $student->id,
                'from_batch_id' => $batch->id,
                'to_batch_id' => $toBatch->id,
                'note' => $data['note'] ?? '',
                'date' => now(),
            ]);

            $student->logHistory('batch', 'Batch transferred', "Moved from {$batch->name} to {$toBatch->name}");
        });

        return (new BatchResource($batch->fresh()->load('students')))->response();
    }
}
