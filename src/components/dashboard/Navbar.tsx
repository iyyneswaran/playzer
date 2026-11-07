"use client";

import { useState } from "react";
import {
  Zap,
  Menu,
  X,
  Plus,
  RefreshCw,
} from "lucide-react";

interface NavbarProps {
  onNewMatchClick: () => void;
  onRefreshClick: () => void;
  refreshing?: boolean;
  connected?: boolean;
}

export function Navbar({
  onNewMatchClick,
  onRefreshClick,
  refreshing = false,
  connected = true,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-neo-white border-b-3 border-neo-black sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Brand matching Reference Image 1 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-neo-yellow border-3 border-neo-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
              <Zap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neo-black">
                  PLAYZER
                </span>
                <span className="neo-badge text-[9px] bg-neo-black text-neo-white hidden sm:inline-flex">
                  LIVE OPS
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase opacity-60 block -mt-1 text-neo-black">
                HYBRID WS BROADCAST
              </span>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Connection Status Pill */}
            <div
              style={{
                backgroundColor: connected ? "#22C55E" : "#EF4444",
                color: connected ? "#000000" : "#FFFFFF",
              }}
              className="px-3 py-1.5 border-2 border-neo-black text-xs font-black uppercase flex items-center gap-2 shadow-[2px_2px_0px_#000]"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  connected ? "bg-black animate-pulse-dot" : "bg-white"
                }`}
              />
              <span>{connected ? "WS STREAM ACTIVE" : "WS DISCONNECTED"}</span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefreshClick}
              disabled={refreshing}
              className="neo-btn text-xs py-2 px-3 bg-neo-white hover:bg-neo-gray"
              title="Refresh match list"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden lg:inline">SYNC</span>
            </button>

            {/* New Match Button */}
            <button
              type="button"
              onClick={onNewMatchClick}
              className="neo-btn neo-btn-primary text-xs py-2 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>NEW MATCH</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={onNewMatchClick}
              className="neo-btn neo-btn-primary text-xs py-1.5 px-2.5 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>NEW</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="neo-btn p-2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t-3 border-neo-black py-4 space-y-3 animate-slide-up">
            <div
              style={{
                backgroundColor: connected ? "#22C55E" : "#EF4444",
                color: connected ? "#000000" : "#FFFFFF",
              }}
              className="p-2.5 border-2 border-neo-black text-xs font-black uppercase flex items-center justify-between shadow-[2px_2px_0px_#000]"
            >
              <span>STATUS:</span>
              <span>{connected ? "LIVE WEBSOCKETS ACTIVE" : "OFFLINE / RECONNECTING"}</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onRefreshClick();
                  setMobileOpen(false);
                }}
                className="neo-btn text-xs flex-1 py-2 flex items-center justify-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => {
                  onNewMatchClick();
                  setMobileOpen(false);
                }}
                className="neo-btn neo-btn-primary text-xs flex-1 py-2 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Match
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
