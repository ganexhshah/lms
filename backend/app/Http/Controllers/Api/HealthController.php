<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Throwable;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $db = false;
        $redis = false;

        try {
            DB::connection()->getPdo();
            DB::select('select 1');
            $db = true;
        } catch (Throwable) {
            $db = false;
        }

        try {
            Redis::connection()->ping();
            $redis = true;
        } catch (Throwable) {
            $redis = false;
        }

        $ok = $db && $redis;

        return response()->json([
            'status' => $ok ? 'ok' : 'degraded',
            'db' => $db,
            'redis' => $redis,
            'app' => config('app.name'),
        ], $ok ? 200 : 503);
    }
}
