import { useContext } from 'react';
import { WebSocketContext } from '../contexts/WebSocketContext';

// Hook para usar el contexto WebSocket
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext debe ser usado dentro de un WebSocketProvider');
  }
  return context;
};

// Hook para obtener solo el estado de conexión (más ligero)
export const useWebSocketStatus = () => {
  const { isConnected, isConnecting, error, reconnectAttempts } = useWebSocketContext();
  return { isConnected, isConnecting, error, reconnectAttempts };
};
