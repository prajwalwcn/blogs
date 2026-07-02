<?php

declare(strict_types=1);

namespace App\Domains\Comment\Models;

use App\Domains\Post\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'blog_id',
        'name',
        'email',
        'content',
        'is_approved',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_approved' => 'boolean',
    ];

    /**
     * Get the blog that this comment belongs to.
     *
     * @return BelongsTo<\App\Domains\Blog\Models\Blog, $this>
     */
    public function blog(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Blog\Models\Blog::class, 'blog_id');
    }

    /**
     * Scope a query to only include approved comments.
     *
     * @param Builder<Comment> $query
     * @return Builder<Comment>
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('is_approved', true);
    }
}
