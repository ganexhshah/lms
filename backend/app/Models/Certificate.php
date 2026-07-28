<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Certificate extends Model
{
    use HasUuids;

    protected $fillable = [
        'number',
        'student',
        'student_id',
        'course',
        'issued_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'date',
        ];
    }

    public function verifyLog(): HasMany
    {
        return $this->hasMany(CertificateVerifyLog::class)->orderByDesc('verified_at');
    }
}
