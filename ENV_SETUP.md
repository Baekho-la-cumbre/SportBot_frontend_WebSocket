# 🚀 Configuración de Variables de Entorno

## 📋 **Variables Disponibles**

### **API Configuration**
- `VITE_API_BASE_URL`: URL base de la API (default: `http://localhost:8000`)
- `VITE_API_VERSION`: Versión de la API (default: `v1`)

### **WebSocket Configuration**
- `VITE_WEBSOCKET_URL`: URL del WebSocket (default: `ws://localhost:8000/ws`)
- `VITE_WEBSOCKET_RECONNECT_INTERVAL`: Intervalo de reconexión en ms (default: `3000`)
- `VITE_WEBSOCKET_MAX_RECONNECT_ATTEMPTS`: Máximo intentos de reconexión (default: `5`)
- `VITE_WEBSOCKET_HEARTBEAT_INTERVAL`: Intervalo de heartbeat en ms (default: `30000`)

### **App Configuration**
- `VITE_APP_NAME`: Nombre de la aplicación (default: `SportBot Frontend`)
- `VITE_APP_VERSION`: Versión de la aplicación (default: `1.0.0`)

## 🔧 **Configuración**

### **1. Crear archivo `.env`**
```bash
# En la raíz del proyecto
cp .env.example .env
```

### **2. Editar `.env`**
```env
# Desarrollo local
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1
VITE_WEBSOCKET_URL=ws://localhost:8000/ws/chat
VITE_WEBSOCKET_RECONNECT_INTERVAL=3000
VITE_WEBSOCKET_MAX_RECONNECT_ATTEMPTS=5
VITE_WEBSOCKET_HEARTBEAT_INTERVAL=30000

# Producción
# VITE_API_BASE_URL=https://api.tudominio.com
# VITE_API_VERSION=v1
# VITE_WEBSOCKET_URL=wss://api.tudominio.com/ws
```

### **3. Reiniciar el servidor**
```bash
npm run dev
```

## 🌍 **Entornos**

### **Desarrollo Local**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WEBSOCKET_URL=ws://localhost:8000/ws/chat
```

### **Staging**
```env
VITE_API_BASE_URL=https://staging-api.tudominio.com
VITE_WEBSOCKET_URL=wss://staging-api.tudominio.com/ws
```

### **Producción**
```env
VITE_API_BASE_URL=https://api.tudominio.com
VITE_WEBSOCKET_URL=wss://api.tudominio.com/ws
```

## ⚠️ **Importante**

- **Solo variables que empiecen con `VITE_`** son accesibles en el frontend
- **Reiniciar el servidor** después de cambiar `.env`
- **No committear** el archivo `.env` (ya está en `.gitignore`)
- **Usar `.env.example`** como plantilla para el equipo

## 🔍 **Uso en el Código**

```typescript
import { config } from './config';
import { useWebSocketContext } from './contexts/WebSocketContext';

// Usar endpoints HTTP
const response = await fetch(config.USERS_ENDPOINT);
const response = await fetch(config.ADMIN_CHATS_ENDPOINT);
const response = await fetch(`${config.CHAT_SUMMARY_ENDPOINT}/${chatId}/summary`);

// Usar WebSocket
const { sendMessage, isConnected, onMessage } = useWebSocketContext();

// Enviar mensaje por WebSocket
sendMessage({
  type: 'message',
  data: { message: 'Hola', userId: 123 },
  timestamp: new Date().toISOString()
});

// Escuchar mensajes
onMessage((message) => {
  console.log('Mensaje recibido:', message);
});

// Usar configuración
console.log(config.APP_NAME, config.APP_VERSION);
console.log('WebSocket URL:', config.WEBSOCKET_URL);
```
