import { useEffect, useRef, useState, useCallback } from 'react';
import type { Delta, Cursor, Document } from '../services/api';

// WebSocket message types
export interface WSMessage {
  type: 'init' | 'operation' | 'cursor' | 'error';
  document?: Document;
  delta?: Delta;
  cursor?: Cursor;
  clients?: Cursor[];
  error?: string;
}

export interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WSMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface UseWebSocketReturn {
  sendMessage: (message: any) => void;
  sendOperation: (delta: Delta, cursor?: Cursor) => void;
  sendCursor: (cursor: Cursor) => void;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  disconnect: () => void;
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  autoReconnect = true,
  reconnectInterval = 3000,
  maxReconnectAttempts = 5,
}: UseWebSocketOptions): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (!url || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0);
        setError(null);
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
          setError('Failed to parse message from server');
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
        onError?.(event);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsConnecting(false);
        wsRef.current = null;
        onClose?.();

        // Auto-reconnect logic
        if (
          shouldReconnectRef.current &&
          autoReconnect &&
          reconnectAttempts < maxReconnectAttempts
        ) {
          console.log(
            `Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`
          );
          reconnectTimeoutRef.current = window.setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, reconnectInterval);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          setError('Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to create WebSocket connection');
      setIsConnecting(false);
    }
  }, [url, onMessage, onOpen, onClose, onError, autoReconnect, reconnectInterval, maxReconnectAttempts, reconnectAttempts]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
      setError('WebSocket is not connected');
    }
  }, []);

  const sendOperation = useCallback(
    (delta: Delta, cursor?: Cursor) => {
      const message: any = {
        type: 'operation',
        delta,
      };
      if (cursor) {
        message.cursor = cursor;
      }
      sendMessage(message);
    },
    [sendMessage]
  );

  const sendCursor = useCallback(
    (cursor: Cursor) => {
      const message = {
        type: 'cursor',
        cursor,
      };
      sendMessage(message);
    },
    [sendMessage]
  );

  // Connect on mount
  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    sendMessage,
    sendOperation,
    sendCursor,
    isConnected,
    isConnecting,
    error,
    reconnectAttempts,
    disconnect,
  };
}
