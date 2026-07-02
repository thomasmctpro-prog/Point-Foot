export class ApiError extends Error {}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
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

export function getMatches() {
  return request<{ matches: Match[]; source: string }>("/matches");
}

export function getNews() {
  return request<{ articles: NewsArticle[]; source: string }>("/news");
}
