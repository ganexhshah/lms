<?php

namespace App\Http\Resources;

use App\Models\LandingSetting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LandingSettingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $content = $this->content ?? LandingSetting::defaultContent();
        $meta = $content['courseMeta'] ?? [];
        $content['courseMeta'] = empty($meta) ? (object) [] : $meta;
        $content['featuredCourseIds'] = array_values($content['featuredCourseIds'] ?? []);

        return $content;
    }
}
