<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommunicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Announcement::query()->latest('sent_at');

        if ($channel = $request->query('channel')) {
            $query->where('channel', $channel);
        }

        return AnnouncementResource::collection($query->get())->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'channel' => ['required', 'in:sms,email,whatsapp,board'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'sentAt' => ['nullable', 'date'],
            'audience' => ['required', 'in:all,batch,student'],
            'audienceId' => ['nullable', 'string', 'max:100'],
            'audienceLabel' => ['nullable', 'string', 'max:255'],
            'deliveryLog' => ['nullable', 'array'],
        ]);

        $sentAt = $data['sentAt'] ?? now();

        $announcement = Announcement::create([
            'channel' => $data['channel'],
            'title' => $data['title'],
            'body' => $data['body'],
            'sent_at' => $sentAt,
            'audience' => $data['audience'],
            'audience_id' => $data['audienceId'] ?? null,
            'audience_label' => $data['audienceLabel'] ?? ($data['audience'] === 'all' ? 'All students' : ''),
            'delivery_log' => $data['deliveryLog'] ?? [[
                'id' => (string) Str::uuid(),
                'at' => now()->toIso8601String(),
                'status' => 'queued',
            ]],
        ]);

        return (new AnnouncementResource($announcement))->response()->setStatusCode(201);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        return (new AnnouncementResource($announcement))->response();
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $data = $request->validate([
            'channel' => ['sometimes', 'in:sms,email,whatsapp,board'],
            'title' => ['sometimes', 'string', 'max:255'],
            'body' => ['sometimes', 'string'],
            'sentAt' => ['sometimes', 'date'],
            'audience' => ['sometimes', 'in:all,batch,student'],
            'audienceId' => ['sometimes', 'nullable', 'string', 'max:100'],
            'audienceLabel' => ['sometimes', 'nullable', 'string', 'max:255'],
            'deliveryLog' => ['sometimes', 'array'],
        ]);

        $map = [
            'channel' => 'channel',
            'title' => 'title',
            'body' => 'body',
            'sentAt' => 'sent_at',
            'audience' => 'audience',
            'audienceId' => 'audience_id',
            'audienceLabel' => 'audience_label',
            'deliveryLog' => 'delivery_log',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $announcement->update($payload);

        return (new AnnouncementResource($announcement->fresh()))->response();
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json(['data' => null]);
    }
}
