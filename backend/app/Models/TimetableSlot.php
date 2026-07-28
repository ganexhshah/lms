<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimetableSlot extends Model
{
    use HasUuids;

    protected $fillable = [
        'day',
        'time',
        'course',
        'batch',
        'batch_id',
        'trainer',
        'trainer_id',
        'room',
    ];

    public function batchRelation(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'batch_id');
    }

    public function trainerRelation(): BelongsTo
    {
        return $this->belongsTo(Trainer::class, 'trainer_id');
    }
}
