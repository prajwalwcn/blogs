<?php

declare(strict_types=1);

namespace App\Domains\SEO\Services;

use App\Domains\Author\Repositories\AuthorRepository;
use App\Domains\Blog\Repositories\BlogRepository;
use App\Domains\Category\Repositories\CategoryRepository;
use App\Domains\Post\Repositories\PostRepository;
use Illuminate\Support\Collection;

class SitemapService
{
    protected string $frontendUrl;

    public function __construct(
        protected PostRepository $postRepository,
        protected AuthorRepository $authorRepository,
        protected CategoryRepository $categoryRepository,
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

        // 2. Blogs List & Individual Blogs
        $blogs = $this->blogRepository->all();
        foreach ($blogs as $blog) {
            $urls[] = [
                'url' => "{$this->frontendUrl}/blogs/{$blog->slug}",
                'lastmod' => $blog->updated_at->toIso8601String(),
                'changefreq' => 'daily',
                'priority' => '0.9',
            ];
        }

        // 3. Posts
        $posts = $this->postRepository->getAllPublished();
        foreach ($posts as $post) {
            // Eager-load blog relation or fallback to generic path
            $blogSlug = $post->blog ? $post->blog->slug : 'default';
            $urls[] = [
                'url' => "{$this->frontendUrl}/blogs/{$blogSlug}/{$post->slug}",
                'lastmod' => $post->updated_at->toIso8601String(),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ];
        }

        // 4. Authors
        $authors = $this->authorRepository->all();
        foreach ($authors as $author) {
            $urls[] = [
                'url' => "{$this->frontendUrl}/authors/{$author->slug}",
                'lastmod' => $author->updated_at->toIso8601String(),
                'changefreq' => 'monthly',
                'priority' => '0.6',
            ];
        }

        // 5. Categories
        $categories = $this->categoryRepository->all();
        foreach ($categories as $category) {
            $urls[] = [
                'url' => "{$this->frontendUrl}/categories/{$category->slug}",
                'lastmod' => $category->updated_at->toIso8601String(),
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
