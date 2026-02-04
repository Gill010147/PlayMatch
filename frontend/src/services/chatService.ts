import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, ChatRoom } from '../types/domain';
import { ChatService as ChatApiService } from './api';

class ChatService {
  private client: Client;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null; // 연결 상태를 추적하는 Promise
  private resolveConnection: (() => void) | null = null; // Promise resolve 함수 저장
  private rejectConnection: ((reason?: any) => void) | null = null; // Promise reject 함수 저장

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws-stomp`),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      debug: (str) => {
        // console.log(new Date(), str);
      },
      reconnectDelay: 1000,
    });

    // 핸들러는 생성자에서 한 번만 설정합니다.
    this.client.onConnect = (frame) => {
      this.isConnected = true;
      console.log('STOMP 연결 성공:', frame);
      if (this.resolveConnection) {
        this.resolveConnection();
        this.resolveConnection = null; // 사용 후 초기화
        this.rejectConnection = null; // 사용 후 초기화
      }
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      this.isConnected = false;
      if (this.rejectConnection) {
        this.rejectConnection(new Error('STOMP 연결 오류'));
        this.resolveConnection = null; // 사용 후 초기화
        this.rejectConnection = null; // 사용 후 초기화
      }
    };

    this.client.onWebSocketClose = () => {
      this.isConnected = false;
      console.log('STOMP 연결 종료');
      // 연결이 끊겼을 때 대기 중인 Promise가 있다면 reject
      if (this.rejectConnection) {
        this.rejectConnection(new Error('STOMP 연결 종료'));
        this.resolveConnection = null;
        this.rejectConnection = null;
      }
    };
  }

  // STOMP 클라이언트 활성화
  public connect(): Promise<void> {
    if (this.client.active && this.isConnected) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.resolveConnection = resolve;
      this.rejectConnection = reject;

      // 연결 시도
      this.client.activate();
    });

    return this.connectionPromise;
  }

  // STOMP 클라이언트 비활성화
  public disconnect() {
    if (this.client.active) {
      this.client.deactivate();
      this.isConnected = false;
      this.connectionPromise = null; // 연결 Promise 초기화
      this.resolveConnection = null;
      this.rejectConnection = null;
    }
  }

  // 특정 채팅방 구독
  public subscribeToRoom(roomId: string, onMessageReceived: (message: ChatMessage) => void) {
    // connect() Promise가 연결을 보장하므로 여기서 isConnected 체크는 불필요
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