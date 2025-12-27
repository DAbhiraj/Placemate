import { MessageSquare, Send, Search, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { listConversations, getMessages, sendMessage, ensureConversation } from '../../api/spocMessages';
import { useAuth } from '../../context/AuthContext';

export default function SpocJobNegotiation() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState('');
  const [input, setInput] = useState('');
  const [loadError, setLoadError] = useState('');

  const targetJobId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('jobId');
  }, [location.search]);

  useEffect(() => {
    const load = async () => {
      setLoadingConvs(true);
      setLoadError('');
      try {
        if (targetJobId) {
          try {
            await ensureConversation(Number(targetJobId));
          } catch (err) {
            const message = err.response?.data?.message || err.message || 'Unable to open conversation';
            setLoadError(message);
          }
        }
        const convs = await listConversations();
        setConversations(convs);
        if (convs.length > 0) {
          const matched = targetJobId
            ? convs.find((c) => String(c.job_id) === String(targetJobId))
            : null;
          const toSelect = matched || convs[0];
          setSelected(toSelect);
          await loadThread(toSelect);
        } else {
          setSelected(null);
          setThread([]);
        }
      } catch (err) {
        console.error('Failed to load conversations', err);
        setLoadError('Failed to load conversations');
      } finally {
        setLoadingConvs(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetJobId]);

  const loadThread = async (conv) => {
    if (!conv) return;
    setLoadingThread(true);
    try {
      const msgs = await getMessages(conv.conversation_id, { limit: 100 });
      setThread(msgs);
      setConversations((prev) => prev.map((c) =>
        c.conversation_id === conv.conversation_id
          ? { ...c, unread_count: 0 }
          : c
      ));
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoadingThread(false);
    }
  };

  const handleSelect = async (conv) => {
    setSelected(conv);
    await loadThread(conv);
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || !selected) return;
    setSending(true);
    try {
      const optimistic = {
        message_id: Date.now(),
        sender_id: user?.id,
        recipient_id: null,
        content,
        is_read: true,
        created_at: new Date().toISOString()
      };
      setThread((prev) => [...prev, optimistic]);
      setInput('');
      const sent = await sendMessage(selected.conversation_id, content);
      setThread((prev) => prev.map((m) => (m.message_id === optimistic.message_id ? sent : m)));
      setConversations((prev) => prev.map((c) =>
        c.conversation_id === selected.conversation_id
          ? { ...c, last_message: sent.content, last_message_at: sent.created_at }
          : c
      ));
      setSelected((prev) => prev && prev.conversation_id === selected.conversation_id
        ? { ...prev, last_message: sent.content, last_message_at: sent.created_at }
        : prev
      );
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      `${c.company_name || ''} ${c.job_role || ''}`.toLowerCase().includes(q)
    );
  }, [query, conversations]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Recruiter Messages</h1>
                <p className="text-sm text-gray-500">Coordinate roles and approvals with recruiters</p>
              </div>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="search"
                aria-label="Search conversations"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search company or job"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>
          {loadError && (
            <p className="mt-3 text-xs text-red-500">{loadError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr]">
          <div className="border-r border-gray-200 bg-gray-50 max-h-[640px] overflow-y-auto">
            {loadingConvs ? (
              <div className="p-4 text-sm text-gray-500">Loading conversations…</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No conversations yet</div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = selected?.conversation_id === conv.conversation_id;
                return (
                  <button
                    key={conv.conversation_id}
                    onClick={() => handleSelect(conv)}
                    className={`w-full text-left p-4 border-b border-gray-200 transition ${isActive ? 'bg-white shadow-sm' : 'bg-gray-50 hover:bg-white'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-600 rounded-full w-11 h-11 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{conv.company_name}</h3>
                          {conv.unread_count > 0 && (
                            <span className="text-xs font-semibold bg-blue-600 text-white rounded-full px-2 py-0.5">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{conv.job_role}</p>
                        <p className="text-sm text-gray-600 truncate mt-1">{conv.last_message || 'No messages yet'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{conv.last_message_at ? new Date(conv.last_message_at).toLocaleString() : ''}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
              <div className="bg-blue-600 rounded-full w-11 h-11 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selected ? selected.company_name : 'Select a conversation'}</h2>
                {selected && (
                  <p className="text-xs text-gray-500">
                    Chat with {selected.participant_name || 'the recruiter'} about {selected.job_role}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 p-4 sm:p-6 bg-white overflow-y-auto" style={{ minHeight: '380px' }}>
              {loadingThread && (
                <p className="text-sm text-gray-500">Loading messages…</p>
              )}
              {!loadingThread && selected && thread.length === 0 && (
                <p className="text-sm text-gray-500">No messages yet. Start the conversation.</p>
              )}
              {thread.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.message_id} className={`flex gap-3 mb-4 ${isMine ? 'justify-end' : ''}`}>
                    {!isMine && (
                      <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-semibold text-white">
                        R
                      </div>
                    )}
                    <div className={`${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'} rounded-2xl px-4 py-3 shadow-sm max-w-[20rem] sm:max-w-lg`}> 
                      <p className={`text-sm ${isMine ? 'text-white' : 'text-gray-900'}`}>{msg.content}</p>
                      <p className={`text-xs mt-2 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                  placeholder="Type your message..."
                  disabled={!selected}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  onClick={handleSend}
                  disabled={!selected || sending || input.trim().length === 0}
                  className="px-5 py-3 bg-blue-600 text-white rounded-2xl flex items-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

