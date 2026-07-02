<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\RedirectController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\SeoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- Public Authentication ---
Route::post('/login', [AuthController::class, 'login']);

// --- Public Read (GET) Endpoints ---
Route::get('/homepage-seo', [SeoController::class, 'homepageSeo']);
Route::get('/sitemap-data', [SeoController::class, 'sitemapData']);
Route::get('/redirects/check', [RedirectController::class, 'check']);
Route::get('/redirects', [RedirectController::class, 'index']);
Route::get('/settings', [SettingController::class, 'index']);

// Posts Public API
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{slug}', [PostController::class, 'show']);

// Authors Public API
Route::get('/authors', [AuthorController::class, 'index']);
Route::get('/authors/{slug}', [AuthorController::class, 'show']);

// Categories Public API
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

// Tags Public API
Route::get('/tags', [TagController::class, 'index']);
Route::get('/tags/{slug}', [TagController::class, 'show']);

// Blogs Public API
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{slug}', [BlogController::class, 'show']);

// Comments Public API (Anyone can read, guest can submit)
Route::get('/blogs/{blogId}/comments', [CommentController::class, 'index']);
Route::post('/comments', [CommentController::class, 'store']);

// Contacts Public API
Route::post('/contacts', [ContactController::class, 'store']);


// --- Protected Admin Write (POST, PUT, DELETE) Endpoints ---
Route::middleware('auth:sanctum')->group(function () {
    // Admin Info & Logout
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/upload', [\App\Http\Controllers\Api\UploadController::class, 'upload']);

    // Redirect Management API
    Route::post('/redirects', [RedirectController::class, 'store']);
    Route::put('/settings', [SettingController::class, 'update']);

    // Posts Admin CRUD
    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{post}', [PostController::class, 'update']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);

    // Blogs Admin CRUD
    Route::post('/blogs', [BlogController::class, 'store']);
    Route::put('/blogs/{blog}', [BlogController::class, 'update']);
    Route::delete('/blogs/{blog}', [BlogController::class, 'destroy']);

    // Authors Admin CRUD
    Route::post('/authors', [AuthorController::class, 'store']);
    Route::put('/authors/{author}', [AuthorController::class, 'update']);
    Route::delete('/authors/{author}', [AuthorController::class, 'destroy']);

    // Categories Admin CRUD
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Tags Admin CRUD
    Route::post('/tags', [TagController::class, 'store']);
    Route::put('/tags/{tag}', [TagController::class, 'update']);
    Route::delete('/tags/{tag}', [TagController::class, 'destroy']);

    // Comments Admin Moderation
    Route::get('/comments', [CommentController::class, 'adminIndex']);
    Route::put('/comments/{id}/approve', [CommentController::class, 'approve']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

    // Contacts Admin Moderation
    Route::get('/contacts', [ContactController::class, 'adminIndex']);
    Route::put('/contacts/{id}/status', [ContactController::class, 'updateStatus']);
    Route::delete('/contacts/{id}', [ContactController::class, 'destroy']);
});
