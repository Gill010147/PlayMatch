import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { chatService } from "../../services/chatService";
import { AuthService } from "../../services/api";
import { ChatMessage, ChatRoom } from "../../types/domain";

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [room, setRoom] = useState<ChatRoom | null>(state?.room || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await AuthService.me();
        setCurrentUserId(parseInt(user.id, 10));
      } catch (error) {
        console.error("현재 사용자 정보 로드 실패:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!roomId) return;

    loadRoomData();
    chatService.connect();

    const unsubscribe = chatService.subscribeToRoom(roomId, (message) => {
      // STOMP 메시지에는 roomId가 없을 수 있으므로, 현재 roomId를 추가해줍니다.
      const messageWithRoomId = { ...message, roomId };
      setMessages(prev => [...prev, messageWithRoomId]);
    });

    chatService.updateReadTime(roomId);

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRoomData = async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      if (!room) {
        const roomsData = await chatService.getRooms();
        const currentRoom = roomsData.find(r => String(r.id) === roomId);
        setRoom(currentRoom || { id: roomId, name: "알 수 없는 채팅방" });
      }
      const messagesData = await chatService.getMessages(roomId);
      setMessages(messagesData);
    } catch (error) {
      console.error("채팅방 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId) return;
    const messageText = newMessage.trim();
    setNewMessage("");
    chatService.sendMessage(roomId, messageText);
  };

  const formatMessageTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentUser = (senderId: number) => {
    return senderId === currentUserId;
  };

  if (loading || !currentUserId) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "16px 0", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => navigate("/chat/rooms")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", padding: "4px" }}>
          ←
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>{room?.name || "채팅방"}</h2>
          <div style={{ fontSize: "12px", color: "#666" }}>{chatService.isWebSocketConnected() ? "실시간 연결됨" : "연결 끊김"}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.map((message) => (
          <div key={message.messageId} style={{ display: "flex", justifyContent: isCurrentUser(message.senderId) ? "flex-end" : "flex-start", marginBottom: "8px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: isCurrentUser(message.senderId) ? "flex-end" : "flex-start" }}>
              {!isCurrentUser(message.senderId) && <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{message.senderName}</div>}
              <div style={{ maxWidth: "70%", padding: "12px 16px", borderRadius: "18px", backgroundColor: isCurrentUser(message.senderId) ? "rgba(70, 55, 238, 1)" : "#f1f3f4", color: isCurrentUser(message.senderId) ? "#fff" : "#333", wordWrap: "break-word", position: "relative" }}>
                <div style={{ fontSize: "14px", lineHeight: "1.4" }}>{message.message}</div>
                <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "4px", textAlign: "right" }}>{formatMessageTime(message.createdAt)}</div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "16px 0", borderTop: "1px solid #e0e0e0", backgroundColor: "#fff", position: "sticky", bottom: 0 }}>
        <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            style={{ flex: 1, padding: "12px 16px", border: "1px solid #ddd", borderRadius: "24px", fontSize: "16px", outline: "none" }}
          />
          <button type="submit" disabled={!newMessage.trim()} style={{ padding: "12px 20px", backgroundColor: newMessage.trim() ? "rgba(70, 55, 238, 1)" : "#ccc", color: "#fff", border: "none", borderRadius: "24px", cursor: newMessage.trim() ? "pointer" : "not-allowed", fontWeight: "500" }}>
            전송
          </button>
        </form>
      </div>
    </div>
  );
}