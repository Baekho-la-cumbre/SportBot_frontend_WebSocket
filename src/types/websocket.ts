// Tipos TypeScript para WebSocket
export interface WebSocketMessage {
  type: 'message' | 'notification' | 'chat_update' | 'user_update' | 'error' | 'ping' | 'pong';
  data: any;
  timestamp: string;
  userId?: number;
  chatId?: string;
}

export interface ChatMessage {
  id: number;
  message: string;
  timestamp: string;
  isUser: boolean;
  chatId?: string;
  userId?: number;
}

export interface UserUpdate {
  id: number;
  username?: string;
  nombre?: string;
  name?: string;
  telefono?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface ChatUpdate {
  id: number;
  chatId: string;
  ultimoMensaje: string;
  totalMensajes: number;
  usuarioId: number;
  fechaCreacion: string;
  fechaActualizcion: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastMessage: WebSocketMessage | null;
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;
