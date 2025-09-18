import React, { createContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import type { WebSocketMessage, WebSocketConfig, WebSocketEventHandler } from '../types/websocket';
import { config } from '../config';

interface WebSocketContextType {
  // Estado de conexión
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastMessage: WebSocketMessage | null;

  // Funciones de control
  sendMessage: (message: WebSocketMessage) => void;
  connect: () => void;
  disconnect: () => void;

  // Event listeners
  onMessage: (handler: WebSocketEventHandler) => () => void;
  onChatUpdate: (handler: WebSocketEventHandler) => () => void;
  onUserUpdate: (handler: WebSocketEventHandler) => () => void;
  onNotification: (handler: WebSocketEventHandler) => () => void;
  onError: (handler: WebSocketEventHandler) => () => void;

  // Funciones de utilidad (solo para recibir, no enviar)
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const wsConfig: WebSocketConfig = {
    url: config.WEBSOCKET_URL,
    reconnectInterval: config.WEBSOCKET_RECONNECT_INTERVAL,
    maxReconnectAttempts: config.WEBSOCKET_MAX_RECONNECT_ATTEMPTS,
    heartbeatInterval: config.WEBSOCKET_HEARTBEAT_INTERVAL,
  };

  const {
    isConnected,
    isConnecting,
    error,
    reconnectAttempts,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    addEventListener,
    removeEventListener,
  } = useWebSocket(wsConfig);

  // No necesitamos funciones de envío - solo recibimos mensajes

  // Event listeners específicos
  const onMessage = useCallback((handler: WebSocketEventHandler) => {
    addEventListener('message', handler);
    return () => removeEventListener('message', handler);
  }, [addEventListener, removeEventListener]);

  const onChatUpdate = useCallback((handler: WebSocketEventHandler) => {
    addEventListener('chat_update', handler);
    return () => removeEventListener('chat_update', handler);
  }, [addEventListener, removeEventListener]);

  const onUserUpdate = useCallback((handler: WebSocketEventHandler) => {
    addEventListener('user_update', handler);
    return () => removeEventListener('user_update', handler);
  }, [addEventListener, removeEventListener]);

  const onNotification = useCallback((handler: WebSocketEventHandler) => {
    addEventListener('notification', handler);
    return () => removeEventListener('notification', handler);
  }, [addEventListener, removeEventListener]);

  const onError = useCallback((handler: WebSocketEventHandler) => {
    addEventListener('error', handler);
    return () => removeEventListener('error', handler);
  }, [addEventListener, removeEventListener]);

  const contextValue: WebSocketContextType = {
    // Estado
    isConnected,
    isConnecting,
    error,
    reconnectAttempts,
    lastMessage,

    // Funciones de control
    sendMessage,
    connect,
    disconnect,

    // Event listeners
    onMessage,
    onChatUpdate,
    onUserUpdate,
    onNotification,
    onError,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

