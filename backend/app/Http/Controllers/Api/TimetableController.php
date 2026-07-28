<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TimetableSlotResource;
use App\Models\TimetableSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimetableController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TimetableSlot::query()->latest('created_at');

        if ($batchId = $request->query('batch_id')) {
            $query->where('batch_id', $batchId);
        }

        if ($trainerId = $request->query('trainer_id')) {
            $query->where('trainer_id', $trainerId);
        }

        if ($day = $request->query('day')) {
            $query->where('day', $day);
        }

        return TimetableSlotResource::collection($query->get())->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'day' => ['required', 'string', 'max:30'],
            'time' => ['required', 'string', 'max:50'],
            'course' => ['required', 'string', 'max:255'],
            'batch' => ['required', 'string', 'max:255'],
            'batchId' => ['nullable', 'uuid', 'exists:batches,id'],
            'trainer' => ['required', 'string', 'max:255'],
            'trainerId' => ['nullable', 'uuid', 'exists:trainers,id'],
            'room' => ['required', 'string', 'max:255'],
        ]);

        $slot = TimetableSlot::create([
            'day' => $data['day'],
            'time' => $data['time'],
            'course' => $data['course'],
            'batch' => $data['batch'],
            'batch_id' => $data['batchId'] ?? null,
            'trainer' => $data['trainer'],
            'trainer_id' => $data['trainerId'] ?? null,
            'room' => $data['room'],
        ]);

        return (new TimetableSlotResource($slot))->response()->setStatusCode(201);
    }

    public function show(TimetableSlot $slot): JsonResponse
    {
        return (new TimetableSlotResource($slot))->response();
    }

    public function update(Request $request, TimetableSlot $slot): JsonResponse
    {
        $data = $request->validate([
            'day' => ['sometimes', 'string', 'max:30'],
            'time' => ['sometimes', 'string', 'max:50'],
            'course' => ['sometimes', 'string', 'max:255'],
            'batch' => ['sometimes', 'string', 'max:255'],
            'batchId' => ['sometimes', 'nullable', 'uuid', 'exists:batches,id'],
            'trainer' => ['sometimes', 'string', 'max:255'],
            'trainerId' => ['sometimes', 'nullable', 'uuid', 'exists:trainers,id'],
            'room' => ['sometimes', 'string', 'max:255'],
        ]);

        $map = [
            'day' => 'day',
            'time' => 'time',
            'course' => 'course',
            'batch' => 'batch',
            'batchId' => 'batch_id',
            'trainer' => 'trainer',
            'trainerId' => 'trainer_id',
            'room' => 'room',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $slot->update($payload);

        return (new TimetableSlotResource($slot->fresh()))->response();
    }

    public function destroy(TimetableSlot $slot): JsonResponse
    {
        $slot->delete();

        return response()->json(['data' => null]);
    }
}
