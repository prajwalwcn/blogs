<?php

declare(strict_types=1);

namespace App\Domains\Tag\Services;

use App\Domains\Tag\Models\Tag;
use App\Domains\Tag\Repositories\TagRepository;
use Illuminate\Database\Eloquent\Collection;

class TagService
{
    public function __construct(
        protected TagRepository $tagRepository
    ) {}

    /**
     * Get all tags.
     *
     * @return Collection<int, Tag>
     */
    public function getAllTags(): Collection
    {
        return $this->tagRepository->all();
    }

    /**
     * Get tag by slug.
     */
    public function getTagBySlug(string $slug): ?Tag
    {
        return $this->tagRepository->findBySlug($slug);
    }

    /**
     * Create a new tag.
     */
    public function createTag(array $data): Tag
    {
        return $this->tagRepository->create($data);
    }

    /**
     * Update an existing tag.
     */
    public function updateTag(Tag $tag, array $data): bool
    {
        return $this->tagRepository->update($tag, $data);
    }

    /**
     * Delete a tag.
     */
    public function deleteTag(Tag $tag): bool
    {
        return $this->tagRepository->delete($tag);
    }
}
