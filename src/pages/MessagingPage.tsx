import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Paperclip,
  Search,
  Phone,
  Video,
  MoreVertical,
  Image,
  File,
  Smile,
  CheckCheck,
  Clock,
  Loader2,
  MessageCircle,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery';
import { messagingAPI, type Conversation, type Message } from '../services/messaging.api';

// ─── Conversation List Item ───────────────────────────────────────────────────

const ConversationItem: React.FC<{
  convo: Conversation;
  isActive: boolean;
  onClick: () => void;
}> = ({ convo, isActive, onClick }) => {
  const otherParticipant = convo.participants?.find(p => p.role !== 'patient') || convo.participants?.[0];
  const lastMsg = convo.lastMessage;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-3 border-blue-600'
          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-medium text-sm">
          {otherParticipant?.name?.[0] || '?'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
            {otherParticipant?.name || 'Unknown'}
          </span>
          {lastMsg && (
            <span className="text-xs text-slate-400 flex-shrink-0">
              {new Date(lastMsg.sentAt || lastMsg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {lastMsg?.content || 'No messages yet'}
        </p>
      </div>
      {(convo.unreadCount || 0) > 0 && (
        <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
          {convo.unreadCount}
        </span>
      )}
    </button>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ message: Message; isMine: boolean }> = ({ message, isMine }) => (
  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
    <div className={`max-w-[75%] ${
      isMine
        ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
        : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl rounded-bl-md border border-slate-200 dark:border-slate-600'
    } px-4 py-2.5 shadow-sm`}>
      {/* Attachment */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="mb-2">
          {message.attachments.map((att, i) => (
            <a
              key={i}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                isMine ? 'bg-blue-500 hover:bg-blue-400' : 'bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500'
              }`}
            >
              {att.type?.startsWith('image/') ? <Image className="h-4 w-4" /> : <File className="h-4 w-4" />}
              <span className="truncate">{att.name || 'Attachment'}</span>
            </a>
          ))}
        </div>
      )}

      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

      <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
        <span className="text-[10px]">
          {new Date(message.sentAt || message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
        {isMine && (
          message.readAt
            ? <CheckCheck className="h-3 w-3 text-blue-200" />
            : <Clock className="h-3 w-3" />
        )}
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const MessagingPage: React.FC = () => {
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Conversations
  const { data: conversations, isLoading: convosLoading, refetch: refetchConvos } = useApiQuery<Conversation[]>(
    'conversations',
    () => messagingAPI.getConversations()
  );

  // Messages for active conversation
  const { data: messages, isLoading: msgsLoading, refetch: refetchMsgs } = useApiQuery<Message[]>(
    `messages-${activeConvoId}`,
    () => messagingAPI.getMessages(activeConvoId!, 50),
    { enabled: !!activeConvoId, deps: [activeConvoId] }
  );

  // Send message mutation
  const sendMutation = useApiMutation(
    (params: { conversationId: string; content: string }) =>
      messagingAPI.sendMessage(params.conversationId, params.content),
    {
      onSuccess: () => {
        setMessageText('');
        refetchMsgs();
        refetchConvos();
      },
    }
  );

  // Auto-scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read when opening conversation
  useEffect(() => {
    if (activeConvoId) {
      messagingAPI.markAsRead(activeConvoId).catch(() => {});
    }
  }, [activeConvoId]);

  const handleSend = useCallback(() => {
    if (!messageText.trim() || !activeConvoId) return;
    sendMutation.mutate({ conversationId: activeConvoId, content: messageText.trim() });
  }, [messageText, activeConvoId]);

  const filteredConvos = (conversations || []).filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.participants?.some(p => p.name?.toLowerCase().includes(q)) ||
      c.lastMessage?.content?.toLowerCase().includes(q);
  });

  const activeConvo = conversations?.find(c => c.id === activeConvoId);
  const activeParticipant = activeConvo?.participants?.find(p => p.role !== 'patient') || activeConvo?.participants?.[0];

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 flex">
      {/* ═══ Left Sidebar: Conversation List ═══ */}
      <div className={`w-full md:w-80 lg:w-96 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col ${
        !showMobileList && activeConvoId ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Messages</h1>
            <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {convosLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-3 animate-pulse flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvos.length > 0 ? (
            filteredConvos.map(convo => (
              <ConversationItem
                key={convo.id}
                convo={convo}
                isActive={convo.id === activeConvoId}
                onClick={() => { setActiveConvoId(convo.id); setShowMobileList(false); }}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Right: Chat Area ═══ */}
      <div className={`flex-1 flex flex-col ${
        showMobileList && !activeConvoId ? 'hidden md:flex' : 'flex'
      }`}>
        {activeConvoId && activeConvo ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <button
                onClick={() => { setShowMobileList(true); setActiveConvoId(null); }}
                className="md:hidden p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">{activeParticipant?.name?.[0] || '?'}</span>
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-slate-900 dark:text-slate-100 text-sm">{activeParticipant?.name || 'Unknown'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeParticipant?.role || 'Provider'}</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                  <Video className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900">
              {msgsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : messages && messages.length > 0 ? (
                <>
                  {messages.map(msg => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isMine={msg.senderRole === 'patient'}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-end gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input ref={fileInputRef} type="file" className="hidden" />

                <div className="flex-1 relative">
                  <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm border-0 focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
                    style={{ minHeight: '40px' }}
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={!messageText.trim() || sendMutation.isLoading}
                  className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendMutation.isLoading
                    ? <Loader2 className="h-5 w-5 animate-spin" />
                    : <Send className="h-5 w-5" />
                  }
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Your Messages</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                Select a conversation to view messages, or start a new conversation with your healthcare provider.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;
