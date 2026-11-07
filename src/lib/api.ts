export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

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

export interface CreateMatchInput {
  sport: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  endTime?: string | null;
  homeScore?: number;
  awayScore?: number;
}

export interface CreateCommentaryInput {
  minute: number;
  sequence?: number;
  period?: string;
  eventType?: string;
  actor?: string;
  team?: string;
  message: string;
  tags?: string[];
}

// Built-in Demo Mock Data for instant offline or fallback testing
export const INITIAL_DEMO_MATCHES: Match[] = [
  {
    id: 101,
    sport: "Football",
    homeTeam: "Arsenal",
    awayTeam: "Real Madrid",
    status: "live",
    startTime: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
    homeScore: 2,
    awayScore: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 102,
    sport: "Basketball",
    homeTeam: "Golden State Warriors",
    awayTeam: "LA Lakers",
    status: "live",
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    homeScore: 88,
    awayScore: 84,
    createdAt: new Date().toISOString(),
  },
  {
    id: 103,
    sport: "Cricket",
    homeTeam: "India",
    awayTeam: "Australia",
    status: "scheduled",
    startTime: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 360 * 60 * 1000).toISOString(),
    homeScore: 0,
    awayScore: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 104,
    sport: "Tennis",
    homeTeam: "Carlos Alcaraz",
    awayTeam: "Jannik Sinner",
    status: "finished",
    startTime: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    homeScore: 3,
    awayScore: 2,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_COMMENTARY: Record<number, Commentary[]> = {
  101: [
    {
      id: 1,
      matchId: 101,
      minute: 58,
      sequence: 3,
      period: "2nd Half",
      eventType: "goal",
      actor: "Declan Rice",
      team: "Arsenal",
      message: "GOAL! Rice thumps a powerful header from the corner kick to reclaim the lead!",
      metadata: null,
      tags: ["Header", "Goal"],
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      matchId: 101,
      minute: 34,
      sequence: 2,
      period: "1st Half",
      eventType: "goal",
      actor: "Vinicius Jr",
      team: "Real Madrid",
      message: "GOAL! Vinicius blitzes past the defence with blistering speed and slots it home.",
      metadata: null,
      tags: ["Goal", "Solo"],
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      matchId: 101,
      minute: 12,
      sequence: 1,
      period: "1st Half",
      eventType: "goal",
      actor: "Bukayo Saka",
      team: "Arsenal",
      message: "GOAL! Saka curls a magnificent left-footed strike into the top corner!",
      metadata: null,
      tags: ["Goal", "Curler"],
      createdAt: new Date().toISOString(),
    },
  ],
  102: [
    {
      id: 4,
      matchId: 102,
      minute: 28,
      sequence: 1,
      period: "Q3",
      eventType: "point",
      actor: "Stephen Curry",
      team: "Golden State Warriors",
      message: "Curry drains a ridiculous 3-pointer from 32 feet out! The arena explodes!",
      metadata: null,
      tags: ["3-Pointer", "Curry"],
      createdAt: new Date().toISOString(),
    },
  ],
};

export async function fetchMatches(
  limit?: number,
  status?: string
): Promise<{ data: Match[]; isOffline?: boolean; error?: string }> {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (status && status !== "all") params.set("status", status);

  try {
    const res = await fetch(`${API_BASE}/matches?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        data: [],
        isOffline: true,
        error: `Backend responded with HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const json = await res.json();
    return { data: json.data || [], isOffline: false };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return {
      data: [],
      isOffline: true,
      error: `Cannot connect to backend at ${API_BASE} (${msg})`,
    };
  }
}

export async function fetchMatch(
  id: number
): Promise<{ data: Match | null; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/matches/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Failed to fetch match #${id}` };
    }

    const json = await res.json();
    return { data: json.data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return { data: null, error: msg };
  }
}

export async function createMatch(input: CreateMatchInput): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error || errorData.errors || `Failed to create match (${res.status})`
    );
  }

  const json = await res.json();
  return json.data;
}

export async function updateMatchScore(
  id: number,
  homeScore: number,
  awayScore: number
): Promise<Match> {
  const res = await fetch(`${API_BASE}/matches/${id}/score`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ homeScore, awayScore }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update score (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

export async function fetchCommentary(
  matchId: number,
  limit?: number
): Promise<Commentary[]> {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));

  try {
    const res = await fetch(
      `${API_BASE}/matches/${matchId}/commentary?${params.toString()}`,
      { cache: "no-store" }
    );

    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function createCommentary(
  matchId: number,
  input: CreateCommentaryInput
): Promise<Commentary> {
  const res = await fetch(`${API_BASE}/matches/${matchId}/commentary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to add commentary (${res.status})`);
  }

  const json = await res.json();
  return json.data;
}

export function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    const clean = process.env.NEXT_PUBLIC_WS_URL.replace(/\/+$/, "");
    return clean.endsWith("/ws") ? clean : `${clean}/ws`;
  }
  const cleanBase = API_BASE.replace(/\/+$/, "");
  const wsBase = cleanBase.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  return `${wsBase}/ws`;
}
