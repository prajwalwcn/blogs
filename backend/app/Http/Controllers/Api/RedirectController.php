<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domains\SEO\Services\RedirectService;
use App\Http\Requests\StoreRedirectRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RedirectController extends Controller
{
    public function __construct(
        protected RedirectService $redirectService
    ) {}

    /**
     * Get all redirect rules.
     */
    public function index(): JsonResponse
    {
        $redirects = $this->redirectService->getAllRedirects();

        return response()->json([
            'data' => $redirects,
        ]);
    }

    /**
     * Check if a path requires redirection.
     * Exposed for Next.js middleware checking.
     */
    public function check(Request $request): JsonResponse
    {
        $path = $request->query('path');

        if (!$path) {
            return response()->json([
                'message' => 'Path parameter is required',
            ], 400);
        }

        $redirect = $this->redirectService->checkRedirect($path);

        if (!$redirect) {
            return response()->json([
                'redirect' => null,
            ]);
        }

        return response()->json([
            'redirect' => [
                'source_url' => $redirect->source_url,
                'destination_url' => $redirect->destination_url,
                'status_code' => $redirect->status_code,
            ],
        ]);
    }

    /**
     * Store a redirect rule manually.
     */
    public function store(StoreRedirectRequest $request): JsonResponse
    {
        $redirect = $this->redirectService->createRedirect($request->validated());

        return response()->json([
            'message' => 'Redirect rule created successfully',
            'data' => $redirect,
        ], 201);
    }
}
