<?php

declare(strict_types=1);

namespace App\Domains\Author\Services;

use App\Domains\Author\Models\Author;
use App\Domains\Author\Repositories\AuthorRepository;
use Illuminate\Database\Eloquent\Collection;

class AuthorService
{
    public function __construct(
        protected AuthorRepository $authorRepository
    ) {}

    /**
     * Get all authors.
     *
     * @return Collection<int, Author>
     */
    public function getAllAuthors(): Collection
    {
        return $this->authorRepository->all();
    }

    /**
     * Get author by slug.
     */
    public function getAuthorBySlug(string $slug): ?Author
    {
        return $this->authorRepository->findBySlug($slug);
    }

    /**
     * Create a new author.
     */
    public function createAuthor(array $data): Author
    {
        return $this->authorRepository->create($data);
    }

    /**
     * Update an existing author.
     */
    public function updateAuthor(Author $author, array $data): bool
    {
        return $this->authorRepository->update($author, $data);
    }

    /**
     * Delete an author.
     */
    public function deleteAuthor(Author $author): bool
    {
        return $this->authorRepository->delete($author);
    }
}
