<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Domains\Author\Models\Author;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Author $resource
 */
class AuthorResource extends JsonResource
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
            'name' => $this->resource->name,
            'slug' => $this->resource->slug,
            'bio' => $this->resource->bio,
            'image_url' => $this->resource->image_url,
            'twitter_handle' => $this->resource->twitter_handle,
            'linkedin_url' => $this->resource->linkedin_url,
        ];
    }
}
