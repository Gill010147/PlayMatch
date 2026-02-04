import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatService } from "../../services/chatService";
import { ChatRoom } from "../../types/domain";

export default function ChatRoomsPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await chatService.getRooms();
      setRooms(data || []);
    } catch (error) {
      console.error("채팅방 목록 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastMessageTime = (lastMessageAt?: string) => {
    if (!lastMessageAt) return "";
    
    const now = new Date();
    const messageTime = new Date(lastMessageAt);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return messageTime.toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
        <h2>채팅방 목록</h2>
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: "24px", marginBottom: "16px" }}>💬</div>
          <div>채팅방을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2>채팅방 목록</h2>
      </div>

      {rooms.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#666" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
          <div style={{ fontSize: "18px", marginBottom: "8px" }}>아직 참여한 채팅방이 없습니다</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {rooms.map((room) => (
            <div
              key={room.id} // Assuming room object has a unique id
              onClick={() => navigate(`/chat/rooms/${room.id}`)}
              style={{
                padding: "16px",
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s",
                backgroundColor: "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.borderColor = "rgba(70, 55, 238, 0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fff";
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", fontSize: "16px", marginBottom: "4px", color: "#333" }}>
                    {room.name}
                  </div>
                  <div style={{ color: "#666", fontSize: "14px" }}>
                    {room.lastMessageAt ? "마지막 활동: " + formatLastMessageTime(room.lastMessageAt) : "새로운 채팅방"}
                  </div>
                </div>
                <div style={{ color: "#999", fontSize: "12px", marginLeft: "12px" }}>
                  <div style={{ fontSize: "20px" }}>💬</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}