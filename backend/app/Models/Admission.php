<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Admission extends Model
{
    use HasUuids;

    protected $fillable = [
        'application_code',
        'first_name',
        'last_name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'city',
        'course',
        'preferred_batch',
        'status',
        'source',
        'lead_notes',
        'next_follow_up',
        'assigned_batch',
        'assigned_batch_id',
        'waiting_position',
        'rejection_reason',
        'student_id',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'next_follow_up' => 'date',
            'waiting_position' => 'integer',
        ];
    }

    public function history(): HasMany
    {
        return $this->hasMany(AdmissionHistory::class)->orderByDesc('date');
    }

    public function assignedBatch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'assigned_batch_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function logHistory(string $title, string $detail = ''): AdmissionHistory
    {
        return $this->history()->create([
            'title' => $title,
            'detail' => $detail,
            'date' => now(),
        ]);
    }
}
