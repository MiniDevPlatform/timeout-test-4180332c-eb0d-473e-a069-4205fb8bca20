/**
 * MiniDev ONE Template - WebSocket Hook
 * 
 * Real-time WebSocket connections with reconnection.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface WebSocketOptions {
  url: string;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (data: any) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

export interface UseWebSocketReturn {
  send: (data: any) => void;
  close: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  lastMessage: any;
  reconnect: () => void;
}

/**
 * useWebSocket - WebSocket connection with hooks
 */
export function useWebSocket(options: WebSocketOptions): UseWebSocketReturn {
  const {
    url,
    protocols,
    onOpen,
    onClose,
    onError,
    onMessage,
    reconnect = true,
    reconnectInterval = 3000,
    reconnectAttempts = 10,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setIsConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(url, protocols);
      wsRef.current = ws;

      ws.onopen = (event) => {
        setIsConnected(true);
        setIsConnecting(false);
        reconnectCountRef.current = 0;
        onOpen?.(event);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        onClose?.(event);

        if (reconnect && reconnectCountRef.current < reconnectAttempts) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectCountRef.current++;
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (event) => {
        setError(new Error('WebSocket error'));
        onError?.(event);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch {
          setLastMessage(event.data);
          onMessage?.(event.data);
        }
      };
    } catch (err) {
      setError(err as Error);
      setIsConnecting(false);
    }
  }, [url, protocols, onOpen, onClose, onError, onMessage, reconnect, reconnectInterval, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      wsRef.current.send(message);
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectCountRef.current = 0;
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    send,
    close: disconnect,
    isConnected,
    isConnecting,
    error,
    lastMessage,
    reconnect,
  };
}

/**
 * useRealtime - Simplified real-time data hook
 */
export function useRealtime<T>(
  url: string,
  initialValue: T
): {
  data: T;
  send: (data: any) => void;
  isConnected: boolean;
} {
  const [data, setData] = useState<T>(initialValue);
  const [isConnected, setIsConnected] = useState(false);

  const { send, lastMessage, isConnected: connected } = useWebSocket({
    url,
    onMessage: (message) => {
      setData(message);
    },
    onOpen: () => setIsConnected(true),
    onClose: () => setIsConnected(false),
  });

  useEffect(() => {
    setIsConnected(connected);
  }, [connected]);

  return { data, send, isConnected };
}

export default {
  useWebSocket,
  useRealtime,
};