<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domains\Contact\Services\ContactMessageService;
use App\Http\Requests\StoreContactMessageRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function __construct(
        protected ContactMessageService $contactService
    ) {}

    /**
     * Store a contact message submission (public access).
     */
    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        $message = $this->contactService->storeMessage($request->validated());

        return response()->json([
            'message' => 'Thank you! Your message has been sent successfully.',
            'data' => $message,
        ], 210);
    }

    /**
     * Display all contact messages for admin panel.
     */
    public function adminIndex(): JsonResponse
    {
        $messages = $this->contactService->getAllMessages();

        return response()->json([
            'data' => $messages,
        ]);
    }

    /**
     * Update a message status (read/unread/replied) for admin panel.
     */
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $message = $this->contactService->findMessageById($id);

        if (!$message) {
            return response()->json([
                'message' => 'Message not found',
            ], 404);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:unread,read,replied'],
        ]);

        $this->contactService->updateMessageStatus($message, $validated['status']);

        return response()->json([
            'message' => 'Message status updated successfully',
            'data' => $message->refresh(),
        ]);
    }

    /**
     * Delete a contact message for admin panel.
     */
    public function destroy(int $id): JsonResponse
    {
        $message = $this->contactService->findMessageById($id);

        if (!$message) {
            return response()->json([
                'message' => 'Message not found',
            ], 404);
        }

        $this->contactService->deleteMessage($message);

        return response()->json([
            'message' => 'Message deleted successfully',
        ]);
    }
}
