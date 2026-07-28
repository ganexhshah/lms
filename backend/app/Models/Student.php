<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasUuids;

    protected $fillable = [
        'student_code',
        'first_name',
        'last_name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'city',
        'course',
        'batch',
        'status',
        'enrolled_at',
        'photo_url',
        'blood_group',
        'nationality',
        'id_card_issued',
        'id_card_issued_at',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'enrolled_at' => 'date',
            'id_card_issued' => 'boolean',
            'id_card_issued_at' => 'datetime',
        ];
    }

    public function emergencyContacts(): HasMany
    {
        return $this->hasMany(EmergencyContact::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(StudentDocument::class);
    }

    public function history(): HasMany
    {
        return $this->hasMany(StudentHistory::class)->orderByDesc('date');
    }

    public function batches(): BelongsToMany
    {
        return $this->belongsToMany(Batch::class, 'batch_student')
            ->withPivot('enrolled_at')
            ->withTimestamps();
    }

    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class);
    }

    public function logHistory(string $category, string $title, string $detail = ''): StudentHistory
    {
        return $this->history()->create([
            'category' => $category,
            'title' => $title,
            'detail' => $detail,
            'date' => now(),
        ]);
    }
}
