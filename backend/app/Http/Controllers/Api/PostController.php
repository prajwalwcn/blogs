<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domains\Post\Models\Post;
use App\Domains\Post\Services\PostService;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Http\Resources\PostDetailResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostController extends Controller
{
    public function __construct(
        protected PostService $postService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $search = $request->query('search');
        $authorId = $request->query('author_id') ? (int) $request->query('author_id') : null;
        $categoryId = $request->query('category_id') ? (int) $request->query('category_id') : null;
        $blogId = $request->query('blog_id') ? (int) $request->query('blog_id') : null;
        $perPage = $request->query('limit') ? (int) $request->query('limit') : 10;

        $onlyPublished = true;
        if ($request->has('all') || auth('sanctum')->check()) {
            $onlyPublished = false;
        }

        $posts = $this->postService->getPublishedPosts($perPage, $search, $authorId, $categoryId, null, $blogId, $onlyPublished);

        return PostResource::collection($posts);
    }

    /**
     * Store a newly created post in storage.
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        $post = $this->postService->createPost($request->validated());

        return response()->json([
            'message' => 'Post created successfully',
            'data' => new PostDetailResource($post->load(['author'])),
        ], 201);
    }

    /**
     * Display the specified post.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $post = null;
        $user = null;

        $token = $request->bearerToken();
        if ($token) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($accessToken && $accessToken->tokenable) {
                $user = $accessToken->tokenable;
            }
        }

        if ($user) {
            // First search by slug
            $post = \App\Domains\Post\Models\Post::with(['author'])->where('slug', $slug)->first();
            
            // If not found, try to find by ID
            if (!$post && is_numeric($slug)) {
                $post = \App\Domains\Post\Models\Post::with(['author'])->find((int)$slug);
            }
        } else {
            $post = $this->postService->getPostBySlug($slug);
        }

        if (!$post) {
            return response()->json([
                'message' => 'Post not found',
            ], 404);
        }

        // Fetch related posts (only published ones)
        $relatedPosts = $this->postService->getRelatedPosts($post);

        return response()->json([
            'data' => new PostDetailResource($post),
            'related' => PostResource::collection($relatedPosts),
        ]);
    }

    /**
     * Update the specified post in storage.
     */
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $updated = $this->postService->updatePost($post, $request->validated());

        if (!$updated) {
            return response()->json([
                'message' => 'Failed to update post',
            ], 500);
        }

        return response()->json([
            'message' => 'Post updated successfully',
            'data' => new PostDetailResource($post->load(['author'])),
        ]);
    }

    /**
     * Remove the specified post from storage.
     */
    public function destroy(Post $post): JsonResponse
    {
        $deleted = $this->postService->deletePost($post);

        if (!$deleted) {
            return response()->json([
                'message' => 'Failed to delete post',
            ], 500);
        }

        return response()->json([
            'message' => 'Post deleted successfully',
        ]);
    }
}
