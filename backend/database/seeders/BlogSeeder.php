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
        // Clear existing data to prevent duplicate key errors
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Comment::truncate();
        Redirect::truncate();
        Post::truncate();
        Tag::truncate();
        Category::truncate();
        Blog::truncate();
        Author::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

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

        // 2. Create Blogs with excerpt and repeater description (Title + Content)
        $blog1 = Blog::create([
            'author_id' => $author2->id, // John Smith for Tech
            'read_time' => 8,
            'name' => 'Developers Diary',
            'slug' => 'developers-diary',
            'excerpt' => 'A tech blog containing programming tutorials and developer guides.',
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
            ],
            'description' => [
                [
                    'title' => 'Mastering Technical SEO for Next.js Applications in 2026',
                    'content' => '<p>Next.js has become the framework of choice for building modern, React-based web applications. However, to achieve maximum search engine visibility in 2026, web developers must pay close attention to technical SEO details. Specifically, server-side rendering (SSR), static site generation (SSG), and how crawler bots process client-side JavaScript.</p><h2>The Core SEO Challenge with JavaScript</h2><p>Although search engines like Google have advanced rendering capabilities, executing JavaScript is resource-intensive. Googlebot uses a two-wave indexing process: first, it indexes the raw HTML returned from the server; second, it queues the page for rendering once computational resources are available. This means that if your critical metadata or content is injected solely via client-side JavaScript, indexing could be delayed by hours or even days.</p><h2>Implementing SSR and Metadata in Next.js</h2><p>With Next.js App Router, serving SEO elements in the initial HTML is simple. By defining metadata statically or dynamically using the `generateMetadata` function inside Server Components, Next.js generates and returns the meta tags directly in the raw HTML payload. This is critical for search indexing, canonical tags, and Open Graph previews.</p>'
                ],
                [
                    'title' => 'Laravel 12 API Design: Best Practices for Headless CMS architectures',
                    'content' => '<p>In headless web development, the backend acts purely as a content provider, serving JSON payloads via structured APIs. Designing this API effectively is crucial for developer productivity, application performance, and long-term maintainability. In this post, we explore best practices using Laravel 12, the service-repository pattern, and modern JSON resources.</p><h2>The Value of Decoupled Domains</h2><p>By organizing the Laravel codebase into independent domain folders (like Post, Author, SEO), we group related models, repositories, and services together. This makes the project easily navigatable and prevents our classes from becoming bloated.</p><h2>Using the Service-Repository Pattern</h2><p>Directly executing database queries inside controllers is an anti-pattern. Instead, use Repositories to handle queries (data access) and Services to handle domain business logic. This separation makes controllers very thin and keeps database-agnostic code separate from raw SQL or Eloquent statements.</p>'
                ]
            ]
        ]);

        $blog2 = Blog::create([
            'author_id' => $author1->id, // Jane Doe for Marketing
            'read_time' => 6,
            'name' => 'Marketing Hub',
            'slug' => 'marketing-hub',
            'excerpt' => 'A digital marketing blog focusing on SEO, search metrics, and growth strategies.',
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
            ],
            'description' => [
                [
                    'title' => 'How Core Web Vitals (INP) Impact Search Rankings in 2026',
                    'content' => '<p>In 2024, Google officially replaced First Input Delay (FID) with Interaction to Next Paint (INP) as a Core Web Vital metric. Fast-forward to 2026, and INP has become one of the most critical factors influencing user experience scores and organic search rankings.</p><h2>What is Interaction to Next Paint (INP)?</h2><p>Unlike FID, which only measures the delay of the very first user interaction, INP measures the latency of all interactions (like clicks, taps, or keyboard entries) throughout the entire lifespan of a page. It measures the duration between the user interaction and the next frame update on the screen, reflecting the page overall responsiveness.</p><h2>How to Optimize INP on Next.js Frontends</h2><p>Since INP evaluates visual feedback responsiveness, complex JavaScript execution on the main thread is the primary bottleneck. Optimize INP by: 1) Yielding to the main thread using setTimeout, 2) Reducing bundle sizes and deferring non-essential scripts, and 3) Avoiding cumulative layout shifts that trigger heavy browser paint tasks during interaction.</p>'
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

        // Associate categories and tags with blogs
        $blog1->categories()->sync([$categoryModels[0]->id, $categoryModels[1]->id, $categoryModels[2]->id]);
        $blog1->tags()->sync([$tagModels[0]->id, $tagModels[1]->id, $tagModels[3]->id, $tagModels[2]->id, $tagModels[4]->id]);

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

        // 7. Create Redirects
        Redirect::create([
            'source_url' => '/blogs/developers-diary/old-seo-tips',
            'destination_url' => '/blogs/developers-diary',
            'status_code' => 301,
        ]);

        Redirect::create([
            'source_url' => '/blogs/developers-diary/laravel-headless-intro',
            'destination_url' => '/blogs/developers-diary/laravel-12-api-design-best-practices-for-headless-cms',
            'status_code' => 301,
        ]);
    }
}
