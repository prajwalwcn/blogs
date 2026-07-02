<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domains\Tag\Models\Tag;
use App\Domains\Tag\Services\TagService;
use App\Domains\Post\Services\PostService;
use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Http\Resources\PostResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function __construct(
        protected TagService $tagService,
        protected PostService $postService
    ) {}

    /**
     * Display a listing of tags.
     */
    public function index(): JsonResponse
    {
        $tags = $this->tagService->getAllTags();

        return response()->json([
            'data' => $tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                ];
            }),
        ]);
    }

    /**
     * Store a newly created tag in storage.
     */
    public function store(StoreTagRequest $request): JsonResponse
    {
        $tag = $this->tagService->createTag($request->validated());

        return response()->json([
            'message' => 'Tag created successfully',
            'data' => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ],
        ], 201);
    }

    /**
     * Display the specified tag and its posts.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $tag = $this->tagService->getTagBySlug($slug);

        if (!$tag) {
            return response()->json([
                'message' => 'Tag not found',
            ], 404);
        }

        $perPage = $request->query('limit') ? (int) $request->query('limit') : 10;
        $posts = $this->postService->getPublishedPosts($perPage, null, null, null, $tag->id);

        return response()->json([
            'tag' => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ],
            'posts' => PostResource::collection($posts),
        ]);
    }

    /**
     * Update the specified tag in storage.
     */
    public function update(UpdateTagRequest $request, Tag $tag): JsonResponse
    {
        $updated = $this->tagService->updateTag($tag, $request->validated());

        if (!$updated) {
            return response()->json([
                'message' => 'Failed to update tag',
            ], 500);
        }

        return response()->json([
            'message' => 'Tag updated successfully',
            'data' => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ],
        ]);
    }

    /**
     * Remove the specified tag from storage.
     */
    public function destroy(Tag $tag): JsonResponse
    {
        $deleted = $this->tagService->deleteTag($tag);

        if (!$deleted) {
            return response()->json([
                'message' => 'Failed to delete tag',
            ], 500);
        }

        return response()->json([
            'message' => 'Tag deleted successfully',
        ]);
    }
}
