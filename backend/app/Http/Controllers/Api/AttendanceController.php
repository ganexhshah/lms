<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceSessionResource;
use App\Models\AttendanceSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AttendanceSession::query()->with('records')->latest('date');

        if ($batchId = $request->query('batch_id')) {
            $query->where('batch_id', $batchId);
        }

        if ($date = $request->query('date')) {
            $query->whereDate('date', $date);
        }

        return AttendanceSessionResource::collection($query->get())->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'batch' => ['required', 'string', 'max:255'],
            'batchId' => ['nullable', 'uuid', 'exists:batches,id'],
            'course' => ['required', 'string', 'max:255'],
            'method' => ['required', 'in:manual,qr,fingerprint'],
            'records' => ['nullable', 'array'],
            'records.*.studentId' => ['nullable', 'uuid', 'exists:students,id'],
            'records.*.studentName' => ['required_with:records', 'string', 'max:255'],
            'records.*.status' => ['required_with:records', 'in:present,absent,late'],
        ]);

        $session = DB::transaction(function () use ($data) {
            $records = $data['records'] ?? [];
            $present = collect($records)->whereIn('status', ['present', 'late'])->count();
            $absent = collect($records)->where('status', 'absent')->count();

            $session = AttendanceSession::create([
                'date' => $data['date'],
                'batch' => $data['batch'],
                'batch_id' => $data['batchId'] ?? null,
                'course' => $data['course'],
                'method' => $data['method'],
                'present' => $present,
                'absent' => $absent,
            ]);

            foreach ($records as $record) {
                $session->records()->create([
                    'student_id' => $record['studentId'] ?? null,
                    'student_name' => $record['studentName'],
                    'status' => $record['status'],
                ]);
            }

            return $session;
        });

        return (new AttendanceSessionResource($session->load('records')))->response()->setStatusCode(201);
    }

    public function show(AttendanceSession $session): JsonResponse
    {
        return (new AttendanceSessionResource($session->load('records')))->response();
    }

    public function update(Request $request, AttendanceSession $session): JsonResponse
    {
        $data = $request->validate([
            'date' => ['sometimes', 'date'],
            'batch' => ['sometimes', 'string', 'max:255'],
            'batchId' => ['sometimes', 'nullable', 'uuid', 'exists:batches,id'],
            'course' => ['sometimes', 'string', 'max:255'],
            'method' => ['sometimes', 'in:manual,qr,fingerprint'],
            'notifiedAt' => ['sometimes', 'nullable', 'date'],
        ]);

        $map = [
            'date' => 'date',
            'batch' => 'batch',
            'batchId' => 'batch_id',
            'course' => 'course',
            'method' => 'method',
            'notifiedAt' => 'notified_at',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $session->update($payload);

        return (new AttendanceSessionResource($session->fresh()->load('records')))->response();
    }

    public function destroy(AttendanceSession $session): JsonResponse
    {
        $session->delete();

        return response()->json(['data' => null]);
    }

    public function markRecords(Request $request, AttendanceSession $session): JsonResponse
    {
        $data = $request->validate([
            'records' => ['required', 'array', 'min:1'],
            'records.*.studentId' => ['nullable', 'uuid', 'exists:students,id'],
            'records.*.studentName' => ['required', 'string', 'max:255'],
            'records.*.status' => ['required', 'in:present,absent,late'],
        ]);

        DB::transaction(function () use ($session, $data) {
            $session->records()->delete();

            foreach ($data['records'] as $record) {
                $session->records()->create([
                    'student_id' => $record['studentId'] ?? null,
                    'student_name' => $record['studentName'],
                    'status' => $record['status'],
                ]);
            }

            $present = collect($data['records'])->whereIn('status', ['present', 'late'])->count();
            $absent = collect($data['records'])->where('status', 'absent')->count();

            $session->update([
                'present' => $present,
                'absent' => $absent,
            ]);
        });

        return (new AttendanceSessionResource($session->fresh()->load('records')))->response();
    }
}
