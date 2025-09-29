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
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers: { ...defaultHeaders, ...(headers || {}) },
    credentials: "include", // if backend uses httpOnly cookies for auth
    body: method === "GET" || method === "DELETE" ? undefined : JSON.stringify(body ?? {}),
  });

  // Basic error surfacing; backend can standardize error shape later
  if (!res.ok) {
    let message: string | undefined;
    try {
      const data = await res.json();
      message = (data && (data.message || data.error)) as string | undefined;
    } catch {}
    throw new Error(message || `Request failed: ${res.status}`);
  }

  // Handle empty responses gracefully
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // @ts-expect-error allow unknown return type when not json
    return undefined;
  }
  return (await res.json()) as TResponse;
}

// Domain-specific stub services (can be replaced with real endpoints)
export const AuthService = {
  register: async (_payload: unknown) => Promise.resolve({} as any),
  login: async (_payload: unknown) => Promise.resolve({} as any),
  logout: async () => Promise.resolve({} as any),
  me: async () => Promise.resolve({} as any),
};

export const MatchesService = {
  /**
   * Local storage key for persisted matches
   */
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
  clearAll() {
    this._writeAll([]);
  },
  pruneDefaults(defaults: any[]) {
    const list = this._readAll();
    if (!Array.isArray(defaults) || defaults.length === 0) return list;
    const isDefault = (m: any) =>
      defaults.some((d) =>
        (d.id && m.id === d.id) ||
        (
          m.time === d.time &&
          m.location === d.location &&
          m.type === d.type &&
          m.teams === d.teams
        )
      );
    const filtered = list.filter((m) => !isDefault(m));
    if (filtered.length !== list.length) this._writeAll(filtered);
    return filtered;
  },
};

export const RecommendationsService = {
  recommendPlayers: async (_payload: unknown) => Promise.resolve([] as any),
};

export const ProfilesService = {
  getUser: async (_userId: string) => Promise.resolve({} as any),
  updateMe: async (_payload: unknown) => Promise.resolve({} as any),
  getTeam: async (_teamId: string) => Promise.resolve({} as any),
  updateTeam: async (_teamId: string, _payload: unknown) => Promise.resolve({} as any),
  getFacility: async (_facilityId: string) => Promise.resolve({} as any),
};

export const ChatService = {
  rooms: async () => Promise.resolve([] as any),
  messages: async (_roomId: string) => Promise.resolve([] as any),
  sendMessage: async (_roomId: string, _payload: unknown) => Promise.resolve({} as any),
};

export const ReviewsService = {
  create: async (_payload: unknown) => Promise.resolve({} as any),
  listUser: async (_userId: string) => Promise.resolve([] as any),
  listTeam: async (_teamId: string) => Promise.resolve([] as any),
};




