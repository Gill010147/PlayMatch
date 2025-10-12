// services/api.ts
// Lightweight API client scaffolding for future integration
// Backend teammate can replace baseUrl and implement real auth headers/interceptors

import type { UserProfile, ProfileRequestDto } from "../../types/domain";

// Temporarily re-defining UserProfile here to try and force linter recognition
interface UserProfileWithAgeAndPhone extends UserProfile {
  age?: string;
  phone?: string;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || ""; // e.g. "/api" or "https://api.example.com"
const useMocks = String(import.meta.env.VITE_USE_MOCKS) === "true";

function buildQueryString(query?: ApiRequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.append(key, String(value));
  });
  const q = params.toString();
  return q ? `?${q}` : "";
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<TResponse = unknown>(options: ApiRequestOptions): Promise<TResponse> {
  const { method = "GET", path, query, body, headers } = options;
  const url = `${baseUrl}${path}${buildQueryString(query)}`;

  // NOTE: Auth header placeholder. Replace with real token retrieval when integrated.
  const token = localStorage.getItem("token");
  console.log("API Request Token:", token);
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    method,
    headers: { ...defaultHeaders, ...(headers || {}) },
    credentials: "include", // if backend uses httpOnly cookies for auth
    body: method === "GET" || method === "DELETE" ? undefined : JSON.stringify(body ?? {}),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    let errorMessage: string = `Request failed: ${res.status} ${res.statusText}`;

    if (contentType.includes("application/json")) {
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
    } else if (contentType.includes("text/plain")) {
      try {
        errorMessage = await res.text();
      } catch (e) {
        // 텍스트 파싱 실패 시 기본 메시지 사용
      }
    }
    throw new ApiError(errorMessage, res.status);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as TResponse;
  }
  if (contentType.includes("text/plain")) {
    return (await res.text()) as TResponse;
  }

  // @ts-expect-error allow unknown return type when not json
  return undefined;
}

// ---------------------- Domain-specific Services ----------------------

export const AuthService = {
  register: async (payload: any) =>
    apiRequest({ method: "POST", path: "/api/auth/register", body: payload }),
  login: async (payload: any) =>
    apiRequest({ method: "POST", path: "/api/auth/login", body: payload }),
  logout: async () =>
    apiRequest({ method: "POST", path: "/api/auth/logout" }),
  me: async () =>
    apiRequest<UserProfileWithAgeAndPhone>({ method: "GET", path: "/api/users/me" }),
};

export const ProfilesService = {
  me: async () =>
    apiRequest({ method: "GET", path: "/api/users/me" }),
  updateMe: async (payload: any) =>
    apiRequest({ method: "PUT", path: "/api/profiles/me", body: payload }),
  getUser: async (userId: string) =>
    apiRequest({ method: "GET", path: `/api/profiles/users/${userId}` }),
  getTeam: async (teamId: string) =>
    apiRequest({ method: "GET", path: `/api/teams/${teamId}` }),
  updateTeam: async (teamId: string, payload: any) =>
    apiRequest({ method: "PUT", path: `/api/teams/${teamId}`, body: payload }),
  getFacility: async (facilityId: string) =>
    apiRequest({ method: "GET", path: `/api/facilities/${facilityId}` }),
};

// Real service
const MatchesServiceHttp = {
  list: async (filters?: Record<string, unknown>) =>
    apiRequest({ method: "GET", path: "/api/matches", query: filters }),
  create: async (payload: any) =>
    apiRequest({ method: "POST", path: "/api/matches", body: payload }),
  detail: async (matchId: string) =>
    apiRequest({ method: "GET", path: `/api/matches/${matchId}` }),
  applyAsMercenary: async (matchId: string, payload: any) =>
    apiRequest({ method: "POST", path: `/api/matches/${matchId}/apply`, body: payload }),
  participants: async (matchId: string) =>
    apiRequest({ method: "GET", path: `/api/matches/${matchId}/participants` }),
};

// Mock (localStorage) service for dev without backend
const MatchesServiceMock = {
  _storageKey: "playmatch.matches",
  _readAll(): any[] {
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  _writeAll(list: any[]) {
    localStorage.setItem(this._storageKey, JSON.stringify(list));
  },
  async list(_filters?: Record<string, unknown>) {
    return this._readAll();
  },
  async create(payload: any) {
    const list = this._readAll();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const match = {
      id,
      time: payload?.time || "",
      location: payload?.location || "",
      type: payload?.type || "",
      teams: payload?.teams || "",
      status: payload?.status === "closed" ? "closed" : "open",
      title: payload?.title || "",
      date: payload?.date || "",
      duration: payload?.duration || "",
    };
    list.unshift(match);
    this._writeAll(list);
    return match as any;
  },
  async detail(matchId: string) {
    const list = this._readAll();
    return (list.find((m) => m.id === matchId) || null) as any;
  },
  async applyAsMercenary(_matchId: string, _payload: unknown) {
    return {} as any;
  },
  async participants(_matchId: string) {
    return [] as any;
  },
};

export const MatchesService = import.meta.env.VITE_USE_MOCK_API === 'true' ? MatchesServiceMock : MatchesServiceHttp;

// Real service
const RecommendationsServiceHttp = {
  recommendPlayers: async (payload: any) =>
    apiRequest({ method: "POST", path: "/api/recommendations/players", body: payload }),
};

// Mock service
const RecommendationsServiceMock = {
  recommendPlayers: async (criteria: any) => {
    console.log("Mock RecommendationsService.recommendPlayers called with:", criteria);
    // Return the dummy players that are already defined in RecommendedPlayerDetailPage.tsx
    // For simplicity, we'll just return a static list for now.
    // In a real mock, you might filter based on criteria.
    return [
      {
        id: "0",
        name: "홍길동",
        position: "FW",
        playStyle: ["공격"],
        ability: ["슛"],
        region: "OO시 OO구",
      },
      {
        id: "1",
        name: "김철수",
        position: "MF",
        playStyle: ["수비"],
        ability: ["패스"],
        region: "XX시 XX구",
      },
      {
        id: "2",
        name: "이영희",
        position: "DF",
        playStyle: ["조율"],
        ability: ["태클"],
        region: "YY시 YY구",
      },
    ];
  },
};

export const RecommendationsService = useMocks ? RecommendationsServiceMock : RecommendationsServiceHttp;

export const ChatService = {
  // 내 채팅방 목록 조회
  rooms: async () =>
    apiRequest({ method: "GET", path: "/api/chat/my-rooms" }),
  
  // 1:1 채팅방 생성 또는 조회
  createOrGetRoom: async (participantId: string) =>
    apiRequest({ method: "POST", path: "/api/chat/rooms", body: { participantId } }),
  
  // 그룹 채팅방 생성
  createGroupRoom: async (name: string, participantIds: string[]) =>
    apiRequest({ method: "POST", path: "/api/chat/rooms", body: { name, participantIds, type: "group" } }),
  
  // 채팅방 과거 메시지 조회
  messages: async (roomId: string) =>
    apiRequest({ method: "GET", path: `/api/chat/rooms/${roomId}/messages` }),
  
  // 메시지 전송 (WebSocket 대신 HTTP로도 가능)
  sendMessage: async (roomId: string, content: string) =>
    apiRequest({ method: "POST", path: `/api/chat/rooms/${roomId}/messages`, body: { content } }),

  // 마지막 읽은 시간 업데이트
  updateReadTime: async (roomId: string) =>
    apiRequest({ method: "POST", path: `/api/chat/rooms/${roomId}/read` }),

  // 안 읽은 메시지 개수 조회
  getUnreadCount: async () =>
    apiRequest<{ count: number }>({ method: "GET", path: "/api/chat/unread-count" }),
};

export const ReviewsService = {
  create: async (payload: any) =>
    apiRequest({ method: "POST", path: "/api/reviews", body: payload }),
  listUser: async (userId: string) =>
    apiRequest({ method: "GET", path: `/api/reviews/users/${userId}` }),
  listTeam: async (teamId: string) =>
    apiRequest({ method: "GET", path: `/api/reviews/teams/${teamId}` }),
};

const VIDEO_FEEDBACK_STORAGE_KEY = "playmatch.videoFeedbacks";

export const VideoFeedbackService = {
  _readAll(): any[] {
    try {
      const raw = localStorage.getItem(VIDEO_FEEDBACK_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  _writeAll(list: any[]) {
    localStorage.setItem(VIDEO_FEEDBACK_STORAGE_KEY, JSON.stringify(list));
  },
  list: async () => {
    return VideoFeedbackService._readAll();
  },
  detail: async (videoId: string) => {
    const list = VideoFeedbackService._readAll();
    return (list.find((f) => f.id === videoId) || null) as any;
  },
  addComment: async (videoId: string, commentText: string) => {
    console.log(`Adding comment to video ${videoId}: ${commentText}`);
    return { success: true };
  },
  uploadVideoFeedback: async (payload: { title: string; description: string; videoFile: File }) => {
    const list = VideoFeedbackService._readAll();
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newFeedback = {
      id: newId,
      title: payload.title,
      description: payload.description,
      videoUrl: URL.createObjectURL(payload.videoFile),
      uploadDate: new Date().toISOString().split('T')[0],
      commentsCount: 0,
    };
    list.unshift(newFeedback); // Add to the beginning
    VideoFeedbackService._writeAll(list);
    return newFeedback;
  },
};

export const TeamsService = {
  // 일반 텍스트/JSON 업로드용 (기본)
  create: async (payload: any) =>
    apiRequest({
      method: "POST",
      path: "/api/teams",
      body: payload,
    }),

  // ✅ 이미지 파일(FormData) 업로드용
  createWithFile: async (formData: FormData) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/teams`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData, // FormData는 자동으로 Content-Type이 multipart/form-data로 설정됨
    });

    if (!res.ok) {
      const message = (await res.text()) || "팀 생성 실패";
      throw new ApiError(message, res.status);
    }

    // JSON이든 텍스트든 알아서 반환
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await res.json();
    } else if (contentType.includes("text/plain")) {
      return await res.text();
    }
    return undefined;
  },

  // 팀 목록 조회
  list: async () => apiRequest({ method: "GET", path: "/api/teams" }),

  // 팀 상세 조회
  detail: async (teamId: string) =>
    apiRequest({ method: "GET", path: `/api/teams/${teamId}` }),

  // 내 팀 목록 조회
  myTeams: async () => apiRequest({ method: "GET", path: "/api/teams/my" }),

  // 팀 정보 수정
  update: async (teamId: string, payload: any) =>
    apiRequest({ method: "PUT", path: `/api/teams/${teamId}`, body: payload }),
};
