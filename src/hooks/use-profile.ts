// src/hooks/use-profile.ts
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) setError(error.message);
    else setProfile(data as Profile);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // বায়ো / ইউজারনেম / এভাটার আপডেট
  const updateProfile = useCallback(
    async (updates: Partial<Pick<Profile, "username" | "full_name" | "bio" | "avatar_url">>) => {
      if (!userId) return { error: "Not authenticated" };
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (!error && data) setProfile(data as Profile);
      return { data, error: error?.message ?? null };
    },
    [userId]
  );

  // এভাটার আপলোড: Supabase Storage-এ ফাইল রেখে avatar_url সেভ করে
  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!userId) return { error: "Not authenticated" };

      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) return { error: uploadError.message };

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // ক্যাশ-বাস্টিং টাইমস্ট্যাম্প যোগ করা হচ্ছে, না হলে পুরনো ছবি cache থেকে দেখাতে পারে
      const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

      const result = await updateProfile({ avatar_url: avatarUrl });
      return result;
    },
    [userId, updateProfile]
  );

  return { profile, loading, error, updateProfile, uploadAvatar, refetch: fetchProfile };
}
