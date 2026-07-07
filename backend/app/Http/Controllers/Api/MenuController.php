<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domains\Setting\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Display a listing of the menu items.
     */
    public function index(): JsonResponse
    {
        $menus = Menu::orderBy('order', 'asc')->get();

        return response()->json([
            'data' => $menus,
        ]);
    }

    /**
     * Store a newly created menu item in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'url' => ['required', 'string', 'max:2048'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'order' => ['nullable', 'integer'],
        ]);

        $menu = Menu::create($validated);

        return response()->json([
            'message' => 'Menu item created successfully',
            'data' => $menu,
        ], 201);
    }

    /**
     * Update the specified menu item in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $menu = Menu::findOrFail($id);

        $validated = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'url' => ['required', 'string', 'max:2048'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'order' => ['nullable', 'integer'],
        ]);

        $menu->update($validated);

        return response()->json([
            'message' => 'Menu item updated successfully',
            'data' => $menu,
        ]);
    }

    /**
     * Remove the specified menu item from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();

        return response()->json([
            'message' => 'Menu item deleted successfully',
        ]);
    }
}
