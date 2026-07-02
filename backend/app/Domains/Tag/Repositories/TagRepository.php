<?php

declare(strict_types=1);

namespace App\Domains\Tag\Repositories;

use App\Domains\Tag\Models\Tag;
use Illuminate\Database\Eloquent\Collection;

class TagRepository
{
    /**
     * Get all tags.
     *
     * @return Collection<int, Tag>
     */
    public function all(): Collection
    {
        return Tag::all();
    }

    /**
     * Find a tag by slug.
     */
    public function findBySlug(string $slug): ?Tag
    {
        return Tag::where('slug', $slug)->first();
    }

    /**
     * Find a tag by ID.
     */
    public function find(int $id): ?Tag
    {
        return Tag::find($id);
    }

    /**
     * Create a new tag.
     */
    public function create(array $attributes): Tag
    {
        return Tag::create($attributes);
    }

    /**
     * Update a tag.
     */
    public function update(Tag $tag, array $attributes): bool
    {
        return $tag->update($attributes);
    }

    /**
     * Delete a tag.
     */
    public function delete(Tag $tag): bool
    {
        return (bool) $tag->delete();
    }
}
