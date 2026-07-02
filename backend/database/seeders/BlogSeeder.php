<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Author\Models\Author;
use App\Domains\Blog\Models\Blog;
use App\Domains\Category\Models\Category;
use App\Domains\Comment\Models\Comment;
use App\Domains\Post\Models\Post;
use App\Domains\SEO\Models\Redirect;
use App\Domains\Tag\Models\Tag;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Authors
        $author1 = Author::create([
            'name' => 'Jane Doe',
            'slug' => 'jane-doe',
            'bio' => 'Senior Technical SEO Consultant and Author with 10+ years experience optimizing single page apps for crawlability and LLM search queries.',
            'image_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
            'twitter_handle' => 'janedoe_seo',
            'linkedin_url' => 'https://linkedin.com/in/jane-doe-seo',
        ]);

        $author2 = Author::create([
            'name' => 'John Smith',
            'slug' => 'john-smith',
            'bio' => 'Lead Fullstack Architect specializing in Next.js frontend rendering and Laravel modular API development.',
            'image_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
            'twitter_handle' => 'johnsmith_dev',
            'linkedin_url' => 'https://linkedin.com/in/john-smith-dev',
        ]);

        // 2. Create Blogs
        $blog1 = Blog::create([
            'author_id' => $author2->id, // John Smith for Tech
            'read_time' => 8,
            'name' => 'Developers Diary',
            'slug' => 'developers-diary',
            'description' => 'A tech blog containing programming tutorials and developer guides.',
            'meta_title' => 'Developers Diary | Coding & Tech Insights',
            'meta_description' => 'Learn programming, backend development with Laravel, frontend styling, and web engineering best practices.',
            'meta_keywords' => 'coding blog, tech tutorials, developer guide',
            'image_url' => 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&h=450&q=80',
            'image_alt' => 'Laptop displaying lines of programming code on a monitor',
            'image_caption' => 'Deep technical tutorials and guidelines for software engineers.',
            'faq' => [
                [
                    'question' => 'Does Google render JavaScript for Next.js sites?',
                    'answer' => 'Yes, Googlebot renders client-side JavaScript, but it is queued and processed in a second wave of indexing. To prevent delays, critical metadata and page content should be server-rendered (SSR).'
                ],
                [
                    'question' => 'Why use Repositories instead of direct Eloquent calls?',
                    'answer' => 'Using Repositories isolates the database queries from the rest of the application. This makes your code more testable (by mocking repositories) and makes it easier to change databases or cache query results.'
                ]
            ]
        ]);

        $blog2 = Blog::create([
            'author_id' => $author1->id, // Jane Doe for Marketing
            'read_time' => 6,
            'name' => 'Marketing Hub',
            'slug' => 'marketing-hub',
            'description' => 'A digital marketing blog focusing on SEO, search metrics, and growth strategies.',
            'meta_title' => 'Marketing Hub | Search & Growth Marketing',
            'meta_description' => 'A blog offering tips on Search Engine Optimization (SEO), Answer Engine Optimization (AEO), and web analytics.',
            'meta_keywords' => 'marketing blog, seo guide, organic growth',
            'image_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&h=450&q=80',
            'image_alt' => 'Web analytics report showing growth graphs and charts',
            'image_caption' => 'Actionable advice on search visibility, AEO, and marketing growth.',
            'faq' => [
                [
                    'question' => 'What is a good INP score?',
                    'answer' => 'An INP score of 200 milliseconds or less indicates good responsiveness. Scores between 200ms and 500ms need improvement, while scores above 500ms are considered poor.'
                ],
                [
                    'question' => 'How does INP differ from FID?',
                    'answer' => 'FID only measured the initial delay of the first interaction. INP measures all interactions on the page and checks the complete time it takes for the UI to update, not just the delay before execution begins.'
                ]
            ]
        ]);

        // 3. Create Categories
        $categories = [
            [
                'name' => 'SEO & Technical Marketing',
                'slug' => 'seo-technical-marketing',
                'description' => 'Advanced strategies for technical SEO, crawling, indexing, and generative search visibility.',
            ],
            [
                'name' => 'Next.js Development',
                'slug' => 'nextjs-development',
                'description' => 'Best practices for React and Next.js applications including SSR, SSG, and Server Components.',
            ],
            [
                'name' => 'Laravel Backend',
                'slug' => 'laravel-backend',
                'description' => 'Modern PHP design patterns, API development, service-repository architectures, and query optimization.',
            ],
            [
                'name' => 'Core Web Vitals',
                'slug' => 'core-web-vitals',
                'description' => 'Improving Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS).',
            ],
        ];

        $categoryModels = [];
        foreach ($categories as $cat) {
            $categoryModels[] = Category::create($cat);
        }

        // 4. Create Tags
        $tags = [
            ['name' => 'SEO', 'slug' => 'seo'],
            ['name' => 'Next.js', 'slug' => 'nextjs'],
            ['name' => 'Laravel 12', 'slug' => 'laravel-12'],
            ['name' => 'React', 'slug' => 'react'],
            ['name' => 'PHP', 'slug' => 'php'],
            ['name' => 'Performance', 'slug' => 'performance'],
            ['name' => 'INP', 'slug' => 'inp'],
        ];

        $tagModels = [];
        foreach ($tags as $tag) {
            $tagModels[] = Tag::create($tag);
        }

        // 5. Create Posts
        // Post 1
        $post1 = Post::create([
            'blog_id' => $blog1->id,
            'author_id' => $author1->id,
            'title' => 'Mastering Technical SEO for Next.js Applications in 2026',
            'slug' => 'mastering-technical-seo-for-nextjs-applications-in-2026',
            'short_description' => 'A complete guide to optimizing Next.js (App Router) websites for Googlebot and modern AI search engines, focusing on SSR, dynamic metadata, and schema injection.',
            'content' => '<p>Next.js has become the framework of choice for building modern, React-based web applications. However, to achieve maximum search engine visibility in 2026, web developers must pay close attention to technical SEO details. Specifically, server-side rendering (SSR), static site generation (SSG), and how crawler bots process client-side JavaScript.</p><h2>The Core SEO Challenge with JavaScript</h2><p>Although search engines like Google have advanced rendering capabilities, executing JavaScript is resource-intensive. Googlebot uses a two-wave indexing process: first, it indexes the raw HTML returned from the server; second, it queues the page for rendering once computational resources are available. This means that if your critical metadata or content is injected solely via client-side JavaScript, indexing could be delayed by hours or even days.</p><h2>Implementing SSR and Metadata in Next.js</h2><p>With Next.js App Router, serving SEO elements in the initial HTML is simple. By defining metadata statically or dynamically using the `generateMetadata` function inside Server Components, Next.js generates and returns the meta tags directly in the raw HTML payload. This is critical for search indexing, canonical tags, and Open Graph previews.</p>',
            'read_time' => 7,
            'meta_title' => 'Technical SEO Guide for Next.js (App Router) | 2026',
            'meta_description' => 'Learn how to optimize Next.js for crawling, indexation, and AI search engines. Learn about SSR metadata, schema injection, and canonical tags.',
            'meta_keywords' => 'nextjs seo, technical seo, ssr metadata, googlebot, claudebot',
            
            // Images
            'image_url' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&h=450&q=80',
            'image_alt' => 'Next.js logo and code on a dark screen representing technical SEO development',
            'image_caption' => 'Technical SEO requires server-side rendering setup in Next.js.',
            
            // Thumbnail
            'thumbnail_url' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=150&h=150&q=80',
            'thumbnail_alt' => 'Next.js SEO development thumbnail logo',
            
            'gallery' => [
                [
                    'url' => 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&h=450&q=80',
                    'alt' => 'Design layout workflow diagram',
                    'caption' => 'Step 1: Structuring metadata at the layout level'
                ],
                [
                    'url' => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&h=450&q=80',
                    'alt' => 'Code editor screen showing schema markup',
                    'caption' => 'Step 2: Injecting JSON-LD schema dynamically'
                ]
            ],

            'is_published' => true,
            'is_featured' => true,
            'priority' => 10,
            'allow_comments' => true,
            'published_at' => now()->subDays(5),
        ]);
        // Sync categories and tags to blogs instead of posts
        $blog1->categories()->sync([$categoryModels[0]->id, $categoryModels[1]->id, $categoryModels[2]->id]);
        $blog1->tags()->sync([$tagModels[0]->id, $tagModels[1]->id, $tagModels[3]->id, $tagModels[2]->id, $tagModels[4]->id]);

        // Post 2
        $post2 = Post::create([
            'blog_id' => $blog1->id,
            'author_id' => $author2->id,
            'title' => 'Laravel 12 API Design: Best Practices for Headless CMS architectures',
            'slug' => 'laravel-12-api-design-best-practices-for-headless-cms',
            'short_description' => 'How to design a modular, decoupled API in Laravel 12 using Repository patterns and Services to serve content efficiently to frontend frameworks like Next.js.',
            'content' => '<p>In headless web development, the backend acts purely as a content provider, serving JSON payloads via structured APIs. Designing this API effectively is crucial for developer productivity, application performance, and long-term maintainability. In this post, we explore best practices using Laravel 12, the service-repository pattern, and modern JSON resources.</p><h2>The Value of Decoupled Domains</h2><p>By organizing the Laravel codebase into independent domain folders (like Post, Author, SEO), we group related models, repositories, and services together. This makes the project easily navigatable and prevents our classes from becoming bloated.</p><h2>Using the Service-Repository Pattern</h2><p>Directly executing database queries inside controllers is an anti-pattern. Instead, use Repositories to handle queries (data access) and Services to handle domain business logic. This separation makes controllers very thin and keeps database-agnostic code separate from raw SQL or Eloquent statements.</p>',
            'read_time' => 5,
            'meta_title' => 'Laravel 12 API Design & Domain Architecture',
            'meta_description' => 'A step-by-step guide to building a decoupled, headless API in Laravel 12 using domain structures, repositories, and clean services.',
            'meta_keywords' => 'laravel 12 api, headless cms laravel, service repository pattern laravel',
            
            // Images
            'image_url' => 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&h=450&q=80',
            'image_alt' => 'HTML, CSS, PHP code script screenshot representing backend services',
            'image_caption' => 'Decoupled system architecture in PHP 8.4 & Laravel 12',
            
            // Thumbnail
            'thumbnail_url' => 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=150&h=150&q=80',
            'thumbnail_alt' => 'Laravel backend programming code thumbnail',

            'is_published' => true,
            'is_featured' => false,
            'priority' => 5,
            'allow_comments' => true,
            'published_at' => now()->subDays(2),
        ]);

        // Post 3
        $post3 = Post::create([
            'blog_id' => $blog2->id,
            'author_id' => $author1->id,
            'title' => 'How Core Web Vitals (INP) Impact Search Rankings in 2026',
            'slug' => 'how-core-web-vitals-inp-impact-search-rankings-in-2026',
            'short_description' => 'Understanding Interaction to Next Paint (INP) which replaced First Input Delay (FID), its influence on organic performance, and technical strategies to optimize responsiveness.',
            'content' => '<p>In 2024, Google officially replaced First Input Delay (FID) with Interaction to Next Paint (INP) as a Core Web Vital metric. Fast-forward to 2026, and INP has become one of the most critical factors influencing user experience scores and organic search rankings.</p><h2>What is Interaction to Next Paint (INP)?</h2><p>Unlike FID, which only measures the delay of the very first user interaction, INP measures the latency of all interactions (like clicks, taps, or keyboard entries) throughout the entire lifespan of a page. It measures the duration between the user interaction and the next frame update on the screen, reflecting the page overall responsiveness.</p><h2>How to Optimize INP on Next.js Frontends</h2><p>Since INP evaluates visual feedback responsiveness, complex JavaScript execution on the main thread is the primary bottleneck. Optimize INP by: 1) Yielding to the main thread using setTimeout, 2) Reducing bundle sizes and deferring non-essential scripts, and 3) Avoiding cumulative layout shifts that trigger heavy browser paint tasks during interaction.</p>',
            'read_time' => 6,
            'meta_title' => 'Optimize INP Core Web Vital for Google Rankings | 2026',
            'meta_description' => 'Understand Interaction to Next Paint (INP) and how to achieve a score of under 200ms in Next.js to maximize your search rankings and Core Web Vitals pass rates.',
            'meta_keywords' => 'core web vitals, inp optimization, next paint, seo rankings, nextjs performance',
            
            // Images
            'image_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&h=450&q=80',
            'image_alt' => 'Charts showing page speed and responsiveness improvement metric parameters',
            'image_caption' => 'INP measures user interaction responsiveness over the entire session.',
            
            // Thumbnail
            'thumbnail_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=150&h=150&q=80',
            'thumbnail_alt' => 'INP analytics dashboard performance thumbnail',

            'is_published' => true,
            'is_featured' => false,
            'priority' => 8,
            'allow_comments' => false, // disabled comments for this post
            'published_at' => now()->subDay(),
        ]);
        $blog2->categories()->sync([$categoryModels[0]->id, $categoryModels[3]->id]);
        $blog2->tags()->sync([$tagModels[0]->id, $tagModels[5]->id, $tagModels[6]->id]);

        // 6. Create Comments
        // Approved comments for Blog 1
        Comment::create([
            'blog_id' => $blog1->id,
            'name' => 'Manoj Pathak',
            'email' => 'manoj@example.com',
            'content' => 'This is a very detailed guide. I was facing issues with dynamically generating metadata for nested route groups in Next.js App Router, and your approach of using generateMetadata resolved it completely. Thanks!',
            'is_approved' => true,
        ]);
        
        Comment::create([
            'blog_id' => $blog1->id,
            'name' => 'Siddharth Sharma',
            'email' => 'siddharth@example.com',
            'content' => 'How does this affect static pages that use generateStaticParams? Do they still get metadata generated statically?',
            'is_approved' => true,
        ]);

        // Pending comment for Blog 1 (not approved yet)
        Comment::create([
            'blog_id' => $blog1->id,
            'name' => 'Anjali Gupta',
            'email' => 'anjali@example.com',
            'content' => 'Does this Next.js sitemap strategy support multi-language paths (e.g., /en/blogs, /es/blogs) dynamically out of the box?',
            'is_approved' => false,
        ]);

        // 7. Create Redirects (Simulating slug updates)
        Redirect::create([
            'source_url' => '/blogs/developers-diary/old-seo-tips',
            'destination_url' => '/blogs/developers-diary/mastering-technical-seo-for-nextjs-applications-in-2026',
            'status_code' => 301,
        ]);

        Redirect::create([
            'source_url' => '/blogs/developers-diary/laravel-headless-intro',
            'destination_url' => '/blogs/developers-diary/laravel-12-api-design-best-practices-for-headless-cms',
            'status_code' => 301,
        ]);
    }
}
