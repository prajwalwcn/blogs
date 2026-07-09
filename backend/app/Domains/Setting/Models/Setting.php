<?php

declare(strict_types=1);

namespace App\Domains\Setting\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_name',
        'site_tagline',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'logo_url',
        'favicon_url',
        'emails',
        'phones',
        'social_links',
        'address',
        'office_hours',
        'google_map_iframe',
        'enable_voice_reader',
    ];

    protected $casts = [
        'emails' => 'array',
        'phones' => 'array',
        'social_links' => 'array',
        'enable_voice_reader' => 'boolean',
    ];
}
