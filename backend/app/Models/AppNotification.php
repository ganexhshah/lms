<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AppNotification extends Model
{
    use HasUuids;

    protected $table = 'app_notifications';

    protected $fillable = [
        'title',
        'body',
        'read',
        'href',
    ];

    protected function casts(): array
    {
        return [
            'read' => 'boolean',
        ];
    }
}
