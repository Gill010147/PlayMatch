// Shared domain types for compile-time safety across pages

export interface UserProfile {
  id: string | number; // Changed to string | number for flexibility
  email: string;
  name: string;
  gender?: "male" | "female";
  region?: { city?: string; district?: string; neighborhood?: string; fullAddress?: string };
  age?: string;
  phone?: string;
  positions?: string[];
  playStyles?: string[];
  skills?: string[];
  rating?: number;
}

export interface TeamProfile {
  id: string;
  name: string;
  mainArea?: string;
  introduce?: string; // 상세 설명 추가
  teamLogo?: string | null; // 팀 로고 URL 추가
  maxMembers?: number;
  currentMembers?: number;
}

export interface FacilityProfile {
  id: string;
  name: string;
  address: string;
}

export interface MatchResponseDto {
  id: number;
  title: string;
  hostTeamName: string;
  matchDate: string; // LocalDateTime will be string in TS
  locationName: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"; // Assuming these are the enum values
  memberCount: number;
  maxMemberCount: number;
}

export interface ChatRoom {
  id: number;
  name: string;
  lastMessageAt?: string;
}

export interface ChatMessage {
  messageId: number;
  senderId: number;
  senderName: string;
  message: string;
  createdAt: string;
  roomId: string; // 이 필드는 STOMP 메시지 본문에는 없지만, 클라이언트에서 필요할 수 있음
}

export interface Review {
  id: string;
  targetType: "user" | "team";
  targetId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ProfileRequestDto {
  name?: string;
  area?: string;
  age?: string;
  gender?: string;
  playStyles?: string[];
  positions?: string[];
  skills?: string[];
  phone?: string;
}

export interface Team {
  id: number;
  name: string;
  introduce: string;
  mainArea: string;
  teamLogo: string | null;
  leaderName: string;
  members: any[];
}

export interface Comment {
  id: string;
  authorName: string;
  authorId: number; // Added authorId
  text: string;
  createdAt: string;
}

export interface VideoFeedbackDetail {
  id: string;
  title: string;
  videoUrl: string;
  description: string;
  uploadDate: string;
  uploaderName: string;
  uploaderId: number; // Added uploaderId
  comments: Comment[];
}