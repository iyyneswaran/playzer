"use client";

import type { Match } from "@/lib/api";
import { formatDateTime, getRelativeTime, getSportIcon } from "@/lib/utils";
import {
  Clock,
  Radio,
  CheckCircle,
  CalendarDays,
  ArrowUpRight,
  Trophy,
} from "lucide-react";

interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

export function MatchCard({ match, onClick }: MatchCardProps) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const isScheduled = match.status === "scheduled";

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="neo-card p-0 text-left w-full group cursor-pointer focus:outline-none flex flex-col justify-between"
    >
      {/* Top Header Bar */}
      <div>
        <div
          className={`px-4 py-2.5 flex items-center justify-between border-b-3 border-neo-black ${
            isLive
              ? "bg-neo-red text-neo-white"
              : isFinished
              ? "bg-neo-purple text-neo-white"
              : "bg-neo-yellow text-neo-black"
          }`}
        >
          <div className="flex items-center gap-2">
            {isLive && <Radio className="w-3.5 h-3.5 animate-pulse-dot" />}
            {isScheduled && <Clock className="w-3.5 h-3.5" />}
            {isFinished && <CheckCircle className="w-3.5 h-3.5" />}
            <span className="text-xs font-black uppercase tracking-wider">
              {match.status}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase px-2 py-0.5 border-2 border-current">
              {match.sport}
            </span>
          </div>
        </div>

        {/* Match Center: Teams and Scoreboard */}
        <div className="p-4 sm:p-5">
          {/* Home Team */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 border-3 border-neo-black bg-neo-yellow flex items-center justify-center font-black text-sm uppercase shadow-[2px_2px_0px_#000]">
                {match.homeTeam.slice(0, 2)}
              </div>
              <span className="font-black text-sm sm:text-base uppercase tracking-tight truncate">
                {match.homeTeam}
              </span>
            </div>
            <span
              className={`text-2xl sm:text-3xl font-black font-mono ${
                isLive ? "text-neo-red" : ""
              }`}
            >
              {match.homeScore}
            </span>
          </div>

          {/* VS Divider */}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-[2px] bg-neo-black" />
            <span className="text-[11px] font-black uppercase px-2 py-0.5 bg-neo-gray border-2 border-neo-black">
              VS
            </span>
            <div className="flex-1 h-[2px] bg-neo-black" />
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between gap-3 mt-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 border-3 border-neo-black bg-neo-gray flex items-center justify-center font-black text-sm uppercase shadow-[2px_2px_0px_#000]">
                {match.awayTeam.slice(0, 2)}
              </div>
              <span className="font-black text-sm sm:text-base uppercase tracking-tight truncate">
                {match.awayTeam}
              </span>
            </div>
            <span
              className={`text-2xl sm:text-3xl font-black font-mono ${
                isLive ? "text-neo-red" : ""
              }`}
            >
              {match.awayScore}
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer with Details & Neo Arrow Box (from reference image) */}
      <div className="px-4 py-3 border-t-3 border-neo-black bg-neo-gray flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold opacity-75">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{formatDateTime(match.startTime)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase hidden xs:inline-block">
            {isScheduled ? getRelativeTime(match.startTime) : "Live Room"}
          </span>

          {/* Neo brutalist arrow box directly matching reference image 2 */}
          <div className="w-7 h-7 bg-neo-yellow border-2 border-neo-black flex items-center justify-center group-hover:bg-neo-black group-hover:text-neo-white transition-colors shadow-[2px_2px_0px_#000]">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
