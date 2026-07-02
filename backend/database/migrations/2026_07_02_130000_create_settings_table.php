<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->default('Web Creation Nepal');
            $table->string('site_tagline')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('favicon_url')->nullable();
            $table->json('emails')->nullable(); // multiple emails
            $table->json('phones')->nullable(); // multiple phone numbers
            $table->json('social_links')->nullable(); // instagram, threads, x, facebook, etc.
            
            // New Contact and Map Settings
            $table->string('address')->nullable();
            $table->string('office_hours')->nullable();
            $table->text('google_map_iframe')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
