import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, MessageSquare, SendHorizonal } from 'lucide-react';
import { chatAPI } from '../api/endpoints';
import { mediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { formatDateTime } from '../utils/helpers.jsx';

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* ---------------- Load conversations ---------------- */
  const loadConversations = useCallback(async () => {
    try {
      const d = await chatAPI.conversations();
      setConversations(d.conversations || []);
      return d.conversations || [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /* ---------------- Load messages for the active conversation ---------------- */
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return undefined;
    }
    let cancelled = false;
    setLoadingMessages(true);
    chatAPI
      .messages(conversationId)
      .then((d) => {
        if (!cancelled) setMessages(d.messages || []);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });

    socket?.emit('chat:join', conversationId);
    return () => {
      cancelled = true;
      socket?.emit('chat:leave', conversationId);
    };
  }, [conversationId, socket]);

  /* ---------------- Real-time listeners ---------------- */
  useEffect(() => {
    if (!socket) return undefined;

    const onNewMessage = (msg) => {
      if (String(msg.conversationId) === String(conversationId)) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      loadConversations();
    };

    const onTyping = ({ conversationId: cid, userId, isTyping }) => {
      if (String(cid) === String(conversationId) && String(userId) !== String(user._id)) {
        setTypingUser(isTyping ? 'Someone is typing…' : null);
      }
    };

    socket.on('message:new', onNewMessage);
    socket.on('message:sent', onNewMessage);
    socket.on('typing', onTyping);
    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('message:sent', onNewMessage);
      socket.off('typing', onTyping);
    };
  }, [socket, conversationId, user, loadConversations]);

  /* ---------------- Auto scroll ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  /* ---------------- Send ---------------- */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!conversationId || (!text.trim() && !attachment)) return;

    setSending(true);
    try {
      let attachmentUrl = '';
      if (attachment) {
        const fd = new FormData();
        fd.append('attachment', attachment);
        const up = await chatAPI.uploadAttachment(fd);
        attachmentUrl = up.url;
      }
      await chatAPI.send({ conversationId, message: text.trim(), attachment: attachmentUrl });
      setText('');
      setAttachment(null);
      socket?.emit('typing', { conversationId, isTyping: false });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket || !conversationId) return;
    clearTimeout(typingTimeoutRef.current);
    socket.emit('typing', { conversationId, isTyping: true });
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId, isTyping: false });
    }, 1200);
  };

  /* ---------------- Conversation title helper ---------------- */
  const otherParticipant = (c) =>
    (c.participants || []).find((p) => String(p._id) !== String(user._id)) || {};

  const activeConv = conversations.find((c) => String(c._id) === String(conversationId));

  return (
    <div className="grid h-[calc(100vh-10rem)] grid-cols-1 gap-4 py-4 md:grid-cols-[320px_1fr]">
      {/* -------- Conversation list -------- */}
      <aside className={`card flex flex-col overflow-hidden ${conversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-bold text-slate-900">Chats</h2>
          <p className="text-xs text-slate-400">Conversations are private to you and the other party</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-slate-400">
              <MessageSquare size={28} />
              No conversations yet.
              <span className="text-xs">Open an item and tap “Message owner” to start one.</span>
            </div>
          ) : (
            conversations.map((c) => {
              const other = otherParticipant(c);
              const isActive = String(c._id) === String(conversationId);
              return (
                <button
                  key={c._id}
                  onClick={() => navigate(`/chat/${c._id}`)}
                  className={`flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    isActive ? 'bg-primary-50' : ''
                  }`}
                >
                  {other.profileImage ? (
                    <img src={mediaUrl(other.profileImage)} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                      {other.fullName?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {other.fullName || 'Unknown'}
                      </span>
                      {c.unreadCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                          {c.unreadCount}
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {c.itemId?.itemName ? `${c.itemId.type === 'lost' ? '🔍' : '🙋'} ${c.itemId.itemName}` : ''}
                      {c.lastMessage ? ` · ${c.lastMessage}` : ''}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* -------- Messages -------- */}
      <section className={`card flex flex-col overflow-hidden ${conversationId ? 'flex' : 'hidden md:flex'}`}>
        {!conversationId ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <MessageSquare size={32} />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <button className="md:hidden" onClick={() => navigate('/chat')}>←</button>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {otherParticipant(activeConv || { participants: [] }).fullName || 'Chat'}
                </p>
                <p className="text-xs text-slate-400">
                  about {activeConv?.itemId?.itemName || 'an item'}
                </p>
              </div>
              {activeConv?.itemId?._id && (
                <button
                  onClick={() => navigate(`/items/${activeConv.itemId._id}`)}
                  className="ml-auto text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  View item →
                </button>
              )}
            </header>

            <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50/60 p-4">
              {loadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No messages yet — say hello!
                </div>
              ) : (
                messages.map((m) => {
                  const mine = String(m.senderId?._id || m.senderId) === String(user._id);
                  return (
                    <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          mine ? 'rounded-br-md bg-primary-600 text-white' : 'rounded-bl-md bg-white text-slate-800'
                        }`}
                      >
                        {m.attachment && (
                          <img src={mediaUrl(m.attachment)} alt="attachment" className="mb-1.5 max-h-56 rounded-lg object-cover" />
                        )}
                        {m.message && <p className="whitespace-pre-line break-words">{m.message}</p>}
                        <p className={`mt-1 text-right text-[10px] ${mine ? 'text-primary-200' : 'text-slate-400'}`}>
                          {formatDateTime(m.createdAt)}
                          {mine && m.readStatus ? ' · Read' : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              {typingUser && (
                <div className="text-xs italic text-slate-400">{typingUser}</div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-100 p-3">
              <label className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                <ImagePlus size={20} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                />
              </label>
              {attachment && (
                <span className="max-w-[140px] truncate rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                  📎 {attachment.name}
                </span>
              )}
              <input
                className="input flex-1"
                placeholder="Type a message…"
                value={text}
                onChange={handleTyping}
                disabled={!conversationId}
              />
              <button type="submit" disabled={sending || (!text.trim() && !attachment)} className="btn-primary !px-3.5">
                <SendHorizonal size={18} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
