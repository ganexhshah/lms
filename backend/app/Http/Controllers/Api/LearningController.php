<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LearningItemResource;
use App\Models\LearningItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LearningController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = LearningItem::query()->latest('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        return LearningItemResource::collection($query->get())->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:video,pdf,assignment,quiz'],
            'course' => ['required', 'string', 'max:255'],
            'progress' => ['nullable', 'integer', 'min:0', 'max:100'],
            'status' => ['required', 'in:published,draft'],
            'url' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
        ]);

        $item = LearningItem::create([
            'title' => $data['title'],
            'type' => $data['type'],
            'course' => $data['course'],
            'progress' => $data['progress'] ?? 0,
            'status' => $data['status'],
            'url' => $data['url'] ?? '',
            'description' => $data['description'] ?? '',
        ]);

        return (new LearningItemResource($item))->response()->setStatusCode(201);
    }

    public function show(LearningItem $item): JsonResponse
    {
        return (new LearningItemResource($item))->response();
    }

    public function update(Request $request, LearningItem $item): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'in:video,pdf,assignment,quiz'],
            'course' => ['sometimes', 'string', 'max:255'],
            'progress' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'status' => ['sometimes', 'in:published,draft'],
            'url' => ['sometimes', 'nullable', 'string'],
            'description' => ['sometimes', 'nullable', 'string'],
        ]);

        $map = [
            'title' => 'title',
            'type' => 'type',
            'course' => 'course',
            'progress' => 'progress',
            'status' => 'status',
            'url' => 'url',
            'description' => 'description',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $item->update($payload);

        return (new LearningItemResource($item->fresh()))->response();
    }

    public function destroy(LearningItem $item): JsonResponse
    {
        $item->delete();

        return response()->json(['data' => null]);
    }
}
