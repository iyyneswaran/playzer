"use client";

import type { Match } from "@/lib/api";
import { MatchCard } from "./MatchCard";
import { Loader2, Plus, Sparkles, Trophy } from "lucide-react";
import { LottieAnimation } from "@/components/ui/LottieAnimation";

interface MatchGridProps {
  matches: Match[];
  loading: boolean;
  onSelectMatch: (match: Match) => void;
  onCreateMatchClick: () => void;
  onLoadDemoClick?: () => void;
}

export function MatchGrid({
  matches,
  loading,
  onSelectMatch,
  onCreateMatchClick,
  onLoadDemoClick,
}: MatchGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 border-3 border-neo-black bg-neo-yellow flex items-center justify-center shadow-[4px_4px_0px_#000]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <span className="text-sm font-black uppercase tracking-wider">
          Connecting &amp; Fetching Broadcasts...
        </span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="neo-card p-8 sm:p-14 text-center max-w-2xl mx-auto my-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 border-3 border-neo-black bg-neo-white flex items-center justify-center p-2 shadow-[4px_4px_0px_#000]">
            <LottieAnimation src="/lotties/sports-ball.json" className="w-20 h-20" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            No Matches Found
          </h3>

          <p className="text-xs sm:text-sm font-bold opacity-70 max-w-md">
            No matches match this filter yet. Create your first match or seed demo matches to experience live scores and real-time commentary broadcasts.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <button
              onClick={onCreateMatchClick}
              className="neo-btn neo-btn-primary text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Match
            </button>

            {onLoadDemoClick && (
              <button
                onClick={onLoadDemoClick}
                className="neo-btn text-xs flex items-center gap-2 bg-neo-white"
              >
                <Sparkles className="w-4 h-4" />
                Load Sample Matches
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          onClick={() => onSelectMatch(match)}
        />
      ))}
    </div>
  );
}
