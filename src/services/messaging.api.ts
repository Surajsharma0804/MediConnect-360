// Messaging API Service
// Maps to: backend/src/messaging/controllers/

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    profileImage?: string;
    role: string;
  }>;
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }>;
  readBy: string[];
  createdAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const messagingAPI = {
  /** Get all conversations for current user */
  getConversations: () =>
    api.get<Conversation[]>('/messaging/conversations'),

  /** Get a single conversation */
  getConversation: (id: string) =>
    api.get<Conversation>(`/messaging/conversations/${id}`),

  /** Create a new conversation (start a chat with a provider) */
  createConversation: (participantIds: string[]) =>
    api.post<Conversation>('/messaging/conversations', { participantIds }),

  /** Get messages in a conversation */
  getMessages: (conversationId: string, limit?: number, before?: string) =>
    api.get<Message[]>(`/messaging/conversations/${conversationId}/messages`, {
      params: { limit, before },
    }),

  /** Send a message */
  sendMessage: (conversationId: string, content: string, type?: string) =>
    api.post<Message>(`/messaging/conversations/${conversationId}/messages`, {
      content,
      type: type || 'text',
    }),

  /** Send a message with attachment */
  sendAttachment: (conversationId: string, file: File, content?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (content) formData.append('content', content);
    return api.upload<Message>(`/messaging/conversations/${conversationId}/messages/attachment`, formData);
  },

  /** Mark messages as read */
  markAsRead: (conversationId: string) =>
    api.post(`/messaging/conversations/${conversationId}/read`),

  /** Get unread count across all conversations */
  getUnreadCount: () =>
    api.get<{ count: number }>('/messaging/unread'),
};

export default messagingAPI;
