export type MatchStatus = "scheduled" | "live" | "finished";

export interface Match {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
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

export interface League {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  memberIds: string[];
  createdAt: string;
}

export interface LeagueMember {
  uid: string;
  displayName: string;
  totalPoints: number;
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
