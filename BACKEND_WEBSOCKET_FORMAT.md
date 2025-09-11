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

## 🔧 **Implementación Simplificada en el Backend**

### **Nuevo Comportamiento (Simplificado):**

El WebSocket ahora funciona como un **detector de cambios**. Solo necesita enviar una notificación cuando hay cambios en el chat.

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
            
            # Procesar con el bot
            bot_response = await langroid_service.process_message(message=user_message)
            
            # IMPORTANTE: Solo enviar notificación de cambio
            change_notification = {
                "type": "chat_update",
                "data": {
                    "message": "Chat actualizado",
                    "timestamp": datetime.now().isoformat()
                },
                "timestamp": datetime.now().isoformat() + "Z",
                "userId": 123  # ID del usuario actual
            }
            
            # Enviar notificación de cambio al frontend
            await websocket.send_text(json.dumps(change_notification))
            
    # Ejemplo para notificar usuarios nuevos
    async def notify_new_user(user_id: int):
        user_notification = {
            "type": "user_update",
            "data": {
                "message": "Usuario nuevo registrado",
                "timestamp": datetime.now().isoformat()
            },
            "timestamp": datetime.now().isoformat() + "Z",
            "userId": user_id
        }
        
        # Enviar notificación de usuario nuevo
        await websocket.send_text(json.dumps(user_notification))
        
    # IMPORTANTE: También puedes enviar texto simple que contenga palabras clave
    # El frontend detectará automáticamente si es sobre usuarios:
    await websocket.send_text("Usuario nuevo registrado")
    # O también:
    await websocket.send_text("Nuevo user en el sistema")
            
    except WebSocketDisconnect:
        logger.info("WebSocket desconectado")
```

### **✅ CÓMO FUNCIONA AHORA:**

#### **Para cambios en el chat:**
1. **Usuario envía mensaje** → Backend procesa
2. **Backend envía notificación** → Frontend detecta cambio
3. **Frontend recarga chat** → Muestra todos los mensajes actualizados
4. **Sin duplicados** → Solo recarga completa del chat

#### **Para cambios en los usuarios:**
1. **Nuevo usuario se registra** → Backend procesa
2. **Backend envía notificación** → Frontend detecta cambio
3. **Frontend recarga usuarios** → Muestra todos los usuarios actualizados
4. **Usuarios nuevos aparecen** → Sin necesidad de recargar la página
5. **Debouncing aplicado** → Evita bucles infinitos y mejora performance

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
- ✅ **Usuarios nuevos** aparecen automáticamente
- ✅ **Debouncing inteligente** evita bucles infinitos
- ✅ **Indicadores visuales** para mensajes y usuarios nuevos

## 🔍 **Debugging:**

En la consola del navegador verás:

```
// Para mensajes nuevos:
Mensaje WebSocket recibido: {type: "chat_update", data: {...}}
🔄 Cambio detectado en el chat, recargando con debouncing...
✅ Ejecutando refresh de chats...
🔄 Recargando chat del usuario 1

// Para usuarios nuevos:
Mensaje WebSocket recibido: {type: "user_update", data: {...}}
👤 Cambio detectado en los usuarios, recargando con debouncing...
✅ Ejecutando refresh de usuarios...
```

## 🧠 **Detección Automática de Tipos de Mensaje**

El frontend ahora puede detectar automáticamente el tipo de mensaje basándose en el contenido:

### **Para usuarios nuevos:**
- Si el mensaje contiene: `"usuario"`, `"user"`, o `"nuevo"`
- Se procesará como `user_update`
- Ejemplos: `"Usuario nuevo registrado"`, `"Nuevo user"`, `"Usuario actualizado"`

### **Para chats:**
- Cualquier otro mensaje se procesará como `chat_update`
- Ejemplos: `"Chat actualizado"`, `"Mensaje nuevo"`, `"Conversación actualizada"`

## ⚠️ **Importante:**

- **Puedes enviar JSON estructurado** (recomendado para mejor control)
- **O texto simple** (el frontend lo detectará automáticamente)
- **Incluir timestamp real** del mensaje
- **Especificar isUser correctamente**
- **Incluir userId** para identificar el chat

Con este formato, el frontend funcionará perfectamente y mostrará tanto mensajes del usuario como del bot en tiempo real, además de detectar usuarios nuevos automáticamente.
