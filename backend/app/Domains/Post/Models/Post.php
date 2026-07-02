<?php

declare(strict_types=1);

namespace App\Domains\Post\Models;

use App\Domains\Author\Models\Author;
use App\Domains\Blog\Models\Blog;
use App\Domains\Category\Models\Category;
use App\Domains\Comment\Models\Comment;
use App\Domains\Tag\Models\Tag;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'blog_id',
        'author_id',
        'title',
        'slug',
        'short_description',
        'content',
        'read_time',
        'meta_title',
        'meta_description',
        'meta_keywords',
        
        // Image columns
        'image_url',
        'image_alt',
        'image_caption',
        'thumbnail_url',
        'thumbnail_alt',
        'gallery',

        // Flags & priority
        'is_published',
        'is_featured',
        'priority',
        'allow_comments',
        
        'published_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'gallery' => 'array',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'allow_comments' => 'boolean',
        'priority' => 'integer',
        'published_at' => 'datetime',
    ];

    /**
     * Get the blog this post belongs to.
     *
     * @return BelongsTo<Blog, $this>
     */
    public function blog(): BelongsTo
    {
        return $this->belongsTo(Blog::class, 'blog_id');
    }

    /**
     * Get the author who wrote this post.
     *
     * @return BelongsTo<Author, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class, 'author_id');
    }



    /**
     * Scope a query to only include published posts.
     *
     * @param Builder<Post> $query
     * @return Builder<Post>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope a query to only include featured posts.
     *
     * @param Builder<Post> $query
     * @return Builder<Post>
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }
}
