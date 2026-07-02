<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domains\SEO\Services\SitemapService;
use App\Domains\SEO\Services\SEOService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    protected string $frontendUrl;

    public function __construct(
        protected SitemapService $sitemapService,
        protected SEOService $seoService
    ) {
        $this->frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
    }

    /**
     * Serve the sitemap.xml dynamically.
     */
    public function sitemapXml(): Response
    {
        $xml = $this->sitemapService->generateSitemapXml();

        return response($xml, 200)
            ->header('Content-Type', 'application/xml');
    }

    /**
     * Return sitemap data as JSON for Next.js configuration.
     */
    public function sitemapData(): JsonResponse
    {
        $data = $this->sitemapService->getSitemapData();

        return response()->json([
            'data' => $data,
        ]);
    }

    /**
     * Serve robots.txt dynamically.
     */
    public function robotsTxt(): Response
    {
        $sitemapUrl = "{$this->frontendUrl}/sitemap.xml";

        $robots = "# Dynamic Robots.txt served from Laravel Backend" . PHP_EOL . PHP_EOL;

        // 1. Block AI crawlers from scraping content for LLM training
        $robots .= "# Block AI crawlers for model training" . PHP_EOL;
        $robots .= "User-agent: GPTBot" . PHP_EOL;
        $robots .= "Disallow: /" . PHP_EOL . PHP_EOL;

        $robots .= "User-agent: Google-Extended" . PHP_EOL;
        $robots .= "Disallow: /" . PHP_EOL . PHP_EOL;

        $robots .= "User-agent: Bytespider" . PHP_EOL;
        $robots .= "Disallow: /" . PHP_EOL . PHP_EOL;

        $robots .= "User-agent: ClaudeBot" . PHP_EOL;
        $robots .= "Disallow: /" . PHP_EOL . PHP_EOL;

        $robots .= "User-agent: CCBot" . PHP_EOL;
        $robots .= "Disallow: /" . PHP_EOL . PHP_EOL;

        // 2. Allow real search bots
        $robots .= "# Allow all search engines" . PHP_EOL;
        $robots .= "User-agent: *" . PHP_EOL;
        $robots .= "Allow: /" . PHP_EOL . PHP_EOL;

        // 3. Link to XML Sitemap
        $robots .= "# Sitemap Link" . PHP_EOL;
        $robots .= "Sitemap: {$sitemapUrl}" . PHP_EOL;

        return response($robots, 200)
            ->header('Content-Type', 'text/plain');
    }

    /**
     * Get home page SEO parameters.
     */
    public function homepageSeo(): JsonResponse
    {
        $seo = $this->seoService->getHomepageSEO();

        return response()->json([
            'data' => $seo,
        ]);
    }
}
