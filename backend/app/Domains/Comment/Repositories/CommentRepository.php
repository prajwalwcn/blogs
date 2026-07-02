<?php

declare(strict_types=1);

namespace App\Domains\Comment\Repositories;

use App\Domains\Comment\Models\Comment;
use Illuminate\Database\Eloquent\Collection;

class CommentRepository
{
    /**
     * Get approved comments for a specific blog.
     *
     * @return Collection<int, Comment>
     */
    public function getApprovedForBlog(int $blogId): Collection
    {
        return Comment::approved()->where('blog_id', $blogId)->latest()->get();
    }

    /**
     * Create a new comment.
     */
    public function create(array $attributes): Comment
    {
        return Comment::create($attributes);
    }

    /**
     * Find a comment by ID.
     */
    public function find(int $id): ?Comment
    {
        return Comment::find($id);
    }

    /**
     * Approve a comment.
     */
    public function approve(Comment $comment): bool
    {
        return $comment->update(['is_approved' => true]);
    }

    /**
     * Delete a comment.
     */
    public function delete(Comment $comment): bool
    {
        return (bool) $comment->delete();
    }
}
