import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChatService } from "../../services/api";
import type { ChatMessage } from "../../types/domain";

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    let mounted = true;
    setLoading(true);
    ChatService.messages(roomId)
      .then((list: any) => { if (mounted) setMessages(Array.isArray(list) ? list : []); })
      .catch((e) => { if (mounted) setError(e?.message || "불러오지 못했습니다."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [roomId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !input.trim()) return;
    setSending(true);
    try {
      await ChatService.sendMessage(roomId, { content: input });
      setInput("");
    } catch (err: any) {
      alert(err?.message || "전송 실패");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px", display: "grid", gap: 12 }}>
      <h2>채팅방</h2>
      {loading && <div>불러오는 중…</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, minHeight: 320 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 12, color: "#666" }}>{m.senderId}</div>
            <div>{m.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
        <input style={{ flex: 1 }} value={input} onChange={(e) => setInput(e.target.value)} placeholder="메시지를 입력하세요" />
        <button type="submit" disabled={sending}>{sending ? "전송 중…" : "전송"}</button>
      </form>
    </div>
  );
}





