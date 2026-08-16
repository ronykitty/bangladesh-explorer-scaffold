// src/components/messages/Messages.tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useConversations } from '@/hooks/use-messages'
import { useConversation } from '@/hooks/use-messages'

function Avatar({
  fullName,
  username,
  avatarUrl,
}: {
  fullName: string | null
  username: string | null
  avatarUrl: string | null
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username ?? ''}
        className="h-10 w-10 rounded-full object-cover border border-[hsl(var(--line))]"
      />
    )
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent))]/15 font-serif text-[hsl(var(--accent-dark))]">
      {(fullName ?? username ?? '?').charAt(0).toUpperCase()}
    </div>
  )
}

/** বন্ধুদের সাথে চ্যাট — কনভারসেশন লিস্ট (বামে) + চ্যাট উইন্ডো (ডানে) */
export function Messages() {
  const { userId } = useCurrentUser()
  const { friendId } = useParams<{ friendId?: string }>()
  const navigate = useNavigate()

  const { conversations, loading: conversationsLoading } = useConversations()
  const { messages, loading: threadLoading, sendMessage, markRead } = useConversation(friendId)

  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (friendId) markRead()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendId, messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const activeConvo = conversations.find((c) => c.friend.id === friendId)

  async function handleSend() {
    const content = draft.trim()
    if (!content) return
    setDraft('')
    try {
      await sendMessage(content)
    } catch {
      setDraft(content) // পাঠাতে ব্যর্থ হলে খসড়া ফিরিয়ে দিন
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr] md:items-start">
      {/* কনভারসেশন লিস্ট */}
      <section className="glass rounded-xl overflow-hidden">
        <h3 className="border-b border-[hsl(var(--line))] px-4 py-3 font-serif text-sm text-[hsl(var(--accent-dark))]">
          💬 মেসেজ
        </h3>
        {conversationsLoading && (
          <p className="px-4 py-3 text-sm text-[hsl(var(--ink-soft))]">লোড হচ্ছে...</p>
        )}
        {!conversationsLoading && conversations.length === 0 && (
          <p className="px-4 py-3 text-sm text-[hsl(var(--ink-soft))]">
            এখনো কোনো বন্ধু নেই — আগে Friends পেজ থেকে কাউকে যোগ করুন
          </p>
        )}
        <ul>
          {conversations.map((c) => (
            <li key={c.friend.id}>
              <button
                onClick={() => navigate(`/messages/${c.friend.id}`)}
                className={`flex w-full items-center justify-between gap-2 border-b border-[hsl(var(--line))] px-4 py-3 text-left transition-colors hover:bg-[hsl(var(--accent))]/5 ${
                  c.friend.id === friendId ? 'bg-[hsl(var(--accent))]/10' : ''
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Avatar
                    fullName={c.friend.full_name}
                    username={c.friend.username}
                    avatarUrl={c.friend.avatar_url}
                  />
                  <div className="overflow-hidden">
                    <p className="truncate text-sm font-medium text-[hsl(var(--ink))]">
                      {c.friend.full_name ?? c.friend.username}
                    </p>
                    <p className="truncate text-xs text-[hsl(var(--ink-soft))]">
                      {c.lastMessage?.content ?? 'কথা শুরু করুন'}
                    </p>
                  </div>
                </div>
                {c.unreadCount > 0 && (
                  <span className="shrink-0 rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs font-medium text-white">
                    {c.unreadCount}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* চ্যাট উইন্ডো */}
      <section className="glass flex h-[70vh] flex-col rounded-xl p-4">
        {!friendId && (
          <div className="flex flex-1 items-center justify-center text-sm text-[hsl(var(--ink-soft))]">
            চ্যাট শুরু করতে বাঁ পাশ থেকে একজন বন্ধু বেছে নিন
          </div>
        )}
        {friendId && (
          <>
            <div className="mb-3 border-b border-[hsl(var(--line))] pb-3 font-serif text-sm text-[hsl(var(--accent-dark))]">
              {activeConvo?.friend.full_name ?? activeConvo?.friend.username ?? '...'}
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
              {threadLoading && (
                <p className="text-sm text-[hsl(var(--ink-soft))]">লোড হচ্ছে...</p>
              )}
              {!threadLoading && messages.length === 0 && (
                <p className="text-sm text-[hsl(var(--ink-soft))]">এখনো কোনো মেসেজ নেই — লিখা শুরু করুন</p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                    m.sender_id === userId
                      ? 'self-end bg-[hsl(var(--accent))] text-white'
                      : 'self-start bg-[hsl(var(--accent))]/10 text-[hsl(var(--ink))]'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="লিখুন..."
                className="flex-1 rounded-lg border border-[hsl(var(--line))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--ink))] outline-none focus:border-[hsl(var(--accent))]"
              />
              <button
                onClick={handleSend}
                className="rounded-lg bg-[hsl(var(--accent))] px-4 py-2 text-sm font-medium text-white"
              >
                পাঠান
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
