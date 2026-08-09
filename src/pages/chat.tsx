// src/pages/messages/[friendId].tsx
import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useConversation } from '@/hooks/use-messages'
import { useCurrentUser } from '@/hooks/use-current-user'
import { supabase } from '@/lib/supabase'

export default function ChatPage() {
  const { friendId } = useParams<{ friendId: string }>()
  const { userId } = useCurrentUser()
  const { messages, loading, sendMessage, markRead } = useConversation(friendId)
  const [text, setText] = useState('')
  const [friendName, setFriendName] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!friendId) return
    supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', friendId)
      .single()
      .then(({ data }) => setFriendName(data?.full_name || data?.username || null))
  }, [friendId])

  useEffect(() => {
    markRead()
  }, [messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const content = text
    setText('')
    try {
      await sendMessage(content)
    } catch {
      setText(content) // ব্যর্থ হলে টেক্সট ফেরত দিন, যাতে ইউজার হারিয়ে না ফেলে
    }
  }

  return (
    <div className="mx-auto mt-6 flex h-[70vh] max-w-lg flex-col">
      <div className="border-b pb-2">
        <Link to="/messages" className="text-xs text-muted-foreground hover:underline">
          ← ইনবক্স
        </Link>
        <h1 className="text-lg font-semibold">{friendName ?? '...'}</h1>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {loading && <p className="text-center text-sm text-muted-foreground">লোড হচ্ছে...</p>}
        {messages.map((m) => {
          const isMine = m.sender_id === userId
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  isMine ? 'bg-black text-white' : 'bg-muted'
                }`}
              >
                {m.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t pt-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="মেসেজ লিখুন..."
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          পাঠান
        </button>
      </form>
    </div>
  )
}
