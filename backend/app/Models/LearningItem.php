<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LearningItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'type',
        'course',
        'progress',
        'status',
        'url',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'progress' => 'integer',
        ];
    }
}
