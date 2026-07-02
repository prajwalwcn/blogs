<?php

declare(strict_types=1);

namespace App\Domains\Author\Repositories;

use App\Domains\Author\Models\Author;
use Illuminate\Database\Eloquent\Collection;

class AuthorRepository
{
    /**
     * Get all authors.
     *
     * @return Collection<int, Author>
     */
    public function all(): Collection
    {
        return Author::all();
    }

    /**
     * Find an author by slug.
     */
    public function findBySlug(string $slug): ?Author
    {
        return Author::where('slug', $slug)->first();
    }

    /**
     * Find an author by ID.
     */
    public function find(int $id): ?Author
    {
        return Author::find($id);
    }

    /**
     * Create a new author.
     */
    public function create(array $attributes): Author
    {
        return Author::create($attributes);
    }

    /**
     * Update an author.
     */
    public function update(Author $author, array $attributes): bool
    {
        return $author->update($attributes);
    }

    /**
     * Delete an author.
     */
    public function delete(Author $author): bool
    {
        return (bool) $author->delete();
    }
}
