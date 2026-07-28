<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LandingSettingResource;
use App\Models\LandingSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LandingController extends Controller
{
    public function show(): JsonResponse
    {
        return (new LandingSettingResource(LandingSetting::current()))->response();
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'brandName' => ['sometimes', 'string', 'max:255'],
            'heroEyebrow' => ['sometimes', 'string', 'max:255'],
            'heroHeadline' => ['sometimes', 'string', 'max:255'],
            'heroSubtext' => ['sometimes', 'string'],
            'discountBadge' => ['sometimes', 'string', 'max:255'],
            'aboutTitle' => ['sometimes', 'string', 'max:255'],
            'aboutSubtitle' => ['sometimes', 'string', 'max:255'],
            'aboutBody' => ['sometimes', 'string'],
            'aboutImage1' => ['sometimes', 'string', 'max:2048'],
            'aboutImage2' => ['sometimes', 'string', 'max:2048'],
            'eventsTitle' => ['sometimes', 'string', 'max:255'],
            'eventsSubtitle' => ['sometimes', 'string', 'max:255'],
            'eventsBody' => ['sometimes', 'string'],
            'coursesSectionEyebrow' => ['sometimes', 'string', 'max:255'],
            'coursesSectionTitle' => ['sometimes', 'string', 'max:255'],
            'contactTitle' => ['sometimes', 'string', 'max:255'],
            'contactSubtext' => ['sometimes', 'string'],
            'footerBlurb' => ['sometimes', 'string'],
            'miniCourses' => ['sometimes', 'array'],
            'miniCourses.*.id' => ['required_with:miniCourses', 'string'],
            'miniCourses.*.label' => ['required_with:miniCourses', 'string'],
            'miniCourses.*.days' => ['required_with:miniCourses', 'string'],
            'miniCourses.*.price' => ['required_with:miniCourses', 'string'],
            'miniCourses.*.was' => ['nullable', 'string'],
            'miniCourses.*.blurb' => ['nullable', 'string'],
            'testimonials' => ['sometimes', 'array'],
            'testimonials.*.id' => ['required_with:testimonials', 'string'],
            'testimonials.*.quote' => ['required_with:testimonials', 'string'],
            'testimonials.*.name' => ['required_with:testimonials', 'string'],
            'testimonials.*.role' => ['nullable', 'string'],
            'testimonials.*.company' => ['nullable', 'string'],
            'featuredCourseIds' => ['sometimes', 'array'],
            'featuredCourseIds.*' => ['string'],
            'courseMeta' => ['sometimes', 'array'],
        ]);

        $setting = LandingSetting::current();
        $content = array_merge($setting->content ?? LandingSetting::defaultContent(), $data);

        if (array_key_exists('featuredCourseIds', $data)) {
            $content['featuredCourseIds'] = array_values($data['featuredCourseIds']);
        }

        if (array_key_exists('courseMeta', $data)) {
            $content['courseMeta'] = $data['courseMeta'];
        }

        $setting->update(['content' => $content]);

        return (new LandingSettingResource($setting->fresh()))->response();
    }
}
