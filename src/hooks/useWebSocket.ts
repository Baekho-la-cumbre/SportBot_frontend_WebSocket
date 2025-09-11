import { useState, useEffect, useRef, useCallback } from 'react';
import type { WebSocketMessage, WebSocketConfig, WebSocketState, WebSocketEventHandler } from '../types/websocket';

interface UseWebSocketReturn extends WebSocketState {
  sendMessage: (message: WebSocketMessage) => void;
  connect: () => void;
  disconnect: () => void;
  addEventListener: (eventType: string, handler: WebSocketEventHandler) => void;
  removeEventListener: (eventType: string, handler: WebSocketEventHandler) => void;
}

export const useWebSocket = (config: WebSocketConfig): UseWebSocketReturn => {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
    lastMessage: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventHandlersRef = useRef<Map<string, WebSocketEventHandler[]>>(new Map());

  const {
    url,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000,
  } = config;

  // Función para limpiar timeouts
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Función para enviar heartbeat
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const pingMessage: WebSocketMessage = {
        type: 'ping',
        data: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString(),
      };
      wsRef.current.send(JSON.stringify(pingMessage));
    }
  }, []);

  // Función para iniciar heartbeat
  const startHeartbeat = useCallback(() => {
    clearTimeouts();
    heartbeatTimeoutRef.current = setTimeout(() => {
      sendHeartbeat();
      startHeartbeat(); // Programar el siguiente heartbeat
    }, heartbeatInterval);
  }, [heartbeatInterval, sendHeartbeat, clearTimeouts]);

  // Función para manejar mensajes recibidos
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      let message: WebSocketMessage;
      
      // Intentar parsear como JSON primero
      try {
        message = JSON.parse(event.data);
      } catch {
        // Si no es JSON, asumir que es una notificación de cambio
        message = {
          type: 'chat_update',
          data: {
            message: 'Chat actualizado',
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString(),
          userId: 1, // Usuario por defecto
        };
      }
      
      console.log('Mensaje WebSocket procesado:', message);
      
      setState(prev => ({
        ...prev,
        lastMessage: message,
        error: null,
      }));

      // Manejar pong automáticamente
      if (message.type === 'pong') {
        return;
      }

      // Ejecutar handlers registrados
      const handlers = eventHandlersRef.current.get(message.type) || [];
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error en handler para ${message.type}:`, error);
        }
      });

      // Ejecutar handlers para 'message' (todos los mensajes)
      const allHandlers = eventHandlersRef.current.get('message') || [];
      allHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error en handler general:', error);
        }
      });

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      setState(prev => ({
        ...prev,
        error: 'Error al procesar mensaje del servidor',
      }));
    }
  }, []);

  // Función para conectar
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket conectado');
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0,
        }));
        startHeartbeat();
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = (event) => {
        console.log('WebSocket desconectado:', event.code, event.reason);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));
        clearTimeouts();

        // Solo intentar reconectar si no fue un cierre intencional Y el backend está disponible
        if (event.code !== 1000 && event.code !== 1006 && state.reconnectAttempts < maxReconnectAttempts) {
          setState(prev => ({
            ...prev,
            reconnectAttempts: prev.reconnectAttempts + 1,
          }));

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Intentando reconectar... (${state.reconnectAttempts + 1}/${maxReconnectAttempts})`);
            connect();
          }, reconnectInterval);
        } else if (event.code === 1006) {
          // Error 1006: Backend no disponible, no intentar reconectar
          setState(prev => ({
            ...prev,
            error: 'Backend no disponible - Verifica que el servidor esté corriendo',
          }));
        } else if (state.reconnectAttempts >= maxReconnectAttempts) {
          setState(prev => ({
            ...prev,
            error: 'No se pudo reconectar después de múltiples intentos',
          }));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        setState(prev => ({
          ...prev,
          isConnecting: false,
          error: 'Error de conexión WebSocket',
        }));
      };

    } catch (error) {
      console.error('Error al crear WebSocket:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Error al crear conexión WebSocket',
      }));
    }
  }, [url, reconnectInterval, maxReconnectAttempts, state.reconnectAttempts, handleMessage, startHeartbeat, clearTimeouts]);

  // Función para desconectar
  const disconnect = useCallback(() => {
    clearTimeouts();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Desconexión intencional');
      wsRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0,
    }));
  }, [clearTimeouts]);

  // Función para enviar mensaje (solo para ping/heartbeat)
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        // Solo enviamos ping para mantener la conexión viva
        if (message.type === 'ping') {
          wsRef.current.send(JSON.stringify(message));
        }
        // No enviamos otros tipos de mensajes - solo recibimos
      } catch (error) {
        console.error('Error enviando ping:', error);
        setState(prev => ({
          ...prev,
          error: 'Error al enviar ping',
        }));
      }
    } else {
      console.warn('WebSocket no está conectado');
      setState(prev => ({
        ...prev,
        error: 'No se puede enviar ping: WebSocket desconectado',
      }));
    }
  }, []);

  // Función para agregar event listener
  const addEventListener = useCallback((eventType: string, handler: WebSocketEventHandler) => {
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, []);
    }
    eventHandlersRef.current.get(eventType)!.push(handler);
  }, []);

  // Función para remover event listener
  const removeEventListener = useCallback((eventType: string, handler: WebSocketEventHandler) => {
    const handlers = eventHandlersRef.current.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }, []);

  // Conectar automáticamente al montar
  useEffect(() => {
    connect();

    // Cleanup al desmontar
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    sendMessage,
    connect,
    disconnect,
    addEventListener,
    removeEventListener,
  };
};
