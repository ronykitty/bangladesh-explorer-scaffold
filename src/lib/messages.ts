import { supabase } from "./supabase";
import { getFriends, type Profile } from "./friends";

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

export type Conversation = {
  friend: Profile;
  lastMessage: Message | null;
  unreadCount: number;
};

/** Build a conversation list: one row per accepted friend, with their last message. */
export async function getConversations(myId: string): Promise<Conversation[]> {
  const friends = await getFriends(myId);

  const { data: msgs, error: mErr } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
    .order("created_at", { ascending: false });
  if (mErr) throw mErr;

  return friends
    .map((friend) => {
      const withThem = (msgs ?? []).filter(
        (m) => m.sender_id === friend.id || m.receiver_id === friend.id
      );
      const unreadCount = withThem.filter((m) => m.receiver_id === myId && !m.read_at).length;
      return { friend, lastMessage: withThem[0] ?? null, unreadCount };
    })
    .sort((a, b) => {
      const ta = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
      const tb = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
      return tb - ta;
    });
}

export async function getConversation(myId: string, friendId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${myId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${myId})`
    )
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Only works if the two users have an accepted friendship — enforced by RLS. */
export async function sendMessage(senderId: string, receiverId: string, content: string) {
  const { error } = await supabase
    .from("messages")
    .insert({ sender_id: senderId, receiver_id: receiverId, content });
  if (error) throw error;
}

export async function markRead(myId: string, friendId: string) {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("sender_id", friendId)
    .eq("receiver_id", myId)
    .is("read_at", null);
}

/** Subscribe to new messages addressed to me (optionally filtered to one friend). */
export function subscribeToMessages(myId: string, onInsert: (m: Message) => void, friendId?: string) {
  const channel = supabase
    .channel(`messages-${myId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${myId}` },
      (payload) => {
        const m = payload.new as Message;
        if (!friendId || m.sender_id === friendId) onInsert(m);
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
