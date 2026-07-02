<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Handle the image upload.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp,svg', 'max:5120'], // Max 5MB
        ]);

        if (!$request->hasFile('image')) {
            return response()->json([
                'message' => 'No file uploaded',
            ], 400);
        }

        $file = $request->file('image');
        
        // Generate clean name
        $name = Str::random(20) . '.' . $file->getClientOriginalExtension();
        
        // Save to public storage inside "uploads" directory
        $path = $file->storeAs('uploads', $name, 'public');

        if (!$path) {
            return response()->json([
                'message' => 'Failed to save file',
            ], 500);
        }

        // Get absolute URL to the file
        $url = asset('storage/' . $path);

        return response()->json([
            'message' => 'Image uploaded successfully',
            'url' => $url,
        ]);
    }
}
