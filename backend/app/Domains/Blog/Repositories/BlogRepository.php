<?php

declare(strict_types=1);

namespace App\Domains\Blog\Repositories;

use App\Domains\Blog\Models\Blog;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class BlogRepository
{
    /**
     * Get all blogs with caching.
     *
     * @return Collection<int, Blog>
     */
    public function all(): Collection
    {
        return Cache::remember('blogs:all', 86400, function () {
            return Blog::with(['author', 'categories', 'tags'])->get();
        });
    }

    /**
     * Find a blog by slug with caching.
     */
    public function findBySlug(string $slug): ?Blog
    {
        return Cache::remember("blogs:slug:{$slug}", 86400, function () use ($slug) {
            return Blog::with(['author', 'categories', 'tags'])->where('slug', $slug)->first();
        });
    }

    /**
     * Find a blog by ID.
     */
    public function find(int $id): ?Blog
    {
        return Blog::find($id);
    }

    /**
     * Create a blog and clear cache.
     */
    public function create(array $attributes): Blog
    {
        $blog = Blog::create($attributes);
        $this->clearCache($blog);
        return $blog;
    }

    /**
     * Update a blog and clear cache.
     */
    public function update(Blog $blog, array $attributes): bool
    {
        $oldSlug = $blog->slug;
        $updated = $blog->update($attributes);
        if ($updated) {
            $this->clearCache($blog, $oldSlug);
        }
        return $updated;
    }

    /**
     * Delete a blog and clear cache.
     */
    public function delete(Blog $blog): bool
    {
        $oldSlug = $blog->slug;
        $deleted = (bool) $blog->delete();
        if ($deleted) {
            $this->clearCache($blog, $oldSlug);
        }
        return $deleted;
    }

    /**
     * Clear all blog related caches.
     */
    protected function clearCache(Blog $blog, ?string $oldSlug = null): void
    {
        Cache::forget('blogs:all');
        Cache::forget("blogs:slug:{$blog->slug}");
        if ($oldSlug && $oldSlug !== $blog->slug) {
            Cache::forget("blogs:slug:{$oldSlug}");
        }
    }
}
