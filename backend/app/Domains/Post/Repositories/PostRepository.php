<?php

declare(strict_types=1);

namespace App\Domains\Post\Repositories;

use App\Domains\Post\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PostRepository
{
    /**
     * Get posts (paginated), sorted by is_featured, priority, and published date.
     */
    public function getPublishedPaginated(
        int $perPage = 10,
        ?string $search = null,
        ?int $authorId = null,
        ?int $categoryId = null,
        ?int $tagId = null,
        ?int $blogId = null,
        bool $onlyPublished = true
    ): LengthAwarePaginator {
        $query = Post::query()->with('author');

        if ($onlyPublished) {
            $query->published();
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($blogId) {
            $query->where('blog_id', $blogId);
        }

        if ($authorId) {
            $query->where('author_id', $authorId);
        }

        if ($categoryId) {
            $query->whereHas('blog.categories', function ($q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            });
        }

        if ($tagId) {
            $query->whereHas('blog.tags', function ($q) use ($tagId) {
                $q->where('tags.id', $tagId);
            });
        }

        return $query->orderByDesc('is_featured')
            ->orderByDesc('priority')
            ->latest('published_at')
            ->latest('created_at')
            ->paginate($perPage);
    }

    /**
     * Find a published post by slug.
     */
    public function findPublishedBySlug(string $slug): ?Post
    {
        return Post::published()
            ->with('author')
            ->where('slug', $slug)
            ->first();
    }

    /**
     * Find any post by slug.
     */
    public function findBySlug(string $slug): ?Post
    {
        return Post::with('author')->where('slug', $slug)->first();
    }

    /**
     * Get related published posts.
     *
     * @return Collection<int, Post>
     */
    public function getRelatedPosts(Post $post, int $limit = 3): Collection
    {
        return Post::published()
            ->with('author')
            ->where('id', '!=', $post->id)
            ->where('blog_id', $post->blog_id)
            ->limit($limit)
            ->get();
    }

    /**
     * Get all published posts (for sitemaps).
     *
     * @return Collection<int, Post>
     */
    public function getAllPublished(): Collection
    {
        return Post::published()
            ->with('author')
            ->orderByDesc('priority')
            ->latest('published_at')
            ->get();
    }

    /**
     * Create a post.
     */
    public function create(array $attributes): Post
    {
        return Post::create($attributes);
    }

    /**
     * Update a post.
     */
    public function update(Post $post, array $attributes): bool
    {
        return $post->update($attributes);
    }

    /**
     * Delete a post.
     */
    public function delete(Post $post): bool
    {
        return (bool) $post->delete();
    }
}
