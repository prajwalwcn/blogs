<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Domains\Post\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Post $resource
 */
class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'blog_id' => $this->resource->blog_id,
            'blog' => $this->resource->blog ? [
                'name' => $this->resource->blog->name,
                'slug' => $this->resource->blog->slug,
            ] : null,
            'author_id' => $this->resource->author_id,
            'title' => $this->resource->title,
            'slug' => $this->resource->slug,
            'short_description' => $this->resource->short_description,
            'content' => $this->resource->content,
            'read_time' => $this->resource->read_time,
            'faq' => $this->resource->faq ?: [],
            
            // Image assets with alt/captions
            'image_url' => $this->resource->image_url,
            'image_alt' => $this->resource->image_alt,
            'image_caption' => $this->resource->image_caption,
            'thumbnail_url' => $this->resource->thumbnail_url,
            'thumbnail_alt' => $this->resource->thumbnail_alt,
            'gallery' => $this->resource->gallery ?: [],

            // Moderation flags
            'is_published' => $this->resource->is_published,
            'is_featured' => $this->resource->is_featured,
            'priority' => $this->resource->priority,
            'allow_comments' => $this->resource->allow_comments,
            
            'published_at' => $this->resource->published_at?->toIso8601String(),
            'author' => new AuthorResource($this->whenLoaded('author')),
        ];
    }
}
