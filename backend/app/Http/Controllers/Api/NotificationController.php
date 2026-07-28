<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppNotificationResource;
use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        return AppNotificationResource::collection(
            AppNotification::query()->latest('created_at')->get()
        )->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'href' => ['nullable', 'string', 'max:255'],
            'read' => ['nullable', 'boolean'],
        ]);

        $notification = AppNotification::create([
            'title' => $data['title'],
            'body' => $data['body'],
            'href' => $data['href'] ?? null,
            'read' => $data['read'] ?? false,
        ]);

        return (new AppNotificationResource($notification))->response()->setStatusCode(201);
    }

    public function markRead(AppNotification $notification): JsonResponse
    {
        $notification->update(['read' => true]);

        return (new AppNotificationResource($notification->fresh()))->response();
    }

    public function markAllRead(): JsonResponse
    {
        AppNotification::query()->where('read', false)->update(['read' => true]);

        return AppNotificationResource::collection(
            AppNotification::query()->latest('created_at')->get()
        )->response();
    }
}
