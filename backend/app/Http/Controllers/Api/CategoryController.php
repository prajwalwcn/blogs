<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domains\Category\Models\Category;
use App\Domains\Category\Services\CategoryService;
use App\Domains\Post\Services\PostService;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\PostResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $categoryService,
        protected PostService $postService
    ) {}

    /**
     * Display a listing of categories.
     */
    public function index(): JsonResponse
    {
        $categories = $this->categoryService->getAllCategories();

        return response()->json([
            'data' => $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                ];
            }),
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->createCategory($request->validated());

        return response()->json([
            'message' => 'Category created successfully',
            'data' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
            ],
        ], 201);
    }

    /**
     * Display the specified category and its published posts.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $category = $this->categoryService->getCategoryBySlug($slug);

        if (!$category) {
            return response()->json([
                'message' => 'Category not found',
            ], 404);
        }

        $perPage = $request->query('limit') ? (int) $request->query('limit') : 10;
        $posts = $this->postService->getPublishedPosts($perPage, null, null, $category->id);

        return response()->json([
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
            ],
            'posts' => PostResource::collection($posts),
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $updated = $this->categoryService->updateCategory($category, $request->validated());

        if (!$updated) {
            return response()->json([
                'message' => 'Failed to update category',
            ], 500);
        }

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
            ],
        ]);
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category): JsonResponse
    {
        $deleted = $this->categoryService->deleteCategory($category);

        if (!$deleted) {
            return response()->json([
                'message' => 'Failed to delete category',
            ], 500);
        }

        return response()->json([
            'message' => 'Category deleted successfully',
        ]);
    }
}
