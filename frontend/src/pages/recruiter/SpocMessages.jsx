import { MessageSquare, Send, Search, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  listConversations,
  getMessages,
  sendMessage,
  ensureConversation,
} from "../../api/spocMessages";
import { useAuth } from "../../context/AuthContext";

export default function SpocMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [loadError, setLoadError] = useState("");
  const location = useLocation();
  const targetJobId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("jobId");
  }, [location.search]);

  useEffect(() => {
    const load = async () => {
      setLoadingConvs(true);
      setLoadError("");
      try {
        if (targetJobId) {
          try {
            await ensureConversation(Number(targetJobId));
          } catch (err) {
            const message =
              err.response?.data?.message ||
              err.message ||
              "Unable to open conversation";
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
          handleSelect(toSelect);
        } else {
          setSelected(null);
          setThread([]);
        }
      } catch (e) {
        console.error("Failed to load conversations", e);
        setLoadError("Failed to load conversations");
      } finally {
        setLoadingConvs(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetJobId]);

  const handleSelect = async (conv) => {
    setSelected(conv);
    setLoadingThread(true);
    try {
      const msgs = await getMessages(conv.conversation_id, { limit: 100 });
      setThread(msgs);
      // update unread count locally
      setConversations((prev) =>
        prev.map((c) =>
          c.conversation_id === conv.conversation_id
            ? { ...c, unread_count: 0 }
            : c
        )
      );
    } catch (e) {
      console.error("Failed to load messages", e);
    } finally {
      setLoadingThread(false);
    }
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
        created_at: new Date().toISOString(),
      };
      setThread((prev) => [...prev, optimistic]);
      setInput("");
      const sent = await sendMessage(selected.conversation_id, content);
      // replace optimistic with actual
      setThread((prev) =>
        prev.map((m) => (m.message_id === optimistic.message_id ? sent : m))
      );
      // update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.conversation_id === selected.conversation_id
            ? {
                ...c,
                last_message: sent.content,
                last_message_at: sent.created_at,
              }
            : c
        )
      );
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setSending(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        (c.company_name || "").toLowerCase().includes(q) ||
        (c.job_role || "").toLowerCase().includes(q)
    );
  }, [query, conversations]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                SPOC Messages
              </h2>
              <p className="text-sm text-gray-500">
                Single Point of Contact Communications
              </p>
            </div>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company or role..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        {loadError && <p className="mt-3 text-xs text-red-500">{loadError}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5">
        <div className="md:col-span-2 border-r border-gray-200 max-h-[600px] overflow-y-auto">
          {loadingConvs ? (
            <div className="p-4 text-sm text-gray-500">
              Loading conversations...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No conversations</div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.conversation_id}
                onClick={() => handleSelect(c)}
                className={`w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  selected?.conversation_id === c.conversation_id
                    ? "bg-gray-50"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {c.company_name}
                      </h3>
                      {c.unread_count > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full min-w-5 h-5 px-2 flex items-center justify-center flex-shrink-0">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-1 truncate">
                      {c.job_role}
                    </p>
                    <p className="text-sm text-gray-600 truncate mb-1">
                      {c.last_message || "No messages yet"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {c.last_message_at
                        ? new Date(c.last_message_at).toLocaleString()
                        : ""}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="md:col-span-3 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selected ? selected.company_name : "Select a conversation"}
                </h3>
                {selected && selected.participant_name && (
                  <p className="text-xs text-gray-500">
                    Conversation with {selected.participant_name}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {selected ? selected.job_role : ""}
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto bg-gray-50"
            style={{ maxHeight: "400px" }}
          >
            {loadingThread && (
              <div className="text-sm text-gray-500">Loading messages...</div>
            )}
            {!loadingThread && selected && thread.length === 0 && (
              <div className="text-sm text-gray-500">
                No messages yet. Start the conversation.
              </div>
            )}
            {thread.map((m) => {
              const isMine = m.sender_id === user?.id;
              return (
                <div
                  key={m.message_id}
                  className={`flex gap-3 ${isMine ? "justify-end" : ""}`}
                >
                  {!isMine && (
                    <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`${
                      isMine
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-900"
                    } rounded-lg p-3 max-w-md shadow-sm`}
                  >
                    <p
                      className={`text-sm ${
                        isMine ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {m.content}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        isMine ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {new Date(m.created_at).toLocaleString()}
                    </p>
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
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={!selected}
              />
              <button
                onClick={handleSend}
                disabled={!selected || sending || input.trim().length === 0}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
