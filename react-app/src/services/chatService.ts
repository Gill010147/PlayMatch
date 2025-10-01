// WebSocket 기반 실시간 채팅 서비스
import { ChatRoom, ChatMessage } from '../types/domain';
import { ChatService as ChatApiService } from './api';

class ChatService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private roomHandlers: ((rooms: ChatRoom[]) => void)[] = [];
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket 연결됨');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.authenticate();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket 연결 종료');
        this.isConnected = false;
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket 오류:', error);
      };
    } catch (error) {
      console.error('WebSocket 연결 실패:', error);
      this.reconnect();
    }
  }

  private authenticate() {
    const token = localStorage.getItem('token');
    if (token && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'auth',
        token: token
      }));
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocket 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('WebSocket 재연결 실패 - 최대 시도 횟수 초과');
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'message':
        // 새 메시지 수신
        this.messageHandlers.forEach(handler => handler(data.message));
        break;
      case 'rooms':
        // 채팅방 목록 업데이트
        this.roomHandlers.forEach(handler => handler(data.rooms));
        break;
      case 'room_created':
        // 새 채팅방 생성됨
        this.roomHandlers.forEach(handler => handler(data.rooms));
        break;
      case 'message_sent':
        // 메시지 전송 확인
        console.log('메시지 전송됨:', data.messageId);
        break;
      case 'error':
        console.error('서버 오류:', data.message);
        break;
      case 'auth_success':
        console.log('WebSocket 인증 성공');
        break;
      case 'auth_failed':
        console.error('WebSocket 인증 실패:', data.message);
        break;
    }
  }

  // 채팅방 목록 가져오기
  async getRooms(): Promise<ChatRoom[]> {
    try {
      // 실제 API 호출
      const rooms = await ChatApiService.rooms();
      return Array.isArray(rooms) ? rooms : [];
    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error);
      // API 실패 시 Mock 데이터 반환
      return this.getMockRooms();
    }
  }

  // 1:1 채팅방 생성 또는 조회
  async createOrGetRoom(participantId: string): Promise<ChatRoom> {
    try {
      const room = await ChatApiService.createOrGetRoom(participantId);
      return room;
    } catch (error) {
      console.error('1:1 채팅방 생성/조회 실패:', error);
      throw error;
    }
  }

  // 그룹 채팅방 생성
  async createGroupRoom(name: string, participantIds: string[]): Promise<ChatRoom> {
    try {
      const room = await ChatApiService.createGroupRoom(name, participantIds);
      return room;
    } catch (error) {
      console.error('그룹 채팅방 생성 실패:', error);
      throw error;
    }
  }

  // 채팅방 생성 (기존 호환성을 위한 래퍼)
  async createRoom(name: string, participants: string[]): Promise<ChatRoom> {
    if (participants.length === 1) {
      // 1:1 채팅방
      return this.createOrGetRoom(participants[0]);
    } else {
      // 그룹 채팅방
      return this.createGroupRoom(name, participants);
    }
  }

  // 메시지 전송
  async sendMessage(roomId: string, content: string): Promise<void> {
    try {
      // WebSocket이 연결되어 있으면 실시간 전송
      if (this.isConnected && this.ws) {
        this.ws.send(JSON.stringify({
          type: 'send_message',
          roomId,
          content
        }));
      } else {
        // WebSocket이 없으면 HTTP API로 전송
        await ChatApiService.sendMessage(roomId, content);
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      throw error;
    }
  }

  // 채팅방 메시지 목록 가져오기
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    try {
      const messages = await ChatApiService.messages(roomId);
      return Array.isArray(messages) ? messages : [];
    } catch (error) {
      console.error('메시지 목록 조회 실패:', error);
      // API 실패 시 Mock 데이터 반환
      return this.getMockMessages(roomId);
    }
  }

  // 메시지 수신 핸들러 등록
  onMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers.push(handler);
  }

  // 메시지 수신 핸들러 제거
  offMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  // 채팅방 목록 업데이트 핸들러 등록
  onRoomsUpdate(handler: (rooms: ChatRoom[]) => void) {
    this.roomHandlers.push(handler);
  }

  // 채팅방 목록 업데이트 핸들러 제거
  offRoomsUpdate(handler: (rooms: ChatRoom[]) => void) {
    this.roomHandlers = this.roomHandlers.filter(h => h !== handler);
  }

  // 연결 상태 확인
  isWebSocketConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  // 연결 종료
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  // Mock 데이터
  private getMockRooms(): ChatRoom[] {
    return [
      {
        id: 'room_1',
        name: '축구 동호회',
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'room_2',
        name: '풋살 매칭',
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: 'room_3',
        name: '주말 경기',
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ];
  }

  // Mock 메시지 가져오기
  async getMockMessages(roomId: string): Promise<ChatMessage[]> {
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg_1',
        roomId,
        senderId: 'user_1',
        content: '안녕하세요! 경기 참여하고 싶습니다.',
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      },
      {
        id: 'msg_2',
        roomId,
        senderId: 'user_2',
        content: '네, 환영합니다! 언제 가능하신가요?',
        createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString()
      },
      {
        id: 'msg_3',
        roomId,
        senderId: 'user_1',
        content: '주말 오후에 가능합니다.',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      }
    ];
    return mockMessages;
  }
}

// 싱글톤 인스턴스
export const chatService = new ChatService();
export default chatService;
