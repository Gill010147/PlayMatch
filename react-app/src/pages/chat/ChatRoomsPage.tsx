import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatService } from "../../services/api";
import type { ChatRoom } from "../../types/domain";

export default function ChatRoomsPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    ChatService.rooms()
      .then((list: any) => { if (mounted) setRooms(Array.isArray(list) ? list : []); })
      .catch((e) => { if (mounted) setError(e?.message || "불러오지 못했습니다."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <h2>내 채팅방</h2>
      {loading && <div>불러오는 중…</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
        {rooms.map((r) => (
          <li key={r.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
            <button onClick={() => navigate(`/chat/rooms/${r.id}`)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
              {r.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}





