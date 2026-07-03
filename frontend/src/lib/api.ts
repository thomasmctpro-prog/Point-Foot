export class ApiError extends Error {}

// In dev, Vite's server.proxy forwards "/api" to localhost:3001, so this stays empty.
// In prod, the frontend (Vercel) and backend (Render) are separate origins, so
// VITE_API_BASE_URL must be set to the deployed backend's URL (e.g. https://xxx.onrender.com).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, options?: { method?: string; body?: unknown; token?: string }): Promise<T> {
  const headers: Record<string, string> = {};
  if (options?.body !== undefined) headers["Content-Type"] = "application/json";
  if (options?.token) headers["Authorization"] = `Bearer ${options.token}`;

  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: options?.method ?? "GET",
    headers,
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error ?? `Erreur ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface Match {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "scheduled" | "live" | "finished";
  minute: string | null;
  kickoffAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl: string | null;
}

export interface LeagueSummary {
  id: string;
  name: string;
  ownerId: string;
  memberCount: number;
}

export interface LeagueMember {
  uid: string;
  displayName: string;
  totalPoints: number;
}

export interface LeagueDetail {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  members: LeagueMember[];
}

export interface Prediction {
  id: string;
  leagueId: string;
  userId: string;
  matchId: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
  createdAt: string;
}

export function getMatches() {
  return request<{ matches: Match[]; source: string }>("/matches");
}

export function getNews() {
  return request<{ articles: NewsArticle[]; source: string }>("/news");
}

export function createLeague(token: string, name: string) {
  return request<{ id: string; name: string; ownerId: string }>("/leagues", {
    method: "POST",
    token,
    body: { name },
  });
}

export function joinLeague(token: string, code: string) {
  return request<{ id: string; name: string; ownerId: string }>("/leagues/join", {
    method: "POST",
    token,
    body: { code },
  });
}

export function getMyLeagues(token: string) {
  return request<{ leagues: LeagueSummary[] }>("/leagues/mine", { token });
}

export function getLeague(token: string, leagueId: string) {
  return request<LeagueDetail>(`/leagues/${leagueId}`, { token });
}

export function getLeaguePredictions(token: string, leagueId: string) {
  return request<{ predictions: Prediction[] }>(`/leagues/${leagueId}/predictions`, { token });
}

export function submitPrediction(
  token: string,
  leagueId: string,
  matchId: string,
  homeScore: number,
  awayScore: number
) {
  return request<Prediction>(`/leagues/${leagueId}/predictions`, {
    method: "POST",
    token,
    body: { matchId, homeScore, awayScore },
  });
}
