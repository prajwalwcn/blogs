<?php

declare(strict_types=1);

namespace App\Domains\SEO\Services;

use App\Domains\Author\Repositories\AuthorRepository;
use App\Domains\Blog\Repositories\BlogRepository;
use App\Domains\Tag\Repositories\TagRepository;
use Illuminate\Support\Collection;

class SitemapService
{
    protected string $frontendUrl;

    public function __construct(
        protected AuthorRepository $authorRepository,
        protected TagRepository $tagRepository,
        protected BlogRepository $blogRepository
    ) {
        $this->frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
    }

    /**
     * Get all sitemap entries as a structured array.
     *
     * @return array<int, array{url: string, lastmod: string, changefreq: string, priority: string}>
     */
    public function getSitemapData(): array
    {
        $urls = [];

        // 1. Homepage
        $urls[] = [
            'url' => $this->frontendUrl . '/',
            'lastmod' => now()->startOfDay()->toIso8601String(),
            'changefreq' => 'daily',
            'priority' => '1.0',
        ];

        // 2. Blog Channels
        $blogs = $this->blogRepository->all();
        foreach ($blogs as $blog) {
            $urls[] = [
                'url' => "{$this->frontendUrl}/{$blog->slug}",
                'lastmod' => $blog->updated_at->toIso8601String(),
                'changefreq' => 'daily',
                'priority' => '0.9',
            ];
        }

        // 3. Authors
        $authors = $this->authorRepository->all();
        foreach ($authors as $author) {
            $urls[] = [
                'url' => "{$this->frontendUrl}/authors/{$author->slug}",
                'lastmod' => $author->updated_at->toIso8601String(),
                'changefreq' => 'monthly',
                'priority' => '0.6',
            ];
        }

        // 4. Tags
        $tags = $this->tagRepository->all();
        foreach ($tags as $tag) {
            $urls[] = [
                'url' => "{$this->frontendUrl}/tags/{$tag->slug}",
                'lastmod' => ($tag->updated_at ?? now())->toIso8601String(),
                'changefreq' => 'weekly',
                'priority' => '0.7',
            ];
        }

        return $urls;
    }

    /**
     * Generate sitemap as XML string.
     */
    public function generateSitemapXml(): string
    {
        $data = $this->getSitemapData();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

        foreach ($data as $row) {
            $xml .= '  <url>' . PHP_EOL;
            $xml .= '    <loc>' . htmlspecialchars($row['url']) . '</loc>' . PHP_EOL;
            $xml .= '    <lastmod>' . $row['lastmod'] . '</lastmod>' . PHP_EOL;
            $xml .= '    <changefreq>' . $row['changefreq'] . '</changefreq>' . PHP_EOL;
            $xml .= '    <priority>' . $row['priority'] . '</priority>' . PHP_EOL;
            $xml .= '  </url>' . PHP_EOL;
        }

        $xml .= '</urlset>';

        return $xml;
    }
}
