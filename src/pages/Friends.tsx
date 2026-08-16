import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getIncomingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriendship,
  getFriends,
  type FriendRequest,
  type Profile,
} from "../lib/friends";

export default function Friends() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<(Profile & { friendship_id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [reqs, fr] = await Promise.all([getIncomingRequests(user.id), getFriends(user.id)]);
      setRequests(reqs);
      setFriends(fr);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAccept(id: string) {
    await acceptFriendRequest(id);
    load();
  }
  async function handleDecline(id: string) {
    await declineFriendRequest(id);
    load();
  }
  async function handleRemove(friendshipId: string) {
    await removeFriendship(friendshipId);
    load();
  }

  return (
    <div id="page-slot">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="page-title">Friends</h1>
        <Link to="/find-friends" className="btn btn-primary btn-sm">
          + Find Friends
        </Link>
      </div>

      {loading && <div className="empty">লোড হচ্ছে...</div>}

      {!loading && requests.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, margin: "18px 0 8px" }}>Pending Requests</h2>
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {requests.map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{r.requester?.full_name || r.requester?.username}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleAccept(r.id)}>
                    Accept
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleDecline(r.id)}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 style={{ fontSize: 15, margin: "18px 0 8px" }}>Your Friends ({friends.length})</h2>
      {!loading && friends.length === 0 && <div className="empty">এখনো কোনো Friend নেই</div>}
      <div className="grid grid-3">
        {friends.map((f) => (
          <div key={f.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{f.full_name || f.username}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Link to={`/messages/${f.id}`} className="btn btn-outline btn-sm">
                Message
              </Link>
              <button className="btn btn-outline btn-sm" onClick={() => handleRemove(f.friendship_id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
