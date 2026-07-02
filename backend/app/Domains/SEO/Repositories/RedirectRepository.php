<?php

declare(strict_types=1);

namespace App\Domains\SEO\Repositories;

use App\Domains\SEO\Models\Redirect;
use Illuminate\Database\Eloquent\Collection;

class RedirectRepository
{
    /**
     * Get all redirect rules.
     *
     * @return Collection<int, Redirect>
     */
    public function all(): Collection
    {
        return Redirect::all();
    }

    /**
     * Find a redirect rule by its source URL.
     */
    public function findBySourceUrl(string $sourceUrl): ?Redirect
    {
        return Redirect::where('source_url', $sourceUrl)->first();
    }

    /**
     * Create a redirect rule.
     */
    public function create(array $attributes): Redirect
    {
        return Redirect::create($attributes);
    }

    /**
     * Delete a redirect rule.
     */
    public function delete(Redirect $redirect): bool
    {
        return (bool) $redirect->delete();
    }
}
