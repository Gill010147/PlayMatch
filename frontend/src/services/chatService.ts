import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, ChatRoom } from '../types/domain';
import { ChatService as ChatApiService } from './api';

class ChatService {
  private client: Client;
  private isConnected = false;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];

  constructor() {
    this.client = new Client({
      // SockJS를 WebSocket 팩토리로 사용
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws-stomp`),
      
      // 연결 시 JWT 토큰 인증 헤더 추가
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },

      // 디버그 메시지 비활성화 (필요 시 활성화)
      debug: (str) => {
        // console.log(new Date(), str);
      },

      // 1초마다 재연결 시도
      reconnectDelay: 1000,
    });

    this.client.onConnect = (frame) => {
      this.isConnected = true;
      console.log('STOMP 연결 성공:', frame);
      
      // 모든 채팅방 구독을 여기서 관리할 수 있음
      // 예: chatService.subscribeToRoom(roomId, handler);
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.onWebSocketClose = () => {
      this.isConnected = false;
      console.log('STOMP 연결 종료');
    };
  }

  // STOMP 클라이언트 활성화
  public connect() {
    if (!this.client.active) {
      this.client.activate();
    }
  }

  // STOMP 클라이언트 비활성화
  public disconnect() {
    if (this.client.active) {
      this.client.deactivate();
    }
  }

  // 특정 채팅방 구독
  public subscribeToRoom(roomId: string, onMessageReceived: (message: ChatMessage) => void) {
    if (!this.isConnected) {
      console.warn('STOMP is not connected. Cannot subscribe.');
      return () => {}; // Unsubscribe function
    }

    const subscription = this.client.subscribe(`/sub/chat/room/${roomId}`, (message: IMessage) => {
      try {
        const parsedMessage: ChatMessage = JSON.parse(message.body);
        onMessageReceived(parsedMessage);
      } catch (e) {
        console.error("Failed to parse message body", e);
      }
    });

    console.log(`Subscribed to /sub/chat/room/${roomId}`);

    // 구독 취소 함수 반환
    return () => {
      subscription.unsubscribe();
      console.log(`Unsubscribed from /sub/chat/room/${roomId}`);
    };
  }

  // 메시지 전송 (STOMP 사용)
  public sendMessage(roomId: string, content: string) {
    if (!this.isConnected) {
      console.error('STOMP is not connected. Cannot send message.');
      return;
    }
    
    const messagePayload = {
      roomId,
      message: content, // 'content'를 'message'로 변경
      // senderEmail은 백엔드 StompHandler에서 토큰을 통해 자동으로 설정됨
    };

    this.client.publish({
      destination: '/pub/chat/message',
      body: JSON.stringify(messagePayload),
    });
  }

  // --- 기존 HTTP API 호출 메소드들 ---

  public async getRooms(): Promise<ChatRoom[]> {
    return ChatApiService.rooms();
  }

  public async createOrGetRoom(participantId: string): Promise<any> {
    return ChatApiService.createOrGetRoom(participantId);
  }

  public async getMessages(roomId: string): Promise<ChatMessage[]> {
    return ChatApiService.messages(roomId);
  }

  public async updateReadTime(roomId: string): Promise<void> {
    try {
      await ChatApiService.updateReadTime(roomId);
    } catch (error) {
      console.error("Failed to update read time:", error);
      // 이 에러는 치명적이지 않으므로, 사용자에게 알리지 않을 수 있습니다.
    }
  }
  
  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

// 싱글톤 인스턴스
export const chatService = new ChatService();
export default chatService;