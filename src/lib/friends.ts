import { supabase } from "./supabase";

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export type FriendshipStatus = "pending" | "accepted" | "declined" | "blocked";

export type FriendRequest = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  requester?: Profile;
};

/** Search profiles by username / full name (excludes yourself). */
export async function searchUsers(query: string, myId: string): Promise<Profile[]> {
  if (!query.trim()) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .neq("id", myId)
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

/** Requests I've sent that are still pending, and my current friend ids —
 * used to render "Add friend" vs "Requested" vs "Friends" on search results. */
export async function getRelationshipMap(myId: string) {
  const { data, error } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id, status")
    .or(`requester_id.eq.${myId},addressee_id.eq.${myId}`);
  if (error) throw error;

  const pending = new Set<string>();
  const friendIds = new Set<string>();
  for (const row of data ?? []) {
    const other = row.requester_id === myId ? row.addressee_id : row.requester_id;
    if (row.status === "accepted") friendIds.add(other);
    else if (row.status === "pending" && row.requester_id === myId) pending.add(other);
  }
  return { pending, friendIds };
}

export async function sendFriendRequest(myId: string, addresseeId: string) {
  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: myId, addressee_id: addresseeId, status: "pending" });
  if (error) throw error;
}

/** Requests other people sent to me, still pending. */
export async function getIncomingRequests(myId: string): Promise<FriendRequest[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status, created_at, requester:requester_id(id, username, full_name, avatar_url)")
    .eq("addressee_id", myId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as FriendRequest[]) ?? [];
}

export async function acceptFriendRequest(friendshipId: string) {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId);
  if (error) throw error;
}

export async function declineFriendRequest(friendshipId: string) {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "declined" })
    .eq("id", friendshipId);
  if (error) throw error;
}

export async function removeFriendship(friendshipId: string) {
  const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
  if (error) throw error;
}

/** My accepted friends, with the friendship row id (needed to unfriend). */
export async function getFriends(myId: string): Promise<(Profile & { friendship_id: string })[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select(
      "id, requester_id, addressee_id, requester:requester_id(id, username, full_name, avatar_url), addressee:addressee_id(id, username, full_name, avatar_url)"
    )
    .eq("status", "accepted")
    .or(`requester_id.eq.${myId},addressee_id.eq.${myId}`);
  if (error) throw error;

  return ((data as unknown as {
    id: string;
    requester_id: string;
    addressee_id: string;
    requester: Profile;
    addressee: Profile;
  }[]) ?? []).map((row) => {
    const friend = row.requester_id === myId ? row.addressee : row.requester;
    return { ...friend, friendship_id: row.id };
  });
}
