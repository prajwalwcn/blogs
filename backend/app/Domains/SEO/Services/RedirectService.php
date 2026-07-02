<?php

declare(strict_types=1);

namespace App\Domains\SEO\Services;

use App\Domains\SEO\Models\Redirect;
use App\Domains\SEO\Repositories\RedirectRepository;
use Illuminate\Database\Eloquent\Collection;

class RedirectService
{
    public function __construct(
        protected RedirectRepository $redirectRepository
    ) {}

    /**
     * Get all redirect rules.
     *
     * @return Collection<int, Redirect>
     */
    public function getAllRedirects(): Collection
    {
        return $this->redirectRepository->all();
    }

    /**
     * Check if a redirect exists for a source URL and return it.
     */
    public function checkRedirect(string $path): ?Redirect
    {
        // Normalize path: decode, remove query params, ensure leading slash, trim trailing slash (unless root)
        $parsedUrl = parse_url($path);
        $path = $parsedUrl['path'] ?? '/';
        $path = urldecode($path);

        if ($path !== '/') {
            $path = '/' . trim($path, '/');
        }

        // 1. Direct match
        $redirect = $this->redirectRepository->findBySourceUrl($path);
        if ($redirect) {
            return $redirect;
        }

        // 2. Direct match with trailing slash if it was missing or vice versa
        $alternativePath = $path === '/' ? '/' : $path . '/';
        if ($alternativePath !== '/') {
            $redirect = $this->redirectRepository->findBySourceUrl($alternativePath);
            if ($redirect) {
                return $redirect;
            }
        }

        return null;
    }

    /**
     * Create a new redirect rule.
     */
    public function createRedirect(array $data): Redirect
    {
        // Normalize URLs
        $data['source_url'] = '/' . ltrim(urldecode($data['source_url']), '/');
        $data['destination_url'] = urldecode($data['destination_url']);

        return $this->redirectRepository->create($data);
    }
}
