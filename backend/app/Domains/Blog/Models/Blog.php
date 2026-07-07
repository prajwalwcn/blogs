<?php

declare(strict_types=1);

namespace App\Domains\Blog\Models;

use App\Domains\Post\Models\Post;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Blog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'author_id',
        'read_time',
        'name',
        'slug',
        'excerpt',
        'description',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'image_url',
        'image_alt',
        'image_caption',
        'allow_comments',
        'faq',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'allow_comments' => 'boolean',
        'faq' => 'array',
        'description' => 'array',
    ];

    /**
     * Get the author of this blog.
     */
    public function author(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Domains\Author\Models\Author::class, 'author_id');
    }

    /**
     * Get posts belonging to this blog.
     *
     * @return HasMany<Post, $this>
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'blog_id');
    }

    /**
     * Get the categories associated with this blog.
     */
    public function categories(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(\App\Domains\Category\Models\Category::class, 'category_blog');
    }

    /**
     * Get the tags associated with this blog.
     */
    public function tags(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(\App\Domains\Tag\Models\Tag::class, 'blog_tag');
    }

    /**
     * Get comments for this blog.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(\App\Domains\Comment\Models\Comment::class, 'blog_id');
    }
}
