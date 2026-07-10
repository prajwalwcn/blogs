<?php

declare(strict_types=1);

namespace App\Domains\SEO\Services;

use App\Domains\Post\Models\Post;
use App\Domains\Author\Models\Author;

class SEOService
{
    protected string $frontendUrl;

    public function __construct()
    {
        $this->frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
    }

    /**
     * Get SEO metadata and schema markup for a post.
     *
     * @param Post $post
     * @return array<string, mixed>
     */
    public function getPostSEO(Post $post): array
    {
        $blogSlug = $post->blog ? $post->blog->slug : 'default';
        $canonical = "{$this->frontendUrl}/{$blogSlug}/{$post->slug}";

        return [
            'meta' => [
                'title' => $post->meta_title ?: $post->title,
                'description' => $post->meta_description ?: $post->short_description,
                'keywords' => $post->meta_keywords ?: '',
                'canonical_url' => $canonical,
                'robots' => 'index, follow',
            ],
            'og' => [
                'og:title' => $post->meta_title ?: $post->title,
                'og:description' => $post->meta_description ?: $post->short_description,
                'og:url' => $canonical,
                'og:type' => 'article',
                'og:image' => $post->image_url ?: "{$this->frontendUrl}/images/default-blog.jpg",
                'og:site_name' => config('app.name', 'Laravel Blog'),
            ],
            'twitter' => [
                'twitter:card' => 'summary_large_image',
                'twitter:title' => $post->meta_title ?: $post->title,
                'twitter:description' => $post->meta_description ?: $post->short_description,
                'twitter:image' => $post->image_url ?: "{$this->frontendUrl}/images/default-blog.jpg",
                'twitter:creator' => $post->author?->twitter_handle ? '@' . ltrim($post->author->twitter_handle, '@') : '',
            ],
            'schema' => [
                'article' => $this->generateArticleSchema($post),
                'breadcrumbs' => $this->generateBreadcrumbSchema([
                    ['name' => 'Home', 'url' => $this->frontendUrl],
                    ['name' => $post->blog ? $post->blog->name : 'Blog', 'url' => "{$this->frontendUrl}/{$blogSlug}"],
                    ['name' => $post->title, 'url' => $canonical],
                ]),
                'faq' => $this->generateFaqSchema($post->faq),
            ],
        ];
    }

    /**
     * Get SEO metadata and schema markup for a blog.
     *
     * @param \App\Domains\Blog\Models\Blog $blog
     * @return array<string, mixed>
     */
    public function getBlogSEO(\App\Domains\Blog\Models\Blog $blog): array
    {
        $canonical = "{$this->frontendUrl}/{$blog->slug}";

        return [
            'meta' => [
                'title' => $blog->meta_title ?: $blog->name,
                'description' => $blog->meta_description ?: $blog->description,
                'keywords' => $blog->meta_keywords ?: '',
                'canonical_url' => $canonical,
                'robots' => 'index, follow',
            ],
            'og' => [
                'og:title' => $blog->meta_title ?: $blog->name,
                'og:description' => $blog->meta_description ?: $blog->description,
                'og:url' => $canonical,
                'og:type' => 'website',
                'og:image' => $blog->image_url ?: "{$this->frontendUrl}/images/homepage-cover.jpg",
            ],
            'schema' => [
                'website' => [
                    '@context' => 'https://schema.org',
                    '@type' => 'WebSite',
                    'name' => $blog->name,
                    'url' => $canonical,
                    'description' => $blog->description,
                ],
                'breadcrumbs' => $this->generateBreadcrumbSchema([
                    ['name' => 'Home', 'url' => $this->frontendUrl],
                    ['name' => $blog->name, 'url' => $canonical],
                ]),
            ],
        ];
    }

    /**
     * Get SEO metadata for the homepage.
     *
     * @return array<string, mixed>
     */
    public function getHomepageSEO(): array
    {
        $canonical = $this->frontendUrl;

        return [
            'meta' => [
                'title' => config('app.name', 'Laravel Blog') . ' - High Performance Tech & Business Blog',
                'description' => 'Read clean, high-performance tech tutorials, programming tips, and business strategies.',
                'keywords' => 'laravel, nextjs, react, SEO, web development, software engineering',
                'canonical_url' => $canonical,
                'robots' => 'index, follow',
            ],
            'og' => [
                'og:title' => config('app.name', 'Laravel Blog'),
                'og:description' => 'Read clean, high-performance tech tutorials, programming tips, and business strategies.',
                'og:url' => $canonical,
                'og:type' => 'website',
                'og:image' => "{$this->frontendUrl}/images/homepage-cover.jpg",
            ],
            'schema' => [
                'website' => [
                    '@context' => 'https://schema.org',
                    '@type' => 'WebSite',
                    'name' => config('app.name', 'Laravel Blog'),
                    'url' => $this->frontendUrl,
                    'potentialAction' => [
                        '@type' => 'SearchAction',
                        'target' => "{$this->frontendUrl}/blog?search={search_term_string}",
                        'query-input' => 'required name=search_term_string',
                    ],
                ],
            ],
        ];
    }

    /**
     * Generate JSON-LD Article schema.
     */
    protected function generateArticleSchema(Post $post): array
    {
        $authorData = [
            '@type' => 'Person',
            'name' => $post->author?->name ?: 'Editorial Team',
        ];

        if ($post->author) {
            $authorData['url'] = "{$this->frontendUrl}/authors/{$post->author->slug}";
            if ($post->author->twitter_handle) {
                $authorData['sameAs'] = [
                    "https://twitter.com/{$post->author->twitter_handle}",
                ];
            }
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BlogPosting',
            'headline' => $post->title,
            'description' => $post->meta_description ?: $post->short_description,
            'image' => $post->image_url ?: "{$this->frontendUrl}/images/default-blog.jpg",
            'datePublished' => $post->published_at ? $post->published_at->toIso8601String() : $post->created_at->toIso8601String(),
            'dateModified' => $post->updated_at->toIso8601String(),
            'author' => $authorData,
            'publisher' => [
                '@type' => 'Organization',
                'name' => config('app.name', 'Laravel Blog'),
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => "{$this->frontendUrl}/logo.png",
                ],
            ],
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => "{$this->frontendUrl}/blogs/" . ($post->blog ? $post->blog->slug : 'default') . "/{$post->slug}",
            ],
        ];
    }

    /**
     * Generate JSON-LD Breadcrumb schema.
     *
     * @param array<int, array{name: string, url: string}> $crumbs
     * @return array<string, mixed>
     */
    protected function generateBreadcrumbSchema(array $crumbs): array
    {
        $items = [];
        foreach ($crumbs as $index => $crumb) {
            $items[] = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $crumb['name'],
                'item' => $crumb['url'],
            ];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $items,
        ];
    }

    /**
     * Generate JSON-LD FAQ schema.
     *
     * @param array<int, array{question: string, answer: string}>|null $faqs
     * @return array<string, mixed>|null
     */
    protected function generateFaqSchema(?array $faqs): ?array
    {
        if (empty($faqs)) {
            return null;
        }

        $entities = [];
        foreach ($faqs as $faq) {
            if (!empty($faq['question']) && !empty($faq['answer'])) {
                $entities[] = [
                    '@type' => 'Question',
                    'name' => $faq['question'],
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => $faq['answer'],
                    ],
                ];
            }
        }

        if (empty($entities)) {
            return null;
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => $entities,
        ];
    }
}
