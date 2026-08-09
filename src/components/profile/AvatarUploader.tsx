// src/components/AvatarUploader.tsx
import { useRef, useState } from "react";
import { useProfile } from "@/hooks/use-profile";

interface Props {
  userId: string;
}

export function AvatarUploader({ userId }: Props) {
  const { profile, loading, uploadAvatar, updateProfile } = useProfile(userId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [bio, setBio] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage("ছবির সাইজ ২MB এর কম হতে হবে");
      return;
    }

    setUploading(true);
    setMessage(null);
    const { error } = await uploadAvatar(file);
    setUploading(false);
    setMessage(error ? `আপলোড ব্যর্থ: ${error}` : "প্রোফাইল ছবি আপডেট হয়েছে");
  };

  const handleBioSave = async () => {
    setSavingBio(true);
    const { error } = await updateProfile({ bio });
    setSavingBio(false);
    setMessage(error ? `সেভ ব্যর্থ: ${error}` : "বায়ো সেভ হয়েছে");
  };

  if (loading) {
    return <div className="animate-pulse h-24 w-24 rounded-full bg-muted" />;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="relative">
        <img
          src={profile?.avatar_url ?? "/default-avatar.png"}
          alt="Avatar"
          className="h-24 w-24 rounded-full object-cover border-2 border-border"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground text-xs px-2 py-1 shadow disabled:opacity-50"
        >
          {uploading ? "..." : "পরিবর্তন"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="w-full max-w-sm">
        <textarea
          defaultValue={profile?.bio ?? ""}
          onChange={(e) => setBio(e.target.value)}
          placeholder="নিজের সম্পর্কে কিছু লিখুন..."
          maxLength={280}
          rows={3}
          className="w-full rounded-md border border-border bg-background p-2 text-sm resize-none"
        />
        <button
          onClick={handleBioSave}
          disabled={savingBio}
          className="mt-2 w-full rounded-md bg-primary text-primary-foreground py-1.5 text-sm disabled:opacity-50"
        >
          {savingBio ? "সেভ হচ্ছে..." : "বায়ো সেভ করুন"}
        </button>
      </div>

      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
