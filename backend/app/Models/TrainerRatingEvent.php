<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainerRatingEvent extends Model
{
    use HasUuids;

    protected $fillable = [
        'trainer_id',
        'date',
        'score',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'score' => 'decimal:2',
        ];
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(Trainer::class);
    }
}
