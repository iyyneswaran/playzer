const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface Match {
  id: number;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  status: "scheduled" | "live" | "finished";
  startTime: string;
  endTime: string | null;
  homeScore: number;
  awayScore: number;
  createdAt: string;
}

export interface Commentary {
  id: number;
  matchId: number;
  minute: number | null;
  sequence: number;
  period: string | null;
  eventType: string | null;
  actor: string | null;
  team: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  tags: string[] | null;
  createdAt: string;
}

export async function fetchMatches(
  limit?: number,
  status?: string
): Promise<Match[]> {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (status) params.set("status", status);

  const res = await fetch(`${API_BASE}/matches?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  const json = await res.json();
  return json.data;
}

export async function fetchMatch(id: number): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${id}`);
  if (!res.ok) throw new Error("Failed to fetch match");
  const json = await res.json();
  return json.data;
}

export async function fetchCommentary(
  matchId: number,
  limit?: number
): Promise<Commentary[]> {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));

  const res = await fetch(
    `${API_BASE}/matches/${matchId}/commentary?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch commentary");
  const json = await res.json();
  return json.data;
}

export function getWsUrl(): string {
  const wsBase =
    process.env.NEXT_PUBLIC_WS_URL ||
    API_BASE.replace(/^http/, "ws");
  return `${wsBase}/ws`;
}
