"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { MatchGrid } from "@/components/dashboard/MatchGrid";
import { LiveTicker } from "@/components/dashboard/LiveTicker";
import { MatchDetail } from "@/components/dashboard/MatchDetail";
import { CreateMatchModal } from "@/components/dashboard/CreateMatchModal";
import { ConnectionIndicator } from "@/components/ui/ConnectionIndicator";
import { LottieAnimation } from "@/components/ui/LottieAnimation";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  fetchMatches,
  createMatch,
  createCommentary,
  INITIAL_DEMO_MATCHES,
  type Match,
  type Commentary,
  API_BASE,
} from "@/lib/api";
import {
  Zap,
  Plus,
  Search,
  Sparkles,
  Filter,
  Flame,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Database,
} from "lucide-react";

const SPORT_CATEGORIES = [
  "ALL",
  "FOOTBALL",
  "BASKETBALL",
  "CRICKET",
  "TENNIS",
  "HOCKEY",
];

const STATUS_FILTERS = [
  { id: "all", label: "ALL" },
  { id: "live", label: "LIVE NOW" },
  { id: "scheduled", label: "SCHEDULED" },
  { id: "finished", label: "FINISHED" },
];

export default function DashboardPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sportFilter, setSportFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [liveCommentary, setLiveCommentary] = useState<Commentary[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);

  // Backend offline awareness state
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchMatches(100);

      if (result.isOffline) {
        setIsBackendOffline(true);
        setBackendError(result.error || `Could not connect to ${API_BASE}`);
        setMatches((prev) => (prev.length > 0 ? prev : INITIAL_DEMO_MATCHES));
      } else {
        setIsBackendOffline(false);
        setBackendError(null);
        setMatches(result.data.length > 0 ? result.data : INITIAL_DEMO_MATCHES);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setIsBackendOffline(true);
      setBackendError(msg);
      setMatches((prev) => (prev.length > 0 ? prev : INITIAL_DEMO_MATCHES));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Real-time WebSocket event dispatching
  const { connected } = useWebSocket({
    match_created: (msg) => {
      const newMatch = msg.data as Match;
      setMatches((prev) => {
        if (prev.some((m) => m.id === newMatch.id)) return prev;
        return [newMatch, ...prev];
      });
    },
    match_updated: (msg) => {
      const updated = msg.data as Match;
      setMatches((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      if (selectedMatch?.id === updated.id) {
        setSelectedMatch(updated);
      }
    },
    Commentary: (msg) => {
      const comment = msg.data as Commentary;
      setLiveCommentary((prev) => [comment, ...prev].slice(0, 50));
    },
  });

  const handleRefresh = () => {
    setRefreshing(true);
    loadMatches();
  };

  const handleMatchCreated = (newMatch: Match) => {
    setMatches((prev) => {
      if (prev.some((m) => m.id === newMatch.id)) return prev;
      return [newMatch, ...prev];
    });
    setSelectedMatch(newMatch);
  };

  const handleMatchUpdated = (updated: Match) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  };

  // Seed demo sports data (online or offline fallback)
  const handleSeedDemoData = async () => {
    try {
      setSeedingDemo(true);
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 45 * 60 * 1000);
      const twoHoursLater = new Date(now.getTime() + 75 * 60 * 1000);
      const futureStart = new Date(now.getTime() + 180 * 60 * 1000);
      const futureEnd = new Date(now.getTime() + 300 * 60 * 1000);
      const pastStart = new Date(now.getTime() - 200 * 60 * 1000);
      const pastEnd = new Date(now.getTime() - 80 * 60 * 1000);

      if (!isBackendOffline) {
        try {
          const m1 = await createMatch({
            sport: "Football",
            homeTeam: "Arsenal",
            awayTeam: "Real Madrid",
            startTime: oneHourAgo.toISOString(),
            endTime: twoHoursLater.toISOString(),
            homeScore: 2,
            awayScore: 1,
          });

          await createCommentary(m1.id, {
            minute: 12,
            eventType: "goal",
            actor: "Bukayo Saka",
            team: "Arsenal",
            message: "GOAL! Saka curls a magnificent left-footed strike into the top corner!",
          });

          await createCommentary(m1.id, {
            minute: 34,
            eventType: "goal",
            actor: "Vinicius Jr",
            team: "Real Madrid",
            message: "GOAL! Vinicius blitzes past the defence and slots it home calmly.",
          });

          await createMatch({
            sport: "Basketball",
            homeTeam: "Golden State Warriors",
            awayTeam: "LA Lakers",
            startTime: oneHourAgo.toISOString(),
            endTime: twoHoursLater.toISOString(),
            homeScore: 89,
            awayScore: 86,
          });

          await createMatch({
            sport: "Cricket",
            homeTeam: "India",
            awayTeam: "Australia",
            startTime: futureStart.toISOString(),
            endTime: futureEnd.toISOString(),
            homeScore: 0,
            awayScore: 0,
          });

          await loadMatches();
          return;
        } catch {
          // Fall back to local seed
        }
      }

      setMatches(INITIAL_DEMO_MATCHES);
    } finally {
      setSeedingDemo(false);
    }
  };

  // Stats computation
  const liveCount = useMemo(
    () => matches.filter((m) => m.status === "live").length,
    [matches]
  );
  const scheduledCount = useMemo(
    () => matches.filter((m) => m.status === "scheduled").length,
    [matches]
  );
  const finishedCount = useMemo(
    () => matches.filter((m) => m.status === "finished").length,
    [matches]
  );

  // Filtered & searched matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) {
        return false;
      }
      if (
        sportFilter !== "ALL" &&
        m.sport.toLowerCase() !== sportFilter.toLowerCase()
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          m.homeTeam.toLowerCase().includes(q) ||
          m.awayTeam.toLowerCase().includes(q) ||
          m.sport.toLowerCase().includes(q) ||
          String(m.id).includes(q);
        if (!matchesQuery) return false;
      }
      return true;
    });
  }, [matches, statusFilter, sportFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-neo-gray text-neo-black">
      {/* Top Navigation */}
      <Navbar
        onNewMatchClick={() => setCreateModalOpen(true)}
        onRefreshClick={handleRefresh}
        refreshing={refreshing}
        connected={connected}
      />

      {/* Real-time Ticker */}
      <LiveTicker
        matches={matches}
        commentary={liveCommentary}
        onMatchClick={setSelectedMatch}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Backend Status Alert Banner (Neo Brutalism Style) */}
        {isBackendOffline && (
          <div className="neo-card p-4 sm:p-5 bg-neo-yellow border-3 border-neo-black shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-slide-up">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 border-2 border-neo-black bg-neo-red text-neo-white flex items-center justify-center font-black flex-shrink-0 shadow-[2px_2px_0px_#000]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-neo-black">
                    Backend Status: Offline (Preview Demo Active)
                  </span>
                  <span className="neo-badge text-[9px] bg-neo-black text-neo-white">
                    LOCAL DEMO MODE
                  </span>
                </div>
                <p className="text-xs font-bold text-neo-black opacity-80 mt-1">
                  Expected Express server at <code className="bg-neo-white px-1.5 py-0.5 border border-neo-black font-mono font-bold text-xs">{API_BASE}</code>.
                  Showing interactive demo data with score steppers, live commentary, and event simulator.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono font-bold opacity-75 text-neo-black">
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Run backend: cd sportz-WebSocket && npm run dev</span>
                  </span>
                  <span>///</span>
                  <span className="flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" />
                    <span>Database: PostgreSQL</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="neo-btn text-xs py-2 px-3 bg-neo-white hover:bg-neo-gray"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                <span>Retry Backend</span>
              </button>
            </div>
          </div>
        )}

        {/* Neo-Brutalist Hero Banner directly styled after Reference Image 1 */}
        <section className="neo-card p-6 sm:p-10 bg-neo-white relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Big Bold Typography */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-neo-yellow border-2 border-neo-black text-xs font-black uppercase shadow-[2px_2px_0px_#000]">
                <Flame className="w-4 h-4 text-neo-red" />
                <span className="text-neo-black">REAL-TIME HYBRID BROADCAST PLATFORM</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-neo-black">
                Track Better Live Sports.
              </h1>

              <p className="text-sm sm:text-base font-bold text-neo-black opacity-80 max-w-2xl leading-relaxed">
                Persistent WebSocket communication paired with RESTful endpoints.
                Instant score propagation, zero-latency commentary feeds, and responsive live event streaming.
              </p>

              {/* Neo Brutalism Action Buttons (matching Reference Image 1 "Get for free" & "Our plans") */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="neo-btn text-xs sm:text-sm py-3 px-6 bg-neo-white font-black"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create Match</span>
                </button>

                <button
                  type="button"
                  onClick={handleSeedDemoData}
                  disabled={seedingDemo}
                  className="neo-btn neo-btn-accent text-xs sm:text-sm py-3 px-6 font-black"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{seedingDemo ? "Seeding..." : "Load Sample Fixtures"}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Neo-Brutalist Graphic Box (like isometric box in Reference Image 1) */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="relative w-full max-w-xs aspect-square border-3 border-neo-black bg-neo-yellow p-6 flex flex-col justify-between shadow-[8px_8px_0px_#000] rotate-1 hover:rotate-0 transition-transform">
                <div className="flex items-center justify-between">
                  <span className="neo-badge bg-neo-white text-neo-black text-[10px]">
                    LIVE HUB
                  </span>
                  <div className="w-3 h-3 rounded-full bg-neo-red animate-pulse-dot" />
                </div>

                <div className="flex items-center justify-center my-2">
                  <LottieAnimation
                    src="/lotties/sports-ball.json"
                    className="w-36 h-36"
                  />
                </div>

                <div className="border-t-3 border-neo-black pt-2 flex items-center justify-between text-xs font-black uppercase text-neo-black">
                  <span>WS LATENCY</span>
                  <span className="font-mono bg-neo-black text-neo-white px-2 py-0.5">
                    &lt; 15MS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live System Stats */}
        <StatsBar
          total={matches.length}
          live={liveCount}
          scheduled={scheduledCount}
          finished={finishedCount}
        />

        {/* Filters and Controls Area (Dedicated Neo-Brutalist Toolbar) */}
        <section className="neo-card p-5 sm:p-6 bg-neo-white space-y-4">
          {/* Top Row: Section Heading + Integrated Search Input */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-3 border-neo-black">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neo-black">
                  Live Broadcast Center
                </h2>
                <span className="neo-badge text-[10px] bg-neo-yellow text-neo-black">
                  {filteredMatches.length} OF {matches.length}
                </span>
              </div>
              <p className="text-xs font-bold uppercase opacity-60 mt-0.5 text-neo-black">
                Real-time match feed &bull; Filter by sport category or match status
              </p>
            </div>

            {/* Search Input with Guaranteed Icon Alignment & Padding */}
            <div className="relative w-full lg:w-96 flex-shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neo-black">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH TEAMS OR SPORTS..."
                className="neo-input neo-input-icon text-xs font-bold uppercase w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-black uppercase text-neo-black hover:text-neo-red transition-colors"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          {/* Middle Row: Status Filter Tabs (Reference Image 2 Style) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider mr-2 opacity-75 text-neo-black">
              STATUS:
            </span>
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`neo-btn text-xs py-2 px-3 sm:px-4 font-black transition-all ${
                    active ? "neo-btn-primary" : "bg-neo-white hover:bg-neo-gray"
                  }`}
                >
                  {f.id === "live" && (
                    <span className="w-2 h-2 rounded-full bg-neo-red animate-pulse-dot inline-block mr-1.5" />
                  )}
                  {f.label}
                  {f.id === "live" && liveCount > 0 && ` (${liveCount})`}
                </button>
              );
            })}
          </div>

          {/* Bottom Row: Sport Categories Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t-2 border-neo-black">
            <span className="text-[11px] font-black uppercase mr-1.5 opacity-75 flex items-center gap-1 text-neo-black">
              <Filter className="w-3.5 h-3.5" />
              SPORT:
            </span>
            {SPORT_CATEGORIES.map((sport) => {
              const active = sportFilter === sport;
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setSportFilter(sport)}
                  className={`px-3 py-1 text-xs font-black uppercase border-2 border-neo-black transition-all ${
                    active
                      ? "bg-neo-black text-neo-white shadow-[2px_2px_0px_#000]"
                      : "bg-neo-white hover:bg-neo-yellow text-neo-black shadow-[1px_1px_0px_#000]"
                  }`}
                >
                  {sport}
                </button>
              );
            })}
          </div>
        </section>

        {/* Match Grid */}
        <section>
          <MatchGrid
            matches={filteredMatches}
            loading={loading}
            onSelectMatch={setSelectedMatch}
            onCreateMatchClick={() => setCreateModalOpen(true)}
            onLoadDemoClick={handleSeedDemoData}
          />
        </section>
      </main>

      {/* Match Detail Modal / Live Control Sheet */}
      {selectedMatch && (
        <MatchDetail
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onMatchUpdated={handleMatchUpdated}
        />
      )}

      {/* Create Match Modal */}
      <CreateMatchModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onMatchCreated={handleMatchCreated}
      />

      {/* Real-time Connection Indicator */}
      <ConnectionIndicator connected={connected} />

      {/* Neo-Brutalist Footer */}
      <footer className="border-t-3 border-neo-black bg-neo-white py-6 px-4 sm:px-8 mt-12">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-black uppercase text-neo-black">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neo-yellow border-2 border-neo-black flex items-center justify-center font-black">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span>SPORTZ BROADCAST ENGINE // NEO BRUTALISM</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs opacity-75">
            <span>REST API</span>
            <span>///</span>
            <span>WEBSOCKETS</span>
            <span>///</span>
            <span>DRIZZLE ORM</span>
            <span>///</span>
            <span>POSTGRESQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
