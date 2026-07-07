<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domains\Blog\Models\Blog;
use App\Domains\Blog\Services\BlogService;
use App\Domains\Post\Services\PostService;
use App\Domains\SEO\Services\SEOService;
use App\Http\Requests\StoreBlogRequest;
use App\Http\Requests\UpdateBlogRequest;
use App\Http\Resources\PostResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function __construct(
        protected BlogService $blogService,
        protected PostService $postService
    ) {}

    /**
     * Display a list of all blogs.
     */
    public function index(): JsonResponse
    {
        $blogs = $this->blogService->getAllBlogs();
        $seoService = app(SEOService::class);

        return response()->json([
            'data' => $blogs->map(function ($blog) use ($seoService) {
                $categories = $blog->categories->map(function ($cat) {
                    return [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'slug' => $cat->slug,
                    ];
                })->values()->toArray();

                $tags = $blog->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'slug' => $tag->slug,
                    ];
                })->values()->toArray();

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
                    'image_alt' => $blog->image_alt,
                    'image_caption' => $blog->image_caption,
                    'image' => [
                        'url' => $blog->image_url,
                        'alt' => $blog->image_alt,
                        'caption' => $blog->image_caption,
                    ],
                    'allow_comments' => $blog->allow_comments,
                    'faq' => $blog->faq ?: [],
                    'categories' => $categories,
                    'tags' => $tags,
                    'seo' => $seoService->getBlogSEO($blog),
                ];
            }),
        ]);
    }

    /**
     * Store a newly created blog in storage.
     */
    public function store(StoreBlogRequest $request): JsonResponse
    {
        $blog = $this->blogService->createBlog($request->validated());
        $blog->load(['author', 'categories', 'tags']);
        $seoService = app(SEOService::class);

        return response()->json([
            'message' => 'Blog created successfully',
            'data' => [
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
                'image_alt' => $blog->image_alt,
                'image_caption' => $blog->image_caption,
                'image' => [
                    'url' => $blog->image_url,
                    'alt' => $blog->image_alt,
                    'caption' => $blog->image_caption,
                ],
                'allow_comments' => $blog->allow_comments,
                'faq' => $blog->faq ?: [],
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
                'seo' => $seoService->getBlogSEO($blog),
            ],
        ], 201);
    }

    /**
     * Display a specific blog and its associated posts.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $blog = $this->blogService->getBlogBySlug($slug);

        if (!$blog) {
            return response()->json([
                'message' => 'Blog not found',
            ], 404);
        }

        $perPage = $request->query('limit') ? (int) $request->query('limit') : 10;
        $search = $request->query('search');
        $authorId = $request->query('author_id') ? (int) $request->query('author_id') : null;
        $categoryId = $request->query('category_id') ? (int) $request->query('category_id') : null;
        $tagId = $request->query('tag_id') ? (int) $request->query('tag_id') : null;

        // Retrieve posts belonging specifically to this blog
        $posts = $this->postService->getPublishedPosts(
            $perPage,
            $search,
            $authorId,
            $categoryId,
            $tagId,
            $blog->id
        );

        $seoService = app(SEOService::class);

        return response()->json([
            'blog' => [
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
                'image' => [
                    'url' => $blog->image_url,
                    'alt' => $blog->image_alt,
                    'caption' => $blog->image_caption,
                ],
                'allow_comments' => $blog->allow_comments,
                'faq' => $blog->faq ?: [],
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
                'seo' => $seoService->getBlogSEO($blog),
            ],
            'posts' => PostResource::collection($posts)->response()->getData(true),
        ]);
    }

    /**
     * Update the specified blog in storage.
     */
    public function update(UpdateBlogRequest $request, Blog $blog): JsonResponse
    {
        $updated = $this->blogService->updateBlog($blog, $request->validated());

        if (!$updated) {
            return response()->json([
                'message' => 'Failed to update blog',
            ], 500);
        }

        $blog->load(['author', 'categories', 'tags']);
        $seoService = app(SEOService::class);

        return response()->json([
            'message' => 'Blog updated successfully',
            'data' => [
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
                'image_alt' => $blog->image_alt,
                'image_caption' => $blog->image_caption,
                'image' => [
                    'url' => $blog->image_url,
                    'alt' => $blog->image_alt,
                    'caption' => $blog->image_caption,
                ],
                'allow_comments' => $blog->allow_comments,
                'faq' => $blog->faq ?: [],
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
                'seo' => $seoService->getBlogSEO($blog),
            ],
        ]);
    }

    /**
     * Remove the specified blog from storage.
     */
    public function destroy(Blog $blog): JsonResponse
    {
        $deleted = $this->blogService->deleteBlog($blog);

        if (!$deleted) {
            return response()->json([
                'message' => 'Failed to delete blog',
            ], 500);
        }

        return response()->json([
            'message' => 'Blog deleted successfully',
        ]);
    }
}
