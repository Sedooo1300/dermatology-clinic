'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type SyncEventHandler = (data: any) => void;

const SYNC_EVENTS = [
  'patient:created',
  'patient:updated',
  'patient:deleted',
  'visit:created',
  'visit:updated',
  'visit:deleted',
  'session:created',
  'session:updated',
  'session:deleted',
  'alert:new',
  'alert:updated',
  'alert:deleted',
  'note:new',
  'service:created',
  'service:updated',
  'service:deleted',
] as const;

type SyncEventType = (typeof SYNC_EVENTS)[number];

export function useSync() {
  const [connected, setConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<string>('');
  const [syncMode, setSyncMode] = useState<'polling' | 'websocket'>('polling');
  const handlersRef = useRef<Map<string, Set<SyncEventHandler>>>(new Map());
  const socketRef = useRef<any>(null);

  const handleSyncEvent = useCallback((event: string, data: any) => {
    setLastSyncTime(new Date());
    const handlers = handlersRef.current.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
    const wildcardHandlers = handlersRef.current.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => handler({ event, data }));
    }
  }, []);

  useEffect(() => {
    // Try to connect via WebSocket if SYNC_URL is configured
    // On Vercel, this will not be available, so we default to polling
    let wsCleanup: (() => void) | null = null;

    try {
      // Check if we can connect to a WebSocket sync service
      // In production (Vercel), we use polling only
      const syncUrl = typeof window !== 'undefined' ? window.location.origin : '';

      // Import socket.io-client dynamically to avoid SSR issues
      import('socket.io-client').then(({ io }) => {
        const socket = io(syncUrl, {
          path: '/api/sync',
          transports: ['polling'], // Start with polling, upgrade not needed
          reconnection: true,
          reconnectionAttempts: 3, // Only try 3 times then fall back to polling
          reconnectionDelay: 2000,
          timeout: 5000,
          forceNew: true,
        });

        socketRef.current = socket;

        const connectTimeout = setTimeout(() => {
          if (!socket.connected) {
            console.log('[SYNC] WebSocket not available, using polling mode');
            setSyncMode('polling');
            setConnectionInfo('وضع الاستطلاع');
            setConnected(true); // "Connected" in polling mode means the API is reachable
            socket.disconnect();
            socketRef.current = null;
          }
        }, 3000);

        socket.on('connect', () => {
          clearTimeout(connectTimeout);
          console.log('[SYNC] WebSocket connected:', socket.id);
          setConnected(true);
          setSyncMode('websocket');
          setConnectionInfo(`متصل - WebSocket (${(socket.id || '').substring(0, 6)})`);
        });

        socket.on('disconnect', (reason) => {
          console.log('[SYNC] Disconnected:', reason);
          setConnected(false);
          setSyncMode('polling');
          setConnectionInfo('وضع الاستطلاع');
        });

        socket.on('connect_error', (error) => {
          console.log('[SYNC] Connection failed, using polling:', error.message);
          clearTimeout(connectTimeout);
          setSyncMode('polling');
          setConnectionInfo('وضع الاستطلاع');
          setConnected(true); // API still works in polling mode
        });

        socket.on('sync:connected', (data: any) => {
          setConnectionInfo(`متصل (${data.totalClients} جهاز)`);
        });

        // Listen for all sync events
        SYNC_EVENTS.forEach(event => {
          socket.on(event, (data: any) => {
            handleSyncEvent(event, data);
          });
        });

        socket.on('sync:pong', (data: any) => {
          setLastSyncTime(new Date(data?.timestamp || Date.now()));
        });

        wsCleanup = () => {
          clearTimeout(connectTimeout);
          SYNC_EVENTS.forEach(event => { socket.off(event); });
          socket.off('connect');
          socket.off('disconnect');
          socket.off('connect_error');
          socket.off('sync:connected');
          socket.off('sync:pong');
          socket.disconnect();
          socketRef.current = null;
        };
      }).catch(() => {
        console.log('[SYNC] Socket.IO not available, using polling mode');
        setSyncMode('polling');
        setConnectionInfo('وضع الاستطلاع');
        setConnected(true);
      });
    } catch {
      setSyncMode('polling');
      setConnectionInfo('وضع الاستطلاع');
      setConnected(true);
    }

    // After a brief period, if still not connected via WebSocket, set to polling
    const fallbackTimeout = setTimeout(() => {
      if (!connected && syncMode === 'polling' && !connectionInfo) {
        setConnectionInfo('وضع الاستطلاع');
        setConnected(true);
      }
    }, 4000);

    return () => {
      clearTimeout(fallbackTimeout);
      if (wsCleanup) wsCleanup();
    };
  }, []); // Only run once on mount

  // Periodic ping
  useEffect(() => {
    if (syncMode !== 'websocket' || !connected) return;

    const pingInterval = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('sync:ping');
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [syncMode, connected]);

  const on = useCallback((event: SyncEventType | '*', handler: SyncEventHandler) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    const handlers = handlersRef.current.get(event)!;
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  }, []);

  return {
    connected,
    connectionInfo,
    lastSyncTime,
    syncMode,
    on,
  };
}
