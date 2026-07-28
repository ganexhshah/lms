<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employer extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'contact',
        'email',
        'city',
    ];

    public function placements(): HasMany
    {
        return $this->hasMany(Placement::class);
    }
}
