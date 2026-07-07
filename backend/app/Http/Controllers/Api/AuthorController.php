<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domains\Author\Models\Author;
use App\Domains\Author\Services\AuthorService;
use App\Http\Resources\AuthorResource;
use App\Http\Resources\PostResource;
use App\Domains\Post\Services\PostService;
use App\Http\Requests\StoreAuthorRequest;
use App\Http\Requests\UpdateAuthorRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    public function __construct(
        protected AuthorService $authorService,
        protected PostService $postService
    ) {}

    /**
     * Display a listing of authors.
     */
    public function index(): JsonResponse
    {
        $authors = $this->authorService->getAllAuthors();

        return response()->json([
            'data' => AuthorResource::collection($authors),
        ]);
    }

    /**
     * Store a newly created author in storage.
     */
    public function store(StoreAuthorRequest $request): JsonResponse
    {
        $author = $this->authorService->createAuthor($request->validated());

        return response()->json([
            'message' => 'Author created successfully',
            'data' => new AuthorResource($author),
        ], 201);
    }

    /**
     * Display the specified author and their posts.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $author = $this->authorService->getAuthorBySlug($slug);

        if (!$author) {
            return response()->json([
                'message' => 'Author not found',
            ], 404);
        }

        // Retrieve published blogs (channels) written by this author
        $blogs = \App\Domains\Blog\Models\Blog::where('author_id', $author->id)
            ->with(['author', 'categories', 'tags'])
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
            'author' => new AuthorResource($author),
            'blogs' => $formattedBlogs,
        ]);
    }

    /**
     * Update the specified author in storage.
     */
    public function update(UpdateAuthorRequest $request, Author $author): JsonResponse
    {
        $updated = $this->authorService->updateAuthor($author, $request->validated());

        if (!$updated) {
            return response()->json([
                'message' => 'Failed to update author',
            ], 500);
        }

        return response()->json([
            'message' => 'Author updated successfully',
            'data' => new AuthorResource($author),
        ]);
    }

    /**
     * Remove the specified author from storage.
     */
    public function destroy(Author $author): JsonResponse
    {
        $deleted = $this->authorService->deleteAuthor($author);

        if (!$deleted) {
            return response()->json([
                'message' => 'Failed to delete author',
            ], 500);
        }

        return response()->json([
            'message' => 'Author deleted successfully',
        ]);
    }
}
