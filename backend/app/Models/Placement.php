<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Placement extends Model
{
    use HasUuids;

    protected $fillable = [
        'student',
        'student_id',
        'employer',
        'employer_id',
        'role',
        'interview_date',
        'status',
        'cv_name',
    ];

    protected function casts(): array
    {
        return [
            'interview_date' => 'date',
        ];
    }

    public function studentRelation(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function employerRelation(): BelongsTo
    {
        return $this->belongsTo(Employer::class, 'employer_id');
    }
}
