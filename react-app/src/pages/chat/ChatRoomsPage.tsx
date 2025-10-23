import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatService } from "../../services/chatService";
import { ChatRoom } from "../../types/domain";

export default function ChatRoomsPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showDirectChatForm, setShowDirectChatForm] = useState(false);
  const [participantId, setParticipantId] = useState("");
  const [creatingDirect, setCreatingDirect] = useState(false);

  useEffect(() => {
    loadRooms();
    
    // 실시간 채팅방 목록 업데이트
    const handleRoomsUpdate = (updatedRooms: ChatRoom[]) => {
      setRooms(updatedRooms);
    };
    
    chatService.onRoomsUpdate(handleRoomsUpdate);
    
    return () => {
      chatService.offRoomsUpdate(handleRoomsUpdate);
    };
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

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    try {
      setCreating(true);
      const newRoom = await chatService.createRoom(newRoomName.trim(), []);
      setRooms(prev => [newRoom, ...prev]);
      setNewRoomName("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("채팅방 생성 실패:", error);
      alert("채팅방 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateDirectChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId.trim()) return;
    
    try {
      setCreatingDirect(true);
      const newRoom = await chatService.createOrGetRoom(participantId.trim());
      setRooms(prev => [newRoom, ...prev]);
      setParticipantId("");
      setShowDirectChatForm(false);
      // 1:1 채팅방으로 바로 이동
      navigate(`/chat/rooms/${newRoom.id}`);
    } catch (error) {
      console.error("1:1 채팅방 생성 실패:", error);
      alert("1:1 채팅방 생성에 실패했습니다.");
    } finally {
      setCreatingDirect(false);
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
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setShowDirectChatForm(!showDirectChatForm)}
            style={{
              padding: "10px 16px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            {showDirectChatForm ? "취소" : "1:1 채팅"}
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: "10px 16px",
              backgroundColor: "rgba(70, 55, 238, 1)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            {showCreateForm ? "취소" : "그룹 채팅"}
          </button>
        </div>
      </div>

      {showDirectChatForm && (
        <form onSubmit={handleCreateDirectChat} style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#e8f5e8", borderRadius: "12px" }}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              상대방 사용자 ID
            </label>
            <input
              type="text"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              placeholder="채팅할 사용자의 ID를 입력하세요"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "16px"
              }}
              required
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="submit"
              disabled={creatingDirect}
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              {creatingDirect ? "생성 중..." : "1:1 채팅 시작"}
            </button>
            <button
              type="button"
              onClick={() => setShowDirectChatForm(false)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              취소
            </button>
          </div>
        </form>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreateRoom} style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "12px" }}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              채팅방 이름
            </label>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="채팅방 이름을 입력하세요"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "16px"
              }}
              required
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="submit"
              disabled={creating}
              style={{
                padding: "10px 20px",
                backgroundColor: "rgba(70, 55, 238, 1)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              {creating ? "생성 중..." : "그룹 채팅 생성"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              취소
            </button>
          </div>
        </form>
      )}

      {rooms.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#666" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
          <div style={{ fontSize: "18px", marginBottom: "8px" }}>아직 참여한 채팅방이 없습니다</div>
          <div style={{ fontSize: "14px" }}>
            채팅방을 생성하거나 초대를 받아보세요.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {rooms.map((room) => (
            <div
              key={room.id}
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

      {!chatService.isWebSocketConnected() && (
        <div style={{ 
          marginTop: "16px", 
          padding: "12px", 
          backgroundColor: "#fff3cd", 
          border: "1px solid #ffeaa7", 
          borderRadius: "8px",
          color: "#856404",
          fontSize: "14px"
        }}>
          ⚠️ 실시간 연결이 끊어졌습니다. 새로고침을 시도해주세요.
        </div>
      )}
    </div>
  );
}