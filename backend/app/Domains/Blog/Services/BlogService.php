<?php

declare(strict_types=1);

namespace App\Domains\Blog\Services;

use App\Domains\Blog\Models\Blog;
use App\Domains\Blog\Repositories\BlogRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class BlogService
{
    public function __construct(
        protected BlogRepository $blogRepository
    ) {}

    /**
     * Get all blogs.
     *
     * @return Collection<int, Blog>
     */
    public function getAllBlogs(): Collection
    {
        return $this->blogRepository->all();
    }

    /**
     * Get a blog by its slug.
     */
    public function getBlogBySlug(string $slug): ?Blog
    {
        return $this->blogRepository->findBySlug($slug);
    }

    /**
     * Create a new blog.
     */
    public function createBlog(array $data): Blog
    {
        return DB::transaction(function () use ($data) {
            $categoryIds = $data['category_ids'] ?? [];
            $tagIds = $data['tag_ids'] ?? [];
            
            unset($data['category_ids'], $data['tag_ids']);
            
            $blog = $this->blogRepository->create($data);
            
            $blog->categories()->sync($categoryIds);
            $blog->tags()->sync($tagIds);
            
            return $blog;
        });
    }

    /**
     * Update an existing blog.
     */
    public function updateBlog(Blog $blog, array $data): bool
    {
        return DB::transaction(function () use ($blog, $data) {
            $categoryIds = $data['category_ids'] ?? [];
            $tagIds = $data['tag_ids'] ?? [];
            
            unset($data['category_ids'], $data['tag_ids']);
            
            $updated = $this->blogRepository->update($blog, $data);
            
            if ($updated) {
                $blog->categories()->sync($categoryIds);
                $blog->tags()->sync($tagIds);
            }
            
            return $updated;
        });
    }

    /**
     * Delete a blog.
     */
    public function deleteBlog(Blog $blog): bool
    {
        return $this->blogRepository->delete($blog);
    }
}
