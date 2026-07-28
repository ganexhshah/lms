<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExamResource;
use App\Models\Exam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Exam::query()->with('grades')->latest('date');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($batchId = $request->query('batch_id')) {
            $query->where('batch_id', $batchId);
        }

        return ExamResource::collection($query->get())->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'course' => ['required', 'string', 'max:255'],
            'batch' => ['required', 'string', 'max:255'],
            'batchId' => ['nullable', 'uuid', 'exists:batches,id'],
            'type' => ['required', 'in:practical,written,final'],
            'date' => ['required', 'date'],
            'passMark' => ['required', 'integer', 'min:0', 'max:100'],
            'status' => ['required', 'in:scheduled,graded,cancelled'],
        ]);

        $exam = Exam::create([
            'title' => $data['title'],
            'course' => $data['course'],
            'batch' => $data['batch'],
            'batch_id' => $data['batchId'] ?? null,
            'type' => $data['type'],
            'date' => $data['date'],
            'pass_mark' => $data['passMark'],
            'status' => $data['status'],
        ]);

        return (new ExamResource($exam->load('grades')))->response()->setStatusCode(201);
    }

    public function show(Exam $exam): JsonResponse
    {
        return (new ExamResource($exam->load('grades')))->response();
    }

    public function update(Request $request, Exam $exam): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'course' => ['sometimes', 'string', 'max:255'],
            'batch' => ['sometimes', 'string', 'max:255'],
            'batchId' => ['sometimes', 'nullable', 'uuid', 'exists:batches,id'],
            'type' => ['sometimes', 'in:practical,written,final'],
            'date' => ['sometimes', 'date'],
            'passMark' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'status' => ['sometimes', 'in:scheduled,graded,cancelled'],
        ]);

        $map = [
            'title' => 'title',
            'course' => 'course',
            'batch' => 'batch',
            'batchId' => 'batch_id',
            'type' => 'type',
            'date' => 'date',
            'passMark' => 'pass_mark',
            'status' => 'status',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $exam->update($payload);

        return (new ExamResource($exam->fresh()->load('grades')))->response();
    }

    public function destroy(Exam $exam): JsonResponse
    {
        $exam->delete();

        return response()->json(['data' => null]);
    }

    public function updateGrades(Request $request, Exam $exam): JsonResponse
    {
        $data = $request->validate([
            'grades' => ['required', 'array'],
            'grades.*.studentId' => ['nullable', 'uuid', 'exists:students,id'],
            'grades.*.studentName' => ['required', 'string', 'max:255'],
            'grades.*.score' => ['required', 'numeric', 'min:0'],
            'grades.*.passed' => ['nullable', 'boolean'],
            'grades.*.comment' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($exam, $data) {
            $exam->grades()->delete();

            foreach ($data['grades'] as $grade) {
                $score = (float) $grade['score'];
                $passed = array_key_exists('passed', $grade)
                    ? (bool) $grade['passed']
                    : $score >= $exam->pass_mark;

                $exam->grades()->create([
                    'student_id' => $grade['studentId'] ?? null,
                    'student_name' => $grade['studentName'],
                    'score' => $score,
                    'passed' => $passed,
                    'comment' => $grade['comment'] ?? '',
                ]);
            }

            $exam->update(['status' => 'graded']);
        });

        return (new ExamResource($exam->fresh()->load('grades')))->response();
    }
}
