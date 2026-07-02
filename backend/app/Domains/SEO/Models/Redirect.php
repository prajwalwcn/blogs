<?php

declare(strict_types=1);

namespace App\Domains\SEO\Models;

use Illuminate\Database\Eloquent\Model;

class Redirect extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'source_url',
        'destination_url',
        'status_code',
    ];
}
