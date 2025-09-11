# 📡 Formato de Mensajes WebSocket - Backend

## 🎯 **Problema Actual**

El frontend está recibiendo mensajes del backend, pero:
- ❌ **Solo muestra mensajes del bot** (no del usuario)
- ❌ **Claves duplicadas** en React
- ❌ **No filtra por tiempo** correctamente

## ✅ **Solución: Formato JSON Estructurado**

Para que el frontend funcione correctamente, el backend debe enviar mensajes en formato JSON estructurado:

### **Formato Requerido:**

```json
{
  "type": "message",
  "data": {
    "message": "texto del mensaje",
    "isUser": true
  },
  "timestamp": "2024-01-01T10:30:00Z",
  "userId": 123
}
```

### **Campos Explicados:**

- **`type`**: Tipo de mensaje (siempre "message" para mensajes de chat)
- **`data.message`**: El texto del mensaje
- **`data.isUser`**: `true` si es del usuario, `false` si es del bot
- **`timestamp`**: Fecha y hora en formato ISO (ej: "2024-01-01T10:30:00Z")
- **`userId`**: ID del usuario que envía/recibe el mensaje

## 🔧 **Implementación en el Backend**

### **Ejemplo en Python (FastAPI):**

```python
import json
from datetime import datetime

@ws_router.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            # Recibir mensaje del usuario
            user_message = await websocket.receive_text()
            
            # IMPORTANTE: Enviar mensaje del usuario al frontend PRIMERO
            user_msg = {
                "type": "message",
                "data": {
                    "message": user_message,
                    "isUser": True
                },
                "timestamp": datetime.now().isoformat() + "Z",
                "userId": 123  # ID del usuario actual
            }
            
            # Enviar mensaje del usuario al frontend
            await websocket.send_text(json.dumps(user_msg))
            
            # Procesar con el bot
            bot_response = await langroid_service.process_message(message=user_message)
            
            # Crear mensaje del bot
            bot_msg = {
                "type": "message",
                "data": {
                    "message": bot_response,
                    "isUser": False
                },
                "timestamp": datetime.now().isoformat() + "Z",
                "userId": 123  # Mismo usuario
            }
            
            # Enviar respuesta del bot al frontend
            await websocket.send_text(json.dumps(bot_msg))
            
    except WebSocketDisconnect:
        logger.info("WebSocket desconectado")
```

### **⚠️ PROBLEMA ACTUAL:**

El backend actual solo envía respuestas del bot, pero **NO envía los mensajes del usuario**. Por eso el frontend solo muestra mensajes del bot.

### **✅ SOLUCIÓN:**

El backend debe enviar **AMBOS** tipos de mensajes:
1. **Mensaje del usuario** (cuando el usuario envía algo)
2. **Respuesta del bot** (cuando el bot responde)

## 📊 **Flujo Completo:**

1. **Usuario envía mensaje** → Backend recibe texto
2. **Backend envía mensaje del usuario** → Frontend muestra mensaje del usuario
3. **Backend procesa con bot** → Obtiene respuesta
4. **Backend envía respuesta del bot** → Frontend muestra respuesta del bot

## 🎨 **Resultado en el Frontend:**

- ✅ **Mensajes del usuario** aparecen a la derecha (azul)
- ✅ **Mensajes del bot** aparecen a la izquierda (gris)
- ✅ **Sin claves duplicadas** (IDs únicos)
- ✅ **Filtro por tiempo** (solo mensajes más recientes)
- ✅ **Actualización en tiempo real**

## 🔍 **Debugging:**

En la consola del navegador verás:

```
Mensaje WebSocket recibido: {type: "message", data: {...}}
Comparando tiempos:
- Último mensaje: 2024-01-01T10:30:00Z (1704112200000)
- Nuevo mensaje: 2024-01-01T10:31:00Z (1704112260000)
- Es más reciente: true
Agregando mensaje al chat del usuario 123: {id: ..., message: "..."}
```

## ⚠️ **Importante:**

- **NO enviar texto simple** (como actualmente)
- **SÍ enviar JSON estructurado** (como se muestra arriba)
- **Incluir timestamp real** del mensaje
- **Especificar isUser correctamente**
- **Incluir userId** para identificar el chat

Con este formato, el frontend funcionará perfectamente y mostrará tanto mensajes del usuario como del bot en tiempo real.
