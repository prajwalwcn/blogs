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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blog_id')->constrained('blogs')->cascadeOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('authors')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('short_description');
            $table->longText('content');
            $table->unsignedInteger('read_time')->nullable(); // in minutes
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->json('faq')->nullable(); // [{"question": "...", "answer": "..."}]
            
            // Featured image columns
            $table->string('image_url')->nullable();
            $table->string('image_alt')->nullable();
            $table->string('image_caption')->nullable();

            // Thumbnail image columns
            $table->string('thumbnail_url')->nullable();
            $table->string('thumbnail_alt')->nullable();
            
            // Multiple images gallery
            $table->json('gallery')->nullable(); // [{"url": "...", "alt": "...", "caption": "..."}]

            // Status and moderation flags
            $table->boolean('is_published')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('priority')->default(0); // For sorting (higher is higher priority)
            $table->boolean('allow_comments')->default(true);
            
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
