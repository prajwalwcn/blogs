<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdatePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation (Auto-Slug Generation).
     */
    protected function prepareForValidation(): void
    {
        if ($this->filled('title') && !$this->filled('slug')) {
            $this->merge([
                'slug' => Str::slug($this->input('title')),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $postId = $this->route('post')?->id ?? $this->input('id');

        return [
            'blog_id' => ['required', 'exists:blogs,id'],
            'author_id' => ['nullable', 'exists:authors,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'unique:posts,slug,' . $postId, 'max:255'],
            'short_description' => ['required', 'string'],
            'content' => ['required', 'string'],
            'read_time' => ['nullable', 'integer', 'min:1'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
            'meta_keywords' => ['nullable', 'string'],
            'faq' => ['nullable', 'array'],
            'faq.*.question' => ['required_with:faq', 'string'],
            'faq.*.answer' => ['required_with:faq', 'string'],
            
            // Image validation
            'image_url' => ['nullable', 'string', 'max:2048'],
            'image_alt' => ['nullable', 'string', 'max:255'],
            'image_caption' => ['nullable', 'string', 'max:255'],
            'thumbnail_url' => ['nullable', 'string', 'max:2048'],
            'thumbnail_alt' => ['nullable', 'string', 'max:255'],
            
            // Gallery validation
            'gallery' => ['nullable', 'array'],
            'gallery.*.url' => ['required_with:gallery', 'string', 'max:2048'],
            'gallery.*.alt' => ['nullable', 'string', 'max:255'],
            'gallery.*.caption' => ['nullable', 'string', 'max:255'],

            // Flags and sorting
            'is_published' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'priority' => ['nullable', 'integer', 'min:0'],
            'allow_comments' => ['nullable', 'boolean'],
        ];
    }
}
