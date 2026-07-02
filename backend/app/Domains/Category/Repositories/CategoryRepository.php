<?php

declare(strict_types=1);

namespace App\Domains\Category\Repositories;

use App\Domains\Category\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository
{
    /**
     * Get all categories.
     *
     * @return Collection<int, Category>
     */
    public function all(): Collection
    {
        return Category::all();
    }

    /**
     * Find a category by slug.
     */
    public function findBySlug(string $slug): ?Category
    {
        return Category::where('slug', $slug)->first();
    }

    /**
     * Find a category by ID.
     */
    public function find(int $id): ?Category
    {
        return Category::find($id);
    }

    /**
     * Create a new category.
     */
    public function create(array $attributes): Category
    {
        return Category::create($attributes);
    }

    /**
     * Update a category.
     */
    public function update(Category $category, array $attributes): bool
    {
        return $category->update($attributes);
    }

    /**
     * Delete a category.
     */
    public function delete(Category $category): bool
    {
        return (bool) $category->delete();
    }
}
