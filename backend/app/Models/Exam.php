<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'course',
        'batch',
        'batch_id',
        'type',
        'date',
        'pass_mark',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'pass_mark' => 'integer',
        ];
    }

    public function grades(): HasMany
    {
        return $this->hasMany(ExamGrade::class);
    }
}
