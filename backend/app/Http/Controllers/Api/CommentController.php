<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domains\Comment\Services\CommentService;
use App\Http\Requests\StoreCommentRequest;
use Illuminate\Http\JsonResponse;

class CommentController extends Controller
{
    public function __construct(
        protected CommentService $commentService
    ) {}

    /**
     * Display approved comments for a specific blog.
     */
    public function index(int $blogId): JsonResponse
    {
        $comments = $this->commentService->getCommentsForBlog($blogId);

        return response()->json([
            'data' => $comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'name' => $comment->name,
                    'content' => $comment->content,
                    'created_at' => $comment->created_at->toIso8601String(),
                ];
            }),
        ]);
    }

    /**
     * Store a comment for moderation.
     */
    public function store(StoreCommentRequest $request): JsonResponse
    {
        $comment = $this->commentService->addComment($request->validated());

        return response()->json([
            'message' => 'Comment submitted successfully and is awaiting moderation.',
            'data' => [
                'id' => $comment->id,
                'name' => $comment->name,
                'created_at' => $comment->created_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Get all comments for admin moderation (both approved and pending).
     */
    public function adminIndex(): JsonResponse
    {
        $comments = \App\Domains\Comment\Models\Comment::with('blog')->latest()->get();

        return response()->json([
            'data' => $comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'name' => $comment->name,
                    'email' => $comment->email,
                    'content' => $comment->content,
                    'is_approved' => $comment->is_approved,
                    'created_at' => $comment->created_at->toIso8601String(),
                    'blog' => $comment->blog ? [
                        'id' => $comment->blog->id,
                        'name' => $comment->blog->name,
                        'slug' => $comment->blog->slug,
                    ] : null,
                ];
            }),
        ]);
    }

    /**
     * Approve the specified comment.
     */
    public function approve(int $id): JsonResponse
    {
        $comment = $this->commentService->findCommentById($id);

        if (!$comment) {
            return response()->json([
                'message' => 'Comment not found',
            ], 404);
        }

        $approved = $this->commentService->approveComment($comment);

        if (!$approved) {
            return response()->json([
                'message' => 'Failed to approve comment',
            ], 500);
        }

        return response()->json([
            'message' => 'Comment approved successfully',
        ]);
    }

    /**
     * Delete the specified comment from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $comment = $this->commentService->findCommentById($id);

        if (!$comment) {
            return response()->json([
                'message' => 'Comment not found',
            ], 404);
        }

        $deleted = $this->commentService->deleteComment($comment);

        if (!$deleted) {
            return response()->json([
                'message' => 'Failed to delete comment',
            ], 500);
        }

        return response()->json([
            'message' => 'Comment deleted successfully',
        ]);
    }
}
