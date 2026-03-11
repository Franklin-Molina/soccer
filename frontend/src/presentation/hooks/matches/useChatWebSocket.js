import { useEffect, useCallback } from 'react';
import { refreshToken } from '../../../infrastructure/api/api';
// IMPORTANTE: Ajusta esta ruta según la ubicación real de tu AuthContext
import { useAuth } from '../../context/AuthContext.jsx'; 

class ChatWebSocket {
  constructor() {
    this.ws = null;
    this.matchId = null;
    this.listeners = [];
    this.connecting = false;
    
    // Variables de control anti-bucles (como en los otros WS)
    this.reconnectTimeoutId = null;
    this.isIntentionalDisconnect = false;
  }

  async connect(matchId) {
    if (this.connecting) return;
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.matchId === matchId) {
      return;
    }

    // Bajamos la bandera al intentar conectar
    this.isIntentionalDisconnect = false;

    if (this.ws) {
      this.ws.close();
    }

    this.connecting = true;
    this.matchId = matchId;

    const wsBaseUrl = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsHost = apiUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsBaseUrl}//${wsHost}/ws/chat/${matchId}/`;

    try {
      // Magia de las cookies HttpOnly: el navegador las envía solas, 
      // ya no pasamos el token por la URL ni por subprotocolos.
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.connecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            this.listeners.forEach(callback => callback(data));
        } catch (error) {
            console.error('❌ Error parseando mensaje Chat WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        this.connecting = false;
      };

      this.ws.onclose = async (event) => {
        this.connecting = false;
        
        // 🛑 Freno de emergencia: Si el usuario cerró sesión, no reconectar
        if (this.isIntentionalDisconnect) {
          return;
        }
        
        // Códigos 4001, 4002, 4003 indican problemas de sesión en Channels
        if (event.code === 4001 || event.code === 4002 || event.code === 4003) {
          console.log('🔑 Sesión expirada en chat. Intentando refrescar...');
          const success = await refreshToken();
          if (success) {
            this.connect(matchId);
            return;
          }
        }

        // Si fue una caída de red, reintentar en 3 segundos
        if (event.code !== 1000 && event.code !== 1001) {
          this.reconnectTimeoutId = setTimeout(() => this.connect(matchId), 3000);
        }
      };
    } catch (error) {
        this.connecting = false;
        if (!this.isIntentionalDisconnect) {
            this.reconnectTimeoutId = setTimeout(() => this.connect(matchId), 3000);
        }
    }
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ message }));
    }
  }

  sendTyping(isTyping) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'typing', is_typing: isTyping }));
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    // 🛑 Activamos bandera y destruimos temporizadores
    this.isIntentionalDisconnect = true;
    
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Normal Closure');
      this.ws = null;
      this.matchId = null;
    }
    
    this.listeners = [];
    this.connecting = false;
  }
}

// 🛑 IMPORTANTE: Exportamos la instancia para poder apagarla desde el AuthContext
export const chatWebSocket = new ChatWebSocket();

export const useChatWebSocket = (matchId, onMessage) => {
  const { isAuthenticated } = useAuth(); // Integramos tu validación global

  useEffect(() => {
    // Si no hay ID de partido o el usuario NO tiene sesión, bloqueamos la conexión
    if (!matchId || !isAuthenticated) return;

    chatWebSocket.connect(matchId);
    
    const unsubscribe = chatWebSocket.subscribe(onMessage);

    return () => {
      unsubscribe();
    };
  }, [matchId, onMessage, isAuthenticated]);

  const sendMessage = useCallback((message) => {
    chatWebSocket.sendMessage(message);
  }, []);

  const sendTyping = useCallback((isTyping) => {
    chatWebSocket.sendTyping(isTyping);
  }, []);

  return { sendMessage, sendTyping };
};