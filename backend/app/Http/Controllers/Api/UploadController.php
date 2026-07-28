<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CdnStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __construct(private CdnStorage $cdn) {}

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'max:20480'],
            'folder' => ['nullable', 'string', 'max:120', 'regex:/^[a-z0-9_\\/-]+$/i'],
        ]);

        $folder = $data['folder'] ?? 'uploads';
        $result = $this->cdn->put($request->file('file'), $folder);

        return response()->json(['data' => $result], 201);
    }
}
