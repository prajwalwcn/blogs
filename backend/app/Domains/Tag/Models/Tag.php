<?php

declare(strict_types=1);

namespace App\Domains\Tag\Models;

use App\Domains\Post\Models\Post;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
    ];

    /**
     * Get blogs associated with this tag.
     *
     * @return BelongsToMany<\App\Domains\Blog\Models\Blog, $this>
     */
    public function blogs(): BelongsToMany
    {
        return $this->belongsToMany(\App\Domains\Blog\Models\Blog::class, 'blog_tag');
    }
}
