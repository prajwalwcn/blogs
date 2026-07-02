<?php

declare(strict_types=1);

namespace App\Domains\Comment\Services;

use App\Domains\Comment\Models\Comment;
use App\Domains\Comment\Repositories\CommentRepository;
use App\Domains\Blog\Repositories\BlogRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class CommentService
{
    public function __construct(
        protected CommentRepository $commentRepository,
        protected BlogRepository $blogRepository
    ) {}

    /**
     * Get all approved comments for a blog.
     *
     * @return Collection<int, Comment>
     */
    public function getCommentsForBlog(int $blogId): Collection
    {
        return $this->commentRepository->getApprovedForBlog($blogId);
    }

    /**
     * Add a comment to a blog.
     *
     * @throws ValidationException
     */
    public function addComment(array $data): Comment
    {
        $blogId = (int) ($data['blog_id'] ?? 0);
        
        // If blog_id is not passed but slug is, find blog
        if (!$blogId && isset($data['blog_slug'])) {
            $blog = $this->blogRepository->findBySlug($data['blog_slug']);
            if ($blog) {
                $blogId = $blog->id;
                $data['blog_id'] = $blogId;
            }
        } else {
            $blog = $this->blogRepository->find($blogId);
        }

        if (!$blog) {
            throw ValidationException::withMessages([
                'blog_id' => ['The selected blog is invalid.'],
            ]);
        }

        if (!$blog->allow_comments) {
            throw ValidationException::withMessages([
                'blog_id' => ['Comments are disabled for this blog.'],
            ]);
        }

        // Clean input
        unset($data['blog_slug']);

        return $this->commentRepository->create($data);
    }

    /**
     * Find comment by ID.
     */
    public function findCommentById(int $id): ?Comment
    {
        return $this->commentRepository->find($id);
    }

    /**
     * Approve a comment.
     */
    public function approveComment(Comment $comment): bool
    {
        return $this->commentRepository->approve($comment);
    }

    /**
     * Delete a comment.
     */
    public function deleteComment(Comment $comment): bool
    {
        return $this->commentRepository->delete($comment);
    }
}
