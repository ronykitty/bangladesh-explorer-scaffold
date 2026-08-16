import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getConversations,
  getConversation,
  sendMessage,
  markRead,
  subscribeToMessages,
  type Conversation,
  type Message,
} from "../lib/messages";

export default function Messages() {
  const { user } = useAuth();
  const { friendId } = useParams<{ friendId?: string }>();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [thread, setThread] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setConversations(await getConversations(user.id));
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!user || !friendId) return;
    let cancelled = false;
    (async () => {
      const msgs = await getConversation(user.id, friendId);
      if (!cancelled) setThread(msgs);
      await markRead(user.id, friendId);
    })();
    const unsubscribe = subscribeToMessages(
      user.id,
      (m) => setThread((prev) => [...prev, m]),
      friendId
    );
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user, friendId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  async function handleSend() {
    if (!user || !friendId || !draft.trim()) return;
    const content = draft.trim();
    setDraft("");
    await sendMessage(user.id, friendId, content);
    setThread((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender_id: user.id, receiver_id: friendId, content, created_at: new Date().toISOString(), read_at: null },
    ]);
  }

  const activeConvo = conversations.find((c) => c.friend.id === friendId);

  return (
    <div id="page-slot">
      <h1 className="page-title">Messages</h1>
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        {/* Conversation list */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {conversations.length === 0 && <div className="empty">কোনো ফ্রেন্ড নেই এখনো — Find Friends থেকে যোগ করুন</div>}
          {conversations.map((c) => (
            <div
              key={c.friend.id}
              onClick={() => navigate(`/messages/${c.friend.id}`)}
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid var(--line)",
                cursor: "pointer",
                background: c.friend.id === friendId ? "var(--teal-light)" : "transparent",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{c.friend.full_name || c.friend.username}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.lastMessage?.content ?? "কথা শুরু করুন"}
                </div>
              </div>
              {c.unreadCount > 0 && (
                <span className="pill pill-income">{c.unreadCount}</span>
              )}
            </div>
          ))}
        </div>

        {/* Chat window */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: 480 }}>
          {!friendId && <div className="empty">চ্যাট শুরু করতে বাঁ পাশ থেকে একজন ফ্রেন্ড বেছে নিন</div>}
          {friendId && (
            <>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                {activeConvo?.friend.full_name || activeConvo?.friend.username || "..."}
              </div>
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {thread.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.sender_id === user?.id ? "flex-end" : "flex-start",
                      background: m.sender_id === user?.id ? "var(--navy)" : "var(--paper)",
                      color: m.sender_id === user?.id ? "#fff" : "var(--text)",
                      padding: "8px 12px",
                      borderRadius: 12,
                      maxWidth: "75%",
                      fontSize: 13.5,
                    }}
                  >
                    {m.content}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input
                  type="text"
                  placeholder="লিখুন..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={handleSend}>
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
