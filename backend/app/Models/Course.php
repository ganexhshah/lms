<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasUuids;

    protected $attributes = [
        'syllabus' => '[]',
        'trainers' => '[]',
        'materials' => '[]',
    ];

    protected $fillable = [
        'code',
        'title',
        'description',
        'duration_weeks',
        'duration_hours',
        'level',
        'status',
        'fee',
        'installments',
        'discount_notes',
        'syllabus',
        'trainers',
        'materials',
    ];

    protected function casts(): array
    {
        return [
            'duration_weeks' => 'integer',
            'duration_hours' => 'integer',
            'fee' => 'integer',
            'installments' => 'integer',
            'syllabus' => 'array',
            'trainers' => 'array',
            'materials' => 'array',
        ];
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }
}
