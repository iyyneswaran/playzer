"use client";

import {
  Trophy,
  Radio,
  Clock,
  CheckCircle,
  Activity,
  Flame,
} from "lucide-react";

interface StatsBarProps {
  total: number;
  live: number;
  scheduled: number;
  finished: number;
}

export function StatsBar({ total, live, scheduled, finished }: StatsBarProps) {
  return (
    <div className="space-y-4">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        {/* Card 1: Total Matches */}
        <div
          style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
          className="border-3 border-neo-black p-4 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 border-2 border-black bg-neo-yellow text-black shadow-[1px_1px_0px_#000]">
              DATABASE
            </span>
            <Trophy className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tighter text-black">
              {total}
            </span>
            <span className="text-xs font-black uppercase text-black opacity-80 text-right truncate ml-2">
              Total Matches
            </span>
          </div>
        </div>

        {/* Card 2: Live Broadcasts (High Contrast Vibrant Neo Red) */}
        <div
          style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}
          className="border-3 border-neo-black p-4 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 border-2 border-black bg-black text-white shadow-[1px_1px_0px_#000]">
              STREAMING
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse-dot" />
              <Radio className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tighter text-white">
              {live}
            </span>
            <span className="text-xs font-black uppercase text-white opacity-95 text-right truncate ml-2">
              Live Broadcasts
            </span>
          </div>
        </div>

        {/* Card 3: Upcoming / Scheduled (Electric Lime Yellow) */}
        <div
          style={{ backgroundColor: "#D4FF2B", color: "#000000" }}
          className="border-3 border-neo-black p-4 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 border-2 border-black bg-black text-white shadow-[1px_1px_0px_#000]">
              FIXTURES
            </span>
            <Clock className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tighter text-black">
              {scheduled}
            </span>
            <span className="text-xs font-black uppercase text-black opacity-85 text-right truncate ml-2">
              Upcoming
            </span>
          </div>
        </div>

        {/* Card 4: Finished / Concluded (Electric Violet Purple) */}
        <div
          style={{ backgroundColor: "#8B5CF6", color: "#FFFFFF" }}
          className="border-3 border-neo-black p-4 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 border-2 border-black bg-black text-white shadow-[1px_1px_0px_#000]">
              ARCHIVE
            </span>
            <CheckCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tighter text-white">
              {finished}
            </span>
            <span className="text-xs font-black uppercase text-white opacity-95 text-right truncate ml-2">
              Finished
            </span>
          </div>
        </div>
      </div>

      {/* Dual-tone Progress Strip like Reference Image 1 */}
      <div className="bg-neo-white border-3 border-neo-black p-3 sm:p-4 shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neo-yellow border-2 border-neo-black flex items-center justify-center font-black">
            <Flame className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-tight text-black">
                Hybrid Broadcast Engine: Active
              </span>
              <span className="neo-badge text-[9px] bg-neo-green text-neo-white">
                WEBSOCKETS READY
              </span>
            </div>
            <p className="text-[11px] font-bold text-black opacity-60">
              Low-latency events stream continuously without full-page reloads
            </p>
          </div>
        </div>

        {/* Dual tone progress badge from reference image 1 */}
        <div className="inline-flex border-2 border-neo-black overflow-hidden text-xs font-black uppercase shadow-[2px_2px_0px_#000]">
          <div className="bg-[#8B5CF6] text-white px-3 py-1.5 flex items-center gap-1.5 font-black">
            <Activity className="w-3.5 h-3.5" />
            <span>Live Sync</span>
          </div>
          <div className="bg-neo-yellow text-black px-3 py-1.5 font-mono font-black">
            {live > 0 ? `${live} MATCHES ACTIVE` : "READY"}
          </div>
        </div>
      </div>
    </div>
  );
}
