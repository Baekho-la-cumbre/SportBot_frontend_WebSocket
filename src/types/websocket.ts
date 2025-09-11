// Tipos TypeScript para WebSocket
export interface WebSocketMessage {
  type: 'message' | 'notification' | 'chat_update' | 'user_update' | 'error' | 'ping' | 'pong';
  data: MessageData | NotificationData | ChatUpdateData | UserUpdateData | ErrorData | PingData | PongData;
  timestamp: string;
  userId?: number;
  chatId?: string;
}

// Tipos específicos para cada tipo de mensaje
export interface MessageData {
  message: string;
  isUser: boolean;
}

export interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ChatUpdateData {
  chatId: string;
  ultimoMensaje: string;
  totalMensajes: number;
  usuarioId: number;
}

export interface UserUpdateData {
  id: number;
  username?: string;
  nombre?: string;
  name?: string;
  telefono?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface ErrorData {
  code: string;
  message: string;
}

export interface PingData {
  timestamp: string;
}

export interface PongData {
  timestamp: string;
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
