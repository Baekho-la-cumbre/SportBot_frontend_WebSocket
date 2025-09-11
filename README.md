# 🏈 SportBot Frontend - WebSocket Implementation

Frontend React con TypeScript para el asistente comercial SportBot, implementando conexión WebSocket persistente para comunicación en tiempo real con el backend.

## 🚀 **Características**

- ✅ **React 19** con TypeScript
- ✅ **WebSocket persistente** con reconexión automática
- ✅ **Mensajes en tiempo real** (solo recepción)
- ✅ **Heartbeat/ping-pong** para mantener conexión viva
- ✅ **Manejo robusto de errores** y reconexión
- ✅ **Indicador visual** del estado de conexión
- ✅ **Tailwind CSS** para estilos modernos
- ✅ **Vite** para desarrollo rápido

## 🔌 **WebSocket Features**

- **Conexión persistente** con el backend
- **Reconexión automática** en caso de caída
- **Sistema de heartbeat** para mantener la conexión viva
- **Manejo de eventos** específicos por tipo de mensaje
- **Context global** para estado WebSocket
- **Hooks personalizados** para fácil integración

## 🛠️ **Instalación y Configuración**

### **1. Instalar dependencias**
```bash
npm install
```

### **2. Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar configuración
# Ver ENV_SETUP.md para más detalles
```

### **3. Iniciar desarrollo**
```bash
npm run dev
```

### **4. Build para producción**
```bash
npm run build
```

## 📡 **Configuración WebSocket**

### **Variables de entorno requeridas:**
```env
VITE_WEBSOCKET_URL=ws://localhost:8000/ws/chat
VITE_WEBSOCKET_RECONNECT_INTERVAL=3000
VITE_WEBSOCKET_MAX_RECONNECT_ATTEMPTS=5
VITE_WEBSOCKET_HEARTBEAT_INTERVAL=30000
```

### **Uso básico:**
```typescript
import { useWebSocketContext } from './hooks/useWebSocketContext';

const MyComponent = () => {
  const { isConnected, onMessage } = useWebSocketContext();
  
  // Escuchar mensajes en tiempo real
  onMessage((message) => {
    console.log('Mensaje recibido:', message);
    // Actualizar UI con nuevos mensajes
  });
  
  return <div>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</div>;
};
```

## 📚 **Documentación**

- **[ENV_SETUP.md](./ENV_SETUP.md)** - Configuración de variables de entorno
- **[WEBSOCKET_IMPLEMENTATION.md](./WEBSOCKET_IMPLEMENTATION.md)** - Documentación completa de WebSocket
- **[WEBSOCKET_TEST_GUIDE.md](./WEBSOCKET_TEST_GUIDE.md)** - Guía de pruebas y solución de problemas

## 🏗️ **Arquitectura**

```
src/
├── components/          # Componentes React
├── contexts/           # Context providers (WebSocket)
├── hooks/              # Hooks personalizados
├── types/              # Tipos TypeScript
├── config.ts           # Configuración centralizada
└── App.tsx             # Componente principal
```

## 🔧 **Scripts disponibles**

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm run lint` - Linter ESLint
