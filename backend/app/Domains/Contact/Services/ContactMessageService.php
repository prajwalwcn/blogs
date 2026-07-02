<?php

declare(strict_types=1);

namespace App\Domains\Contact\Services;

use App\Domains\Contact\Models\ContactMessage;
use App\Domains\Contact\Repositories\ContactMessageRepository;
use Illuminate\Database\Eloquent\Collection;

class ContactMessageService
{
    public function __construct(
        protected ContactMessageRepository $contactMessageRepository
    ) {}

    /**
     * Get all contact messages.
     *
     * @return Collection<int, ContactMessage>
     */
    public function getAllMessages(): Collection
    {
        return $this->contactMessageRepository->getAll();
    }

    /**
     * Store a contact message submission.
     */
    public function storeMessage(array $data): ContactMessage
    {
        return $this->contactMessageRepository->create($data);
    }

    /**
     * Find message by ID.
     */
    public function findMessageById(int $id): ?ContactMessage
    {
        return $this->contactMessageRepository->find($id);
    }

    /**
     * Mark message as read/unread/replied.
     */
    public function updateMessageStatus(ContactMessage $message, string $status): bool
    {
        return $this->contactMessageRepository->updateStatus($message, $status);
    }

    /**
     * Delete message.
     */
    public function deleteMessage(ContactMessage $message): bool
    {
        return $this->contactMessageRepository->delete($message);
    }
}
