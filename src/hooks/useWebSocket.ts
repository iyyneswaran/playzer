"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getWsUrl } from "@/lib/api";

type WsMessage = {
  type: string;
  data?: unknown;
  matchId?: number;
  message?: string;
};

type WsHandler = (msg: WsMessage) => void;

export function useWebSocket(handlers?: Record<string, WsHandler>) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef(handlers);
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  handlersRef.current = handlers;

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(getWsUrl());

      ws.onopen = () => {
        if (mountedRef.current) setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          const handler = handlersRef.current?.[msg.type];
          if (handler) handler(msg);
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (mountedRef.current) {
          setConnected(false);
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, []);

  const send = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const subscribe = useCallback(
    (matchId: number) => {
      send({ type: "subscribe", matchId });
    },
    [send]
  );

  const unsubscribe = useCallback(
    (matchId: number) => {
      send({ type: "unsubscribe", matchId });
    },
    [send]
  );

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  return { connected, send, subscribe, unsubscribe };
}
