import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { chatService } from "../../services/chatService";
import { ChatMessage, ChatRoom } from "../../types/domain";

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!roomId) return;

    loadRoomData();
    
    // 실시간 메시지 수신
    const handleMessage = (message: ChatMessage) => {
      if (message.roomId === roomId) {
        setMessages(prev => [...prev, message]);
      }
    };

    chatService.onMessage(handleMessage);

    return () => {
      chatService.offMessage(handleMessage);
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRoomData = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      
      // 채팅방 정보와 메시지 목록을 병렬로 로드
      const [roomsData, messagesData] = await Promise.all([
        chatService.getRooms(),
        chatService.getMessages(roomId)
      ]);

      const currentRoom = roomsData.find(r => r.id === roomId);
      setRoom(currentRoom || { id: roomId, name: "알 수 없는 채팅방" });
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      await chatService.sendMessage(roomId, messageText);
      
      // 로컬에 메시지 추가 (실제로는 서버에서 받아옴)
      const tempMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        roomId,
        senderId: "current_user", // 실제로는 현재 사용자 ID
        content: messageText,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempMessage]);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      alert("메시지 전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentUser = (senderId: string) => {
    return senderId === "current_user"; // 실제로는 현재 사용자 ID와 비교
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: "24px", marginBottom: "16px" }}>💬</div>
          <div>채팅방을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      {/* 채팅방 헤더 */}
      <div style={{ 
        padding: "16px 0", 
        borderBottom: "1px solid #e0e0e0", 
        display: "flex", 
        alignItems: "center", 
        gap: "12px",
        backgroundColor: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <button
          onClick={() => navigate("/chat/rooms")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            padding: "4px"
          }}
        >
          ←
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
            {room?.name || "채팅방"}
          </h2>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {chatService.isWebSocketConnected() ? "실시간 연결됨" : "연결 끊김"}
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "16px 0",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#666" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
            <div>아직 메시지가 없습니다</div>
            <div style={{ fontSize: "14px", marginTop: "8px" }}>
              첫 번째 메시지를 보내보세요!
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: "flex",
                justifyContent: isCurrentUser(message.senderId) ? "flex-end" : "flex-start",
                marginBottom: "8px"
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "12px 16px",
                  borderRadius: "18px",
                  backgroundColor: isCurrentUser(message.senderId) 
                    ? "rgba(70, 55, 238, 1)" 
                    : "#f1f3f4",
                  color: isCurrentUser(message.senderId) ? "#fff" : "#333",
                  wordWrap: "break-word",
                  position: "relative"
                }}
              >
                <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
                  {message.content}
                </div>
                <div style={{ 
                  fontSize: "11px", 
                  opacity: 0.7, 
                  marginTop: "4px",
                  textAlign: "right"
                }}>
                  {formatMessageTime(message.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <div style={{ 
        padding: "16px 0", 
        borderTop: "1px solid #e0e0e0",
        backgroundColor: "#fff",
        position: "sticky",
        bottom: 0
      }}>
        <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px" }}>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #ddd",
              borderRadius: "24px",
              fontSize: "16px",
              outline: "none"
            }}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            style={{
              padding: "12px 20px",
              backgroundColor: newMessage.trim() && !sending 
                ? "rgba(70, 55, 238, 1)" 
                : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: "24px",
              cursor: newMessage.trim() && !sending ? "pointer" : "not-allowed",
              fontWeight: "500"
            }}
          >
            {sending ? "전송 중..." : "전송"}
          </button>
        </form>
      </div>
    </div>
  );
}