// services/api.ts
// Lightweight API client scaffolding for future integration
// Backend teammate can replace baseUrl and implement real auth headers/interceptors

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

export async function apiRequest<TResponse = unknown>(options: ApiRequestOptions): Promise<TResponse> {
  const { method = "GET", path, query, body, headers } = options;
  const url = `${baseUrl}${path}${buildQueryString(query)}`;

  // NOTE: Auth header placeholder. Replace with real token retrieval when integrated.
  const token = localStorage.getItem("token");
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
    let message: string | undefined;
    try {
      const data = await res.json();
      message = (data && (data.message || data.error)) as string | undefined;
    } catch {}
    throw new Error(message || `Request failed: ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // @ts-expect-error allow unknown return type when not json
    return undefined;
  }
  return (await res.json()) as TResponse;
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
    apiRequest({ method: "GET", path: "/api/users/me" }),
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

export const MatchesService = useMocks ? MatchesServiceMock : MatchesServiceHttp;

export const RecommendationsService = {
  recommendPlayers: async (payload: any) =>
    apiRequest({ method: "POST", path: "/api/recommendations/players", body: payload }),
};

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
};

export const ReviewsService = {
  create: async (payload: any) =>
    apiRequest({ method: "POST", path: "/api/reviews", body: payload }),
  listUser: async (userId: string) =>
    apiRequest({ method: "GET", path: `/api/reviews/users/${userId}` }),
  listTeam: async (teamId: string) =>
    apiRequest({ method: "GET", path: `/api/reviews/teams/${teamId}` }),
};
