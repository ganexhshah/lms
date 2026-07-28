<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceSession extends Model
{
    use HasUuids;

    protected $fillable = [
        'date',
        'batch',
        'batch_id',
        'course',
        'present',
        'absent',
        'method',
        'notified_at',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'notified_at' => 'datetime',
            'present' => 'integer',
            'absent' => 'integer',
        ];
    }

    public function records(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class, 'session_id');
    }
}
