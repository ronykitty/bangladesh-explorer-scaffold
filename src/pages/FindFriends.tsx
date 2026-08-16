import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth"; // adjust import to wherever your session/user hook lives
import { searchUsers, sendFriendRequest, getRelationshipMap, type Profile } from "../lib/friends";

export default function FindFriends() {
  const { user } = useAuth(); // expects { user: { id: string } }
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sentJustNow, setSentJustNow] = useState<Set<string>>(new Set());

  const runSearch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profiles, rel] = await Promise.all([
        searchUsers(query, user.id),
        getRelationshipMap(user.id),
      ]);
      setResults(profiles);
      setPending(rel.pending);
      setFriendIds(rel.friendIds);
    } finally {
      setLoading(false);
    }
  }, [query, user]);

  useEffect(() => {
    const t = setTimeout(runSearch, 300); // debounce
    return () => clearTimeout(t);
  }, [runSearch]);

  async function handleAdd(addresseeId: string) {
    if (!user) return;
    await sendFriendRequest(user.id, addresseeId);
    setSentJustNow((prev) => new Set(prev).add(addresseeId));
  }

  return (
    <div id="page-slot">
      <h1 className="page-title">Find Friends</h1>
      <p className="page-sub">নাম বা ইউজারনেম দিয়ে খুঁজুন</p>

      <div className="card">
        <input
          type="text"
          placeholder="খুঁজুন..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        {loading && <div className="empty">খোঁজা হচ্ছে...</div>}
        {!loading && query.trim() && results.length === 0 && (
          <div className="empty">কাউকে পাওয়া যায়নি</div>
        )}
        <div className="grid grid-3">
          {results.map((p) => {
            const isFriend = friendIds.has(p.id);
            const isPending = pending.has(p.id) || sentJustNow.has(p.id);
            return (
              <div key={p.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "var(--teal-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    {(p.full_name || p.username || "?")[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.full_name || p.username}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>@{p.username}</div>
                  </div>
                </div>
                {isFriend ? (
                  <button className="btn btn-outline btn-sm" disabled>
                    ✓ Friend
                  </button>
                ) : isPending ? (
                  <button className="btn btn-outline btn-sm" disabled>
                    Requested
                  </button>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => handleAdd(p.id)}>
                    + Add Friend
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
