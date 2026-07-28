<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CanvaDesign extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'type',
        'student_id',
        'subject_key',
        'canva_design_id',
        'edit_url',
        'view_url',
        'export_url',
        'cdn_url',
        'status',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
