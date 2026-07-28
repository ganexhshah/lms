<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Http\Resources\LandingSettingResource;
use App\Models\Course;
use App\Models\LandingSetting;
use Illuminate\Http\JsonResponse;

class PublicController extends Controller
{
    public function landing(): JsonResponse
    {
        return (new LandingSettingResource(LandingSetting::current()))->response();
    }

    public function courses(): JsonResponse
    {
        $courses = Course::query()
            ->where('status', 'active')
            ->latest('created_at')
            ->get();

        return CourseResource::collection($courses)->response();
    }

    public function course(Course $course): JsonResponse
    {
        abort_unless($course->status === 'active', 404);

        return (new CourseResource($course))->response();
    }
}
