<?php

declare(strict_types=1);

namespace App\Domains\Post\Services;

use App\Domains\Post\Models\Post;
use App\Domains\Post\Repositories\PostRepository;
use App\Domains\SEO\Repositories\RedirectRepository;
use App\Domains\Blog\Models\Blog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PostService
{
    public function __construct(
        protected PostRepository $postRepository,
        protected RedirectRepository $redirectRepository
    ) {}

    /**
     * Get paginated published/all posts.
     */
    public function getPublishedPosts(
        int $perPage = 10,
        ?string $search = null,
        ?int $authorId = null,
        ?int $categoryId = null,
        ?int $tagId = null,
        ?int $blogId = null,
        bool $onlyPublished = true
    ): LengthAwarePaginator {
        return $this->postRepository->getPublishedPaginated($perPage, $search, $authorId, $categoryId, $tagId, $blogId, $onlyPublished);
    }

    /**
     * Get single published post by slug.
     */
    public function getPostBySlug(string $slug): ?Post
    {
        return $this->postRepository->findPublishedBySlug($slug);
    }

    /**
     * Get related posts for a given post.
     *
     * @return Collection<int, Post>
     */
    public function getRelatedPosts(Post $post, int $limit = 3): Collection
    {
        return $this->postRepository->getRelatedPosts($post, $limit);
    }

    /**
     * Create a new post.
     */
    public function createPost(array $data): Post
    {
        if (isset($data['blog_id'])) {
            $blog = Blog::find($data['blog_id']);
            if ($blog && $blog->author_id) {
                $data['author_id'] = $blog->author_id;
            }
        }

        if (isset($data['is_published']) && $data['is_published'] && !isset($data['published_at'])) {
            $data['published_at'] = now();
        }

        return $this->postRepository->create($data);
    }

    /**
     * Update an existing post.
     */
    public function updatePost(Post $post, array $data): bool
    {
        return DB::transaction(function () use ($post, $data) {
            $oldSlug = $post->slug;
            $newSlug = $data['slug'] ?? null;

            if (isset($data['blog_id'])) {
                $blog = Blog::find($data['blog_id']);
                if ($blog && $blog->author_id) {
                    $data['author_id'] = $blog->author_id;
                }
            }

            if (isset($data['is_published']) && $data['is_published'] && !$post->is_published && !isset($data['published_at'])) {
                $data['published_at'] = now();
            }

            $updated = $this->postRepository->update($post, $data);

            if ($updated) {
                if ($newSlug && $oldSlug !== $newSlug) {
                    // Generate automatic 301 redirect
                    $blogSlug = $post->blog ? $post->blog->slug : 'default';
                    $sourceUrl = "/blogs/{$blogSlug}/{$oldSlug}";
                    $destinationUrl = "/blogs/{$blogSlug}/{$newSlug}";

                    // Check if redirect already exists to avoid duplicates
                    $exists = $this->redirectRepository->findBySourceUrl($sourceUrl);
                    if (!$exists) {
                        $this->redirectRepository->create([
                            'source_url' => $sourceUrl,
                            'destination_url' => $destinationUrl,
                            'status_code' => 301,
                        ]);
                    }
                }
            }

            return $updated;
        });
    }

    /**
     * Delete a post.
     */
    public function deletePost(Post $post): bool
    {
        return $this->postRepository->delete($post);
    }
}
