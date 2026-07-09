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

        // Retrieve published blogs (channels) containing this tag
        $blogs = \App\Domains\Blog\Models\Blog::whereHas('tags', function ($query) use ($tag) {
            $query->where('tags.id', $tag->id);
        })
        ->with(['author', 'categories', 'tags'])
        ->orderBy('priority', 'asc')
        ->orderBy('created_at', 'desc')
        ->get();

        $formattedBlogs = $blogs->map(function ($blog) {
            return [
                'id' => $blog->id,
                'name' => $blog->name,
                'slug' => $blog->slug,
                'excerpt' => $blog->excerpt,
                'description' => $blog->description,
                'read_time' => $blog->read_time,
                'author_id' => $blog->author_id,
                'author' => $blog->author ? [
                    'id' => $blog->author->id,
                    'name' => $blog->author->name,
                    'slug' => $blog->author->slug,
                    'avatar_url' => $blog->author->image_url,
                ] : null,
                'meta_title' => $blog->meta_title,
                'meta_description' => $blog->meta_description,
                'meta_keywords' => $blog->meta_keywords,
                'image_url' => $blog->image_url,
                'image' => [
                    'url' => $blog->image_url,
                    'alt' => $blog->image_alt,
                    'caption' => $blog->image_caption,
                ],
                'categories' => $blog->categories->map(function ($cat) {
                    return [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                    ];
                })->values()->toArray(),
                'tags' => $blog->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'slug' => $tag->slug,
                    ];
                })->values()->toArray(),
                'created_at' => $blog->created_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'tag' => [
                'id' => $tag->id,
                'name' => $tag->name,
                'slug' => $tag->slug,
            ],
            'blogs' => $formattedBlogs,
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
