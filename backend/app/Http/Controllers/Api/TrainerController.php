<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrainerRatingEventResource;
use App\Http\Resources\TrainerResource;
use App\Http\Resources\TrainerSalaryEntryResource;
use App\Http\Resources\TrainerScheduleSlotResource;
use App\Models\Trainer;
use App\Models\TrainerRatingEvent;
use App\Models\TrainerSalaryEntry;
use App\Models\TrainerScheduleSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Trainer::query()
            ->with(['scheduleSlots', 'salaryHistory', 'ratingHistory'])
            ->latest('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('specialty', 'ilike', "%{$search}%");
            });
        }

        return TrainerResource::collection($query->get())->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:trainers,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'specialty' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:active,on_leave,inactive'],
            'salary' => ['nullable', 'integer', 'min:0'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'schedule' => ['nullable', 'string', 'max:255'],
        ]);

        $trainer = Trainer::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? '',
            'specialty' => $data['specialty'] ?? '',
            'status' => $data['status'],
            'salary' => $data['salary'] ?? 0,
            'rating' => $data['rating'] ?? 0,
            'schedule' => $data['schedule'] ?? '',
        ]);

        return (new TrainerResource($trainer->load(['scheduleSlots', 'salaryHistory', 'ratingHistory'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Trainer $trainer): JsonResponse
    {
        return (new TrainerResource($trainer->load(['scheduleSlots', 'salaryHistory', 'ratingHistory'])))->response();
    }

    public function update(Request $request, Trainer $trainer): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:trainers,email,'.$trainer->id],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'specialty' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'in:active,on_leave,inactive'],
            'salary' => ['sometimes', 'integer', 'min:0'],
            'rating' => ['sometimes', 'numeric', 'min:0', 'max:5'],
            'schedule' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $map = [
            'name' => 'name',
            'email' => 'email',
            'phone' => 'phone',
            'specialty' => 'specialty',
            'status' => 'status',
            'salary' => 'salary',
            'rating' => 'rating',
            'schedule' => 'schedule',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $trainer->update($payload);

        return (new TrainerResource($trainer->fresh()->load(['scheduleSlots', 'salaryHistory', 'ratingHistory'])))->response();
    }

    public function destroy(Trainer $trainer): JsonResponse
    {
        $trainer->delete();

        return response()->json(['data' => null]);
    }

    public function storeScheduleSlot(Request $request, Trainer $trainer): JsonResponse
    {
        $data = $request->validate([
            'day' => ['required', 'string', 'max:30'],
            'time' => ['required', 'string', 'max:50'],
            'batch' => ['nullable', 'string', 'max:255'],
            'room' => ['nullable', 'string', 'max:255'],
        ]);

        $slot = $trainer->scheduleSlots()->create([
            'day' => $data['day'],
            'time' => $data['time'],
            'batch' => $data['batch'] ?? '',
            'room' => $data['room'] ?? '',
        ]);

        return (new TrainerScheduleSlotResource($slot))->response()->setStatusCode(201);
    }

    public function updateScheduleSlot(Request $request, Trainer $trainer, TrainerScheduleSlot $slot): JsonResponse
    {
        abort_unless($slot->trainer_id === $trainer->id, 404);

        $data = $request->validate([
            'day' => ['sometimes', 'string', 'max:30'],
            'time' => ['sometimes', 'string', 'max:50'],
            'batch' => ['sometimes', 'nullable', 'string', 'max:255'],
            'room' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $map = ['day' => 'day', 'time' => 'time', 'batch' => 'batch', 'room' => 'room'];
        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $slot->update($payload);

        return (new TrainerScheduleSlotResource($slot->fresh()))->response();
    }

    public function destroyScheduleSlot(Trainer $trainer, TrainerScheduleSlot $slot): JsonResponse
    {
        abort_unless($slot->trainer_id === $trainer->id, 404);
        $slot->delete();

        return response()->json(['data' => null]);
    }

    public function storeSalary(Request $request, Trainer $trainer): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'amount' => ['required', 'integer', 'min:0'],
            'note' => ['nullable', 'string'],
        ]);

        $entry = $trainer->salaryHistory()->create([
            'date' => $data['date'],
            'amount' => $data['amount'],
            'note' => $data['note'] ?? '',
        ]);

        $trainer->update(['salary' => $data['amount']]);

        return (new TrainerSalaryEntryResource($entry))->response()->setStatusCode(201);
    }

    public function destroySalary(Trainer $trainer, TrainerSalaryEntry $salary): JsonResponse
    {
        abort_unless($salary->trainer_id === $trainer->id, 404);
        $salary->delete();

        return response()->json(['data' => null]);
    }

    public function storeRating(Request $request, Trainer $trainer): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'score' => ['required', 'numeric', 'min:0', 'max:5'],
            'note' => ['nullable', 'string'],
        ]);

        $event = $trainer->ratingHistory()->create([
            'date' => $data['date'],
            'score' => $data['score'],
            'note' => $data['note'] ?? '',
        ]);

        $avg = round((float) $trainer->ratingHistory()->avg('score'), 2);
        $trainer->update(['rating' => $avg]);

        return (new TrainerRatingEventResource($event))->response()->setStatusCode(201);
    }

    public function destroyRating(Trainer $trainer, TrainerRatingEvent $rating): JsonResponse
    {
        abort_unless($rating->trainer_id === $trainer->id, 404);
        $rating->delete();

        $avg = round((float) ($trainer->ratingHistory()->avg('score') ?? 0), 2);
        $trainer->update(['rating' => $avg]);

        return response()->json(['data' => null]);
    }
}
