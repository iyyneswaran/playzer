"use client";

import { useEffect, useState, useCallback } from "react";
import type { Match, Commentary } from "@/lib/api";
import {
  fetchCommentary,
  fetchMatch,
  updateMatchScore,
  createCommentary,
  INITIAL_DEMO_COMMENTARY,
} from "@/lib/api";
import { formatDateTime, getRelativeTime } from "@/lib/utils";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  X,
  Radio,
  Clock,
  CheckCircle,
  MessageSquare,
  User,
  Users,
  Tag,
  ChevronDown,
  RefreshCw,
  CalendarDays,
  Timer,
  Send,
  Plus,
  Minus,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

interface MatchDetailProps {
  match: Match;
  onClose: () => void;
  onMatchUpdated?: (updated: Match) => void;
}

const EVENT_TYPES = [
  "goal",
  "yellow_card",
  "red_card",
  "substitution",
  "penalty",
  "half_time",
  "full_time",
  "kickoff",
];

export function MatchDetail({
  match: initialMatch,
  onClose,
  onMatchUpdated,
}: MatchDetailProps) {
  const [match, setMatch] = useState<Match>(initialMatch);
  const [commentary, setCommentary] = useState<Commentary[]>(
    INITIAL_DEMO_COMMENTARY[initialMatch.id] || []
  );
  const [loading, setLoading] = useState(false);
  const [showAllCommentary, setShowAllCommentary] = useState(false);
  const [scoreUpdating, setScoreUpdating] = useState(false);

  // New commentary form state
  const [showCommentaryForm, setShowCommentaryForm] = useState(false);
  const [commentMinute, setCommentMinute] = useState(45);
  const [commentMessage, setCommentMessage] = useState("");
  const [commentEventType, setCommentEventType] = useState("goal");
  const [commentActor, setCommentActor] = useState("");
  const [commentTeam, setCommentTeam] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [matchRes, commData] = await Promise.all([
        fetchMatch(match.id),
        fetchCommentary(match.id, 100),
      ]);
      if (matchRes.data) {
        setMatch(matchRes.data);
        if (onMatchUpdated) onMatchUpdated(matchRes.data);
      }
      if (commData && commData.length > 0) {
        setCommentary(commData);
      }
    } catch (err) {
      console.warn("Could not sync with backend; running in local state mode:", err);
    } finally {
      setLoading(false);
    }
  }, [match.id, onMatchUpdated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time WebSocket subscriptions
  const { subscribe, unsubscribe } = useWebSocket({
    Commentary: (msg) => {
      const comment = msg.data as Commentary;
      if (comment.matchId === match.id) {
        setCommentary((prev) => {
          if (prev.some((c) => c.id === comment.id)) return prev;
          return [comment, ...prev];
        });
      }
    },
    match_updated: (msg) => {
      const updated = msg.data as Match;
      if (updated.id === match.id) {
        setMatch(updated);
        if (onMatchUpdated) onMatchUpdated(updated);
      }
    },
  });

  useEffect(() => {
    subscribe(match.id);
    return () => unsubscribe(match.id);
  }, [match.id, subscribe, unsubscribe]);

  const handleScoreChange = async (homeDelta: number, awayDelta: number) => {
    const newHome = Math.max(0, match.homeScore + homeDelta);
    const newAway = Math.max(0, match.awayScore + awayDelta);

    const localUpdated: Match = {
      ...match,
      homeScore: newHome,
      awayScore: newAway,
    };
    setMatch(localUpdated);
    if (onMatchUpdated) onMatchUpdated(localUpdated);

    try {
      setScoreUpdating(true);
      const serverUpdated = await updateMatchScore(match.id, newHome, newAway);
      setMatch(serverUpdated);
      if (onMatchUpdated) onMatchUpdated(serverUpdated);
    } catch {
      // Offline fallback: local state is already applied
    } finally {
      setScoreUpdating(false);
    }
  };

  const handlePostCommentary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentMessage.trim()) return;

    const fallbackComment: Commentary = {
      id: Date.now(),
      matchId: match.id,
      minute: Number(commentMinute) || 0,
      sequence: commentary.length + 1,
      period: "Live",
      eventType: commentEventType,
      actor: commentActor.trim() || null,
      team: commentTeam.trim() || null,
      message: commentMessage.trim(),
      metadata: null,
      tags: [commentEventType.toUpperCase()],
      createdAt: new Date().toISOString(),
    };

    try {
      setSubmittingComment(true);
      setCommentError(null);
      const newComment = await createCommentary(match.id, {
        minute: Number(commentMinute) || 0,
        message: commentMessage.trim(),
        eventType: commentEventType || undefined,
        actor: commentActor.trim() || undefined,
        team: commentTeam.trim() || undefined,
      });

      setCommentary((prev) => {
        if (prev.some((c) => c.id === newComment.id)) return prev;
        return [newComment, ...prev];
      });

      setCommentMessage("");
      setCommentActor("");
      setShowCommentaryForm(false);
    } catch {
      // Local fallback if backend is offline
      setCommentary((prev) => [fallbackComment, ...prev]);
      setCommentMessage("");
      setCommentActor("");
      setShowCommentaryForm(false);
    } finally {
      setSubmittingComment(false);
    }
  };

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const isScheduled = match.status === "scheduled";

  const displayedCommentary = showAllCommentary
    ? commentary
    : commentary.slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neo-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Modal / Bottom Sheet */}
      <div className="relative w-full sm:w-[620px] max-h-[94vh] bg-neo-white border-t-3 sm:border-3 border-neo-black shadow-[0_-4px_0_#000] sm:shadow-[8px_8px_0px_#000] overflow-hidden animate-slide-up flex flex-col z-10">
        {/* Header */}
        <div
          className={`px-5 py-3.5 flex items-center justify-between border-b-3 border-neo-black ${
            isLive
              ? "bg-neo-red text-neo-white"
              : isFinished
              ? "bg-neo-purple text-neo-white"
              : "bg-neo-yellow text-neo-black"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isLive && <Radio className="w-5 h-5 animate-pulse-dot" />}
            {isScheduled && <Clock className="w-5 h-5" />}
            {isFinished && <CheckCircle className="w-5 h-5" />}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider">
                  {match.sport}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 border border-current">
                  ID #{match.id}
                </span>
              </div>
              <span className="text-xs font-bold uppercase opacity-85">
                STATUS: {match.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-1.5 border-2 border-current hover:bg-black/10 transition-colors"
              title="Refresh match data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 border-2 border-current hover:bg-black/10 transition-colors"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto">
          {/* Brutalist Scoreboard Card */}
          <div className="p-5 sm:p-6 bg-neo-white border-b-3 border-neo-black">
            <div className="grid grid-cols-3 items-center gap-2 text-center">
              {/* Home Team */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border-3 border-neo-black bg-neo-yellow flex items-center justify-center font-black text-lg uppercase shadow-[3px_3px_0px_#000]">
                  {match.homeTeam.slice(0, 3)}
                </div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-tight line-clamp-2">
                  {match.homeTeam}
                </span>

                {/* Score Controls */}
                <div className="inline-flex items-center border-2 border-neo-black bg-neo-white shadow-[2px_2px_0px_#000] mt-1">
                  <button
                    disabled={scoreUpdating || match.homeScore <= 0}
                    onClick={() => handleScoreChange(-1, 0)}
                    className="p-1 hover:bg-neo-gray disabled:opacity-30 border-r-2 border-neo-black transition-colors"
                    title="Decrement Home Score"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-xs font-mono font-bold">
                    {match.homeScore}
                  </span>
                  <button
                    disabled={scoreUpdating}
                    onClick={() => handleScoreChange(1, 0)}
                    className="p-1 hover:bg-neo-yellow disabled:opacity-30 border-l-2 border-neo-black transition-colors"
                    title="Increment Home Score"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Big Score Display */}
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 sm:gap-3 bg-neo-black text-neo-white px-3 sm:px-4 py-2 border-3 border-neo-black shadow-[4px_4px_0px_#000]">
                  <span className="text-3xl sm:text-4xl font-black font-mono">
                    {match.homeScore}
                  </span>
                  <span className="text-xl font-bold opacity-60">:</span>
                  <span className="text-3xl sm:text-4xl font-black font-mono">
                    {match.awayScore}
                  </span>
                </div>

                {isLive ? (
                  <span className="mt-2 neo-badge bg-neo-red text-neo-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-neo-white animate-pulse-dot" />
                    LIVE ON AIR
                  </span>
                ) : isFinished ? (
                  <span className="mt-2 neo-badge bg-neo-purple text-neo-white">
                    FINAL WHISTLE
                  </span>
                ) : (
                  <span className="mt-2 neo-badge bg-neo-yellow text-neo-black">
                    SCHEDULED
                  </span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border-3 border-neo-black bg-neo-gray flex items-center justify-center font-black text-lg uppercase shadow-[3px_3px_0px_#000]">
                  {match.awayTeam.slice(0, 3)}
                </div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-tight line-clamp-2">
                  {match.awayTeam}
                </span>

                {/* Score Controls */}
                <div className="inline-flex items-center border-2 border-neo-black bg-neo-white shadow-[2px_2px_0px_#000] mt-1">
                  <button
                    disabled={scoreUpdating || match.awayScore <= 0}
                    onClick={() => handleScoreChange(0, -1)}
                    className="p-1 hover:bg-neo-gray disabled:opacity-30 border-r-2 border-neo-black transition-colors"
                    title="Decrement Away Score"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-xs font-mono font-bold">
                    {match.awayScore}
                  </span>
                  <button
                    disabled={scoreUpdating}
                    onClick={() => handleScoreChange(0, 1)}
                    className="p-1 hover:bg-neo-yellow disabled:opacity-30 border-l-2 border-neo-black transition-colors"
                    title="Increment Away Score"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Time and Info Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 pt-4 border-t-2 border-neo-black text-xs font-bold uppercase">
              <div className="flex items-center gap-2 opacity-80">
                <CalendarDays className="w-4 h-4" />
                <span>Kickoff: {formatDateTime(match.startTime)}</span>
              </div>
              {match.endTime && (
                <div className="flex items-center gap-2 opacity-80">
                  <Timer className="w-4 h-4" />
                  <span>End: {formatDateTime(match.endTime)}</span>
                </div>
              )}
              {isScheduled && (
                <div className="col-span-full text-neo-purple flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Countdown: {getRelativeTime(match.startTime)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="px-5 py-3 bg-neo-yellow border-b-3 border-neo-black flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-black uppercase">
                Live Broadcast Feed ({commentary.length})
              </span>
            </div>

            <button
              onClick={() => setShowCommentaryForm(!showCommentaryForm)}
              className="neo-btn text-xs py-1.5 px-3 bg-neo-white"
            >
              {showCommentaryForm ? (
                "Close Form"
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Add Commentary
                </>
              )}
            </button>
          </div>

          {/* Add Commentary Form */}
          {showCommentaryForm && (
            <div className="p-4 sm:p-5 bg-neo-gray border-b-3 border-neo-black animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Broadcast Live Event
                </span>
                <span className="text-[10px] font-mono opacity-60">
                  Sends via REST &amp; WebSockets
                </span>
              </div>

              {commentError && (
                <div className="mb-3 p-2 bg-neo-red text-neo-white text-xs font-bold uppercase border-2 border-neo-black">
                  {commentError}
                </div>
              )}

              <form onSubmit={handlePostCommentary} className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase block mb-1">
                      Minute
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="150"
                      value={commentMinute}
                      onChange={(e) =>
                        setCommentMinute(Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="neo-input text-xs font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase block mb-1">
                      Event Type
                    </label>
                    <select
                      value={commentEventType}
                      onChange={(e) => setCommentEventType(e.target.value)}
                      className="neo-select text-xs w-full font-bold uppercase"
                    >
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-bold uppercase block mb-1">
                      Team
                    </label>
                    <select
                      value={commentTeam}
                      onChange={(e) => setCommentTeam(e.target.value)}
                      className="neo-select text-xs w-full font-bold uppercase"
                    >
                      <option value="">(Neutral/Both)</option>
                      <option value={match.homeTeam}>{match.homeTeam}</option>
                      <option value={match.awayTeam}>{match.awayTeam}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase block mb-1">
                    Actor / Player (Optional)
                  </label>
                  <input
                    type="text"
                    value={commentActor}
                    onChange={(e) => setCommentActor(e.target.value)}
                    placeholder="e.g. Erling Haaland, LeBron James"
                    className="neo-input text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase block mb-1">
                    Commentary Message
                  </label>
                  <textarea
                    rows={2}
                    value={commentMessage}
                    onChange={(e) => setCommentMessage(e.target.value)}
                    placeholder="Describe what just happened on the pitch..."
                    className="neo-input text-xs resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCommentaryForm(false)}
                    className="neo-btn text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="neo-btn neo-btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
                  >
                    {submittingComment ? (
                      "Broadcasting..."
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Broadcast
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Commentary List */}
          {commentary.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 border-3 border-neo-black bg-neo-yellow mx-auto mb-3 flex items-center justify-center shadow-[3px_3px_0px_#000]">
                <MessageSquare className="w-7 h-7" />
              </div>
              <p className="text-sm font-black uppercase">No commentary yet</p>
              <p className="text-xs opacity-70 mt-1">
                Post an update above or wait for live events to arrive.
              </p>
            </div>
          ) : (
            <div className="divide-y-3 divide-neo-black">
              {displayedCommentary.map((c) => (
                <CommentaryItem key={c.id} commentary={c} />
              ))}

              {!showAllCommentary && commentary.length > 10 && (
                <button
                  onClick={() => setShowAllCommentary(true)}
                  className="w-full p-3.5 flex items-center justify-center gap-2 text-xs font-black uppercase bg-neo-white hover:bg-neo-yellow transition-colors border-t-3 border-neo-black"
                >
                  <ChevronDown className="w-4 h-4" />
                  View all {commentary.length} updates
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentaryItem({ commentary: c }: { commentary: Commentary }) {
  const eventBadgeColors: Record<string, string> = {
    goal: "bg-neo-yellow text-neo-black",
    red_card: "bg-neo-red text-neo-white",
    yellow_card: "bg-neo-yellow text-neo-black",
    substitution: "bg-neo-blue text-neo-white",
    penalty: "bg-neo-orange text-neo-white",
    half_time: "bg-neo-purple text-neo-white",
    full_time: "bg-neo-purple text-neo-white",
    kickoff: "bg-neo-green text-neo-white",
  };

  const badgeColor = c.eventType
    ? eventBadgeColors[c.eventType.toLowerCase()] || "bg-neo-black text-neo-white"
    : "bg-neo-black text-neo-white";

  return (
    <div className="p-4 sm:p-5 bg-neo-white hover:bg-neo-gray transition-colors animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Minute badge */}
        <div className="flex-shrink-0 w-11 h-11 border-3 border-neo-black bg-neo-white flex items-center justify-center shadow-[2px_2px_0px_#000]">
          <span className="text-xs font-black font-mono">
            {c.minute != null ? `${c.minute}'` : "--"}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {c.eventType && (
              <span className={`neo-badge text-[10px] ${badgeColor}`}>
                {c.eventType.replace("_", " ")}
              </span>
            )}
            {c.team && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase opacity-80">
                <Users className="w-3 h-3" />
                {c.team}
              </span>
            )}
            {c.actor && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase opacity-80">
                <User className="w-3 h-3" />
                {c.actor}
              </span>
            )}
          </div>

          <p className="text-sm font-bold leading-relaxed">{c.message}</p>

          {c.tags && c.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {c.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 border border-neo-black bg-neo-white"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
