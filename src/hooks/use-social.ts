// src/hooks/use-social.ts
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CommentWithProfile } from "@/types/database";

// ---------- LIKES ----------
export function useLikes(placeId: string, currentUserId: string | undefined) {
  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLikes = useCallback(async () => {
    setLoading(true);
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("place_id", placeId);

    setLikeCount(count ?? 0);

    if (currentUserId) {
      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("place_id", placeId)
        .eq("user_id", currentUserId)
        .maybeSingle();
      setLikedByMe(!!data);
    }
    setLoading(false);
  }, [placeId, currentUserId]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  const toggleLike = useCallback(async () => {
    if (!currentUserId) return { error: "লাইক করতে লগইন করুন" };

    // Optimistic UI আপডেট
    if (likedByMe) {
      setLikedByMe(false);
      setLikeCount((c) => Math.max(0, c - 1));
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("place_id", placeId)
        .eq("user_id", currentUserId);
      if (error) fetchLikes(); // fail হলে রিসিঙ্ক
      return { error: error?.message ?? null };
    } else {
      setLikedByMe(true);
      setLikeCount((c) => c + 1);
      const { error } = await supabase
        .from("likes")
        .insert({ place_id: placeId, user_id: currentUserId });
      if (error) fetchLikes();
      return { error: error?.message ?? null };
    }
  }, [likedByMe, placeId, currentUserId, fetchLikes]);

  return { likeCount, likedByMe, loading, toggleLike };
}

// ---------- COMMENTS ----------
export function useComments(placeId: string, currentUserId: string | undefined) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("*, profile:profiles(id, username, avatar_url)")
      .eq("place_id", placeId)
      .order("created_at", { ascending: true });

    if (!error && data) setComments(data as unknown as CommentWithProfile[]);
    setLoading(false);
  }, [placeId]);

  useEffect(() => {
    fetchComments();

    // Realtime: নতুন কমেন্ট এলে লিস্ট অটো-আপডেট হবে
    const channel = supabase
      .channel(`comments-${placeId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `place_id=eq.${placeId}` },
        () => fetchComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [placeId, fetchComments]);

  const addComment = useCallback(
    async (content: string) => {
      if (!currentUserId) return { error: "কমেন্ট করতে লগইন করুন" };
      if (!content.trim()) return { error: "খালি কমেন্ট পাঠানো যাবে না" };

      const { error } = await supabase
        .from("comments")
        .insert({ place_id: placeId, user_id: currentUserId, content: content.trim() });

      return { error: error?.message ?? null };
    },
    [placeId, currentUserId]
  );

  const deleteComment = useCallback(async (commentId: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    return { error: error?.message ?? null };
  }, []);

  return { comments, loading, addComment, deleteComment };
}

// ---------- SHARE LINK ----------
export function getShareLink(placeId: string) {
  return `${window.location.origin}/places/${placeId}`;
}

export async function copyShareLink(placeId: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(getShareLink(placeId));
    return true;
  } catch {
    return false;
  }
}
