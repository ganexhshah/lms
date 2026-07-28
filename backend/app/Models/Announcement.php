<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasUuids;

    protected $attributes = [
        'delivery_log' => '[]',
    ];

    protected $fillable = [
        'channel',
        'title',
        'body',
        'sent_at',
        'audience',
        'audience_id',
        'audience_label',
        'delivery_log',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'delivery_log' => 'array',
        ];
    }
}
