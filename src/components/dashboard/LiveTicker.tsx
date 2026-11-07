"use client";

import type { Match, Commentary } from "@/lib/api";
import { Radio, Zap } from "lucide-react";

interface LiveTickerProps {
  matches: Match[];
  commentary: Commentary[];
  onMatchClick?: (match: Match) => void;
}

export function LiveTicker({ matches, commentary, onMatchClick }: LiveTickerProps) {
  const liveMatches = matches.filter((m) => m.status === "live");

  const tickerItems: { id: string; text: string; match?: Match }[] = [];

  for (const m of liveMatches) {
    tickerItems.push({
      id: `match-${m.id}`,
      text: `${m.sport.toUpperCase()}: ${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}`,
      match: m,
    });
  }

  for (const c of commentary.slice(0, 8)) {
    if (c.message) {
      const min = c.minute != null ? `[${c.minute}']` : "";
      const team = c.team ? `${c.team}: ` : "";
      tickerItems.push({
        id: `comm-${c.id}`,
        text: `${min} ${team}${c.message}`,
      });
    }
  }

  // If no live matches or commentary, show a clean brutalist broadcast status
  if (tickerItems.length === 0) {
    tickerItems.push(
      {
        id: "idle-1",
        text: "SPORTZ WEBSOCKET ENGINE -- REAL-TIME SCORES & COMMENTARY BROADCAST",
      },
      {
        id: "idle-2",
        text: "SELECT OR CREATE A MATCH TO BEGIN LIVE STREAMING",
      }
    );
  }

  return (
    <div className="bg-neo-black text-neo-white border-b-3 border-neo-black overflow-hidden relative select-none">
      <div className="flex items-center">
        {/* Left Live Badge */}
        <div className="flex-shrink-0 bg-neo-yellow text-neo-black px-3.5 py-2 flex items-center gap-2 border-r-3 border-neo-black z-10 font-black text-xs tracking-wider">
          {liveMatches.length > 0 ? (
            <>
              <Radio className="w-3.5 h-3.5 text-neo-red animate-pulse-dot" />
              <span>LIVE FEED</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>AIRWAVES</span>
            </>
          )}
        </div>

        {/* Marquee Ticker */}
        <div className="overflow-hidden py-2 flex-1">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
            {tickerItems.concat(tickerItems).map((item, idx) => (
              <span
                key={`${item.id}-${idx}`}
                onClick={() => item.match && onMatchClick && onMatchClick(item.match)}
                className={`inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wide px-2 ${
                  item.match ? "cursor-pointer hover:text-neo-yellow transition-colors underline decoration-2 decoration-neo-yellow" : ""
                }`}
              >
                <span>{item.text}</span>
                <span className="opacity-40 font-mono font-normal">///</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
