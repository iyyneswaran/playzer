"use client";

import { Wifi, WifiOff } from "lucide-react";

interface ConnectionIndicatorProps {
  connected: boolean;
}

export function ConnectionIndicator({ connected }: ConnectionIndicatorProps) {
  return (
    <div className="fixed bottom-4 right-4 z-40 select-none">
      <div
        style={{
          backgroundColor: connected ? "#22C55E" : "#EF4444",
          color: connected ? "#000000" : "#FFFFFF",
        }}
        className="border-3 border-neo-black px-3.5 py-2 flex items-center gap-2 text-xs font-black uppercase shadow-[4px_4px_0px_#000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
      >
        {connected ? (
          <>
            <span className="w-2 h-2 rounded-full bg-black animate-pulse-dot flex-shrink-0" />
            <Wifi className="w-4 h-4 text-black stroke-[3] flex-shrink-0" />
            <span className="tracking-wider">CONNECTED</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse-dot flex-shrink-0" />
            <WifiOff className="w-4 h-4 text-white stroke-[3] animate-pulse flex-shrink-0" />
            <span className="tracking-wider">RECONNECTING...</span>
          </>
        )}
      </div>
    </div>
  );
}
