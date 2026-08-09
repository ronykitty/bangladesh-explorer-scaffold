// src/components/SocialActions.tsx
import { useState } from "react";
import { useLikes, useComments, copyShareLink } from "@/hooks/use-social";

interface Props {
  placeId: string;
  currentUserId: string | undefined;
}

export function SocialActions({ placeId, currentUserId }: Props) {
  const { likeCount, likedByMe, toggleLike } = useLikes(placeId, currentUserId);
  const { comments, addComment, deleteComment } = useComments(placeId, currentUserId);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const [posting, setPosting] = useState(false);

  const handleShare = async () => {
    const ok = await copyShareLink(placeId);
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setPosting(true);
    const { error } = await addComment(commentText);
    setPosting(false);
    if (!error) setCommentText("");
  };

  return (
    <div className="border-t border-border pt-3 mt-3">
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 ${likedByMe ? "text-red-500" : "text-muted-foreground"}`}
        >
          <span>{likedByMe ? "❤️" : "🤍"}</span>
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1 text-muted-foreground"
        >
          💬 <span>{comments.length}</span>
        </button>

        <button onClick={handleShare} className="flex items-center gap-1 text-muted-foreground">
          🔗 <span>{copied ? "কপি হয়েছে!" : "শেয়ার"}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-3">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2 text-sm">
                <img
                  src={c.profile?.avatar_url ?? "/default-avatar.png"}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <span className="font-medium">{c.profile?.username ?? "ইউজার"}</span>{" "}
                  <span>{c.content}</span>
                  {c.user_id === currentUserId && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="ml-2 text-xs text-muted-foreground hover:text-destructive"
                    >
                      মুছুন
                    </button>
                  )}
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-xs text-muted-foreground">এখনো কোনো কমেন্ট নেই</p>
            )}
          </div>

          {currentUserId && (
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                placeholder="কমেন্ট লিখুন..."
                className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
              />
              <button
                onClick={handlePostComment}
                disabled={posting || !commentText.trim()}
                className="rounded-md bg-primary text-primary-foreground px-3 py-1 text-sm disabled:opacity-50"
              >
                পাঠান
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
