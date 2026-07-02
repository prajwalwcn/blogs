<?php

declare(strict_types=1);

namespace App\Domains\Contact\Repositories;

use App\Domains\Contact\Models\ContactMessage;
use Illuminate\Database\Eloquent\Collection;

class ContactMessageRepository
{
    /**
     * Get all contact messages.
     *
     * @return Collection<int, ContactMessage>
     */
    public function getAll(): Collection
    {
        return ContactMessage::latest()->get();
    }

    /**
     * Create a new contact message.
     */
    public function create(array $attributes): ContactMessage
    {
        return ContactMessage::create($attributes);
    }

    /**
     * Find a contact message by ID.
     */
    public function find(int $id): ?ContactMessage
    {
        return ContactMessage::find($id);
    }

    /**
     * Update a contact message status.
     */
    public function updateStatus(ContactMessage $message, string $status): bool
    {
        return $message->update(['status' => $status]);
    }

    /**
     * Delete a contact message.
     */
    public function delete(ContactMessage $message): bool
    {
        return (bool) $message->delete();
    }
}
