// Shared domain types for compile-time safety across pages

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  gender?: "male" | "female";
  region?: { city?: string; district?: string; neighborhood?: string; fullAddress?: string };
  positions?: string[];
  playStyles?: string[];
  skills?: string[];
  rating?: number;
}

export interface TeamProfile {
  id: string;
  name: string;
  region?: string;
  description?: string;
}

export interface FacilityProfile {
  id: string;
  name: string;
  address: string;
}

export interface MatchSummary {
  id: string;
  time: string;
  location: string;
  type: string;
  teams: string;
  status: "open" | "closed";
}

export interface MatchDetail extends MatchSummary {
  description?: string;
  hostTeamId?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  lastMessageAt?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Review {
  id: string;
  targetType: "user" | "team";
  targetId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface VideoPost {
  id: string;
  title: string;
  videoUrl: string;
  comments: Comment[];
}




