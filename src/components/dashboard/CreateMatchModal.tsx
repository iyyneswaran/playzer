"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trophy, Calendar, Clock, Loader2, Sparkles } from "lucide-react";
import { createMatch, type Match } from "@/lib/api";

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchCreated: (match: Match) => void;
}

const PRESET_SPORTS = [
  "Football",
  "Basketball",
  "Cricket",
  "Tennis",
  "Baseball",
  "Hockey",
];

export function CreateMatchModal({
  isOpen,
  onClose,
  onMatchCreated,
}: CreateMatchModalProps) {
  const [sport, setSport] = useState("Football");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const future = new Date(now.getTime() + 90 * 60 * 1000);
      setStartTime(now.toISOString().slice(0, 16));
      setEndTime(future.toISOString().slice(0, 16));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam.trim() || !awayTeam.trim()) {
      setError("Home and away teams are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newMatch = await createMatch({
        sport,
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
        startTime: new Date(startTime).toISOString(),
        endTime: endTime ? new Date(endTime).toISOString() : null,
        homeScore: Number(homeScore) || 0,
        awayScore: Number(awayScore) || 0,
      });

      onMatchCreated(newMatch);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create match");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (presetSport: string, home: string, away: string) => {
    setSport(presetSport);
    setHomeTeam(home);
    setAwayTeam(away);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neo-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-neo-white border-3 border-neo-black shadow-[8px_8px_0px_#000] p-6 animate-slide-up z-10 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-3 border-neo-black mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neo-yellow border-2 border-neo-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Trophy className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold uppercase tracking-tight">
              Create New Match
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-neo-black hover:bg-neo-gray transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-wider block mb-1.5 opacity-80 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Match Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill("Football", "Real Madrid", "Barcelona")}
              className="px-2.5 py-1 text-[11px] font-bold uppercase bg-neo-gray border-2 border-neo-black hover:bg-neo-yellow transition-colors"
            >
              El Clásico
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("Basketball", "LA Lakers", "Boston Celtics")}
              className="px-2.5 py-1 text-[11px] font-bold uppercase bg-neo-gray border-2 border-neo-black hover:bg-neo-yellow transition-colors"
            >
              NBA Finals
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("Cricket", "India", "Australia")}
              className="px-2.5 py-1 text-[11px] font-bold uppercase bg-neo-gray border-2 border-neo-black hover:bg-neo-yellow transition-colors"
            >
              Cricket Cup
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-neo-red text-neo-white border-2 border-neo-black text-xs font-bold uppercase shadow-[2px_2px_0px_#000]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sport selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1">
              Sport Category
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_SPORTS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSport(s)}
                  className={`px-3 py-1 text-xs font-bold uppercase border-2 border-neo-black transition-all ${
                    sport === s
                      ? "bg-neo-yellow shadow-[2px_2px_0px_#000]"
                      : "bg-neo-white hover:bg-neo-gray"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              placeholder="Or enter custom sport name..."
              className="neo-input"
              required
            />
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1">
                Home Team
              </label>
              <input
                type="text"
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                placeholder="e.g. Manchester City"
                className="neo-input"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1">
                Away Team
              </label>
              <input
                type="text"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                placeholder="e.g. Arsenal"
                className="neo-input"
                required
              />
            </div>
          </div>

          {/* Initial Scores */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1">
                Home Score
              </label>
              <input
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                className="neo-input font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1">
                Away Score
              </label>
              <input
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                className="neo-input font-mono font-bold"
              />
            </div>
          </div>

          {/* Time fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="neo-input font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                End Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="neo-input font-mono text-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t-2 border-neo-black flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="neo-btn text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="neo-btn neo-btn-primary text-xs flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Match
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
