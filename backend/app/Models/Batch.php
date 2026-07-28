<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Batch extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'course',
        'course_id',
        'shift',
        'capacity',
        'start_date',
        'end_date',
        'progress',
        'trainer',
        'trainer_id',
        'room',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'capacity' => 'integer',
            'progress' => 'integer',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'batch_student')
            ->withPivot('enrolled_at')
            ->withTimestamps();
    }

    public function transfersFrom(): HasMany
    {
        return $this->hasMany(BatchTransfer::class, 'from_batch_id');
    }

    public function transfersTo(): HasMany
    {
        return $this->hasMany(BatchTransfer::class, 'to_batch_id');
    }

    /**
     * All transfers touching this batch, either as source or destination.
     */
    public function getTransfersAttribute(): Collection
    {
        return BatchTransfer::query()
            ->where('from_batch_id', $this->id)
            ->orWhere('to_batch_id', $this->id)
            ->orderByDesc('date')
            ->get();
    }
}
