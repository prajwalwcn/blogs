<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domains\Setting\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Get the website settings.
     */
    public function index(): JsonResponse
    {
        $setting = Setting::first();

        if (!$setting) {
            $setting = Setting::create([
                'site_name' => 'Web Creation Nepal',
                'site_tagline' => 'SEO & Web Development Agency',
                'meta_title' => 'Web Creation Nepal | SEO & Web Development',
                'meta_description' => 'Professional SEO and Web Development Services.',
                'meta_keywords' => 'web development, seo, nepal',
                'logo_url' => '',
                'favicon_url' => '',
                'emails' => ['info@webcreation.com.np'],
                'phones' => ['+977 1234567890'],
                'social_links' => [
                    'instagram' => '',
                    'threads' => '',
                    'x' => '',
                    'facebook' => '',
                ],
                'address' => 'Web Creation Nepal, Kathmandu, Nepal',
                'office_hours' => 'Sunday - Friday: 09:00 AM - 06:00 PM',
                'google_map_iframe' => '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.2285994246944!2d85.32185257620353!3d27.702553976189917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19a63b2f9011%3A0x446e1074a36f56bc!2sWeb%20Creation%20Nepal!5e0!3m2!1sen!2snp!4v1719811200000!5m2!1sen!2snp" width="100%" height="350" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
                'enable_voice_reader' => false,
            ]);
        }
 
         return response()->json([
             'data' => $setting
         ]);
     }
 
     /**
      * Update website settings.
      */
     public function update(Request $request): JsonResponse
     {
         $setting = Setting::first();
 
         if (!$setting) {
             $setting = new Setting();
         }
 
         $validated = $request->validate([
             'site_name' => ['required', 'string', 'max:255'],
             'site_tagline' => ['nullable', 'string', 'max:255'],
             'meta_title' => ['nullable', 'string', 'max:255'],
             'meta_description' => ['nullable', 'string'],
             'meta_keywords' => ['nullable', 'string', 'max:255'],
             'logo_url' => ['nullable', 'string', 'max:2048'],
             'favicon_url' => ['nullable', 'string', 'max:2048'],
             'emails' => ['nullable', 'array'],
             'emails.*' => ['string', 'email'],
             'phones' => ['nullable', 'array'],
             'phones.*' => ['string'],
             'social_links' => ['nullable', 'array'],
             'social_links.instagram' => ['nullable', 'string', 'max:2048'],
             'social_links.threads' => ['nullable', 'string', 'max:2048'],
             'social_links.x' => ['nullable', 'string', 'max:2048'],
             'social_links.facebook' => ['nullable', 'string', 'max:2048'],
             'address' => ['nullable', 'string', 'max:500'],
             'office_hours' => ['nullable', 'string', 'max:255'],
             'google_map_iframe' => ['nullable', 'string'],
             'enable_voice_reader' => ['nullable', 'boolean'],
         ]);

        $setting->fill($validated);
        $setting->save();

        return response()->json([
            'message' => 'Settings updated successfully',
            'data' => $setting
        ]);
    }
}
