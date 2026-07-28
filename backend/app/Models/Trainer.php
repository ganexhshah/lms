<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trainer extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'specialty',
        'status',
        'salary',
        'rating',
        'schedule',
    ];

    protected function casts(): array
    {
        return [
            'salary' => 'integer',
            'rating' => 'decimal:2',
        ];
    }

    public function scheduleSlots(): HasMany
    {
        return $this->hasMany(TrainerScheduleSlot::class);
    }

    public function salaryHistory(): HasMany
    {
        return $this->hasMany(TrainerSalaryEntry::class)->orderByDesc('date');
    }

    public function ratingHistory(): HasMany
    {
        return $this->hasMany(TrainerRatingEvent::class)->orderByDesc('date');
    }
}
