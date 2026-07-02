<?php

use App\Http\Controllers\SeoController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Laravel Blog Backend API is running.',
        'documentation_url' => url('/api/posts'),
        'sitemap_url' => url('/sitemap.xml'),
        'robots_url' => url('/robots.txt'),
    ]);
});

Route::get('/sitemap.xml', [SeoController::class, 'sitemapXml']);
Route::get('/robots.txt', [SeoController::class, 'robotsTxt']);
