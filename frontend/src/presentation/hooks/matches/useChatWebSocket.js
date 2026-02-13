import { useEffect, useCallback, useRef } from 'react';
import { refreshToken } from '../../../infrastructure/api/api';

class ChatWebSocket {
  constructor() {
    this.ws = null;
    this.matchId = null;
    this.listeners = [];
    this.connecting = false;
  }

  async connect(matchId) {
    if (this.connecting) return;
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.matchId === matchId) {
      return;
    }

    if (this.ws) {
      this.ws.close();
    }

    this.connecting = true;
    this.matchId = matchId;
    
    // Validar y refrescar token antes de conectar
    let token = localStorage.getItem('accessToken');

    // Si no hay token, no intentar conectar
    if (!token || token === 'null' || token === 'undefined') {
     // console.warn("⛔ No hay token disponible. Deteniendo intento de conexión WS.");
      this.connecting = false;
      return;
    }
    
    // Intentamos refrescar siempre para asegurar token fresco al conectar WebSocket
    // o podrías decodificar el JWT para ver si expiró. Por simplicidad, refrescamos.
    try {
      const newToken = await refreshToken();
      if (newToken) {
        token = newToken;
      }
    } catch (error) {
      // console.error("Error refreshing token for WebSocket:", error);
      // Si falla el refresco, seguimos con el token actual o fallará la conexión
    }

    const wsBaseUrl = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsHost = apiUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsBaseUrl}//${wsHost}/ws/chat/${matchId}/`;

    //console.log(`Intentando conectar a WebSocket: ${wsUrl}`);
    // Pasamos el token como un subprotocolo para evitar exponerlo en la URL
    this.ws = new WebSocket(wsUrl, [token]);

    this.ws.onopen = () => {
      this.connecting = false;
    //  console.log(`✅ Chat WebSocket conectado al match ${matchId}`);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
    this.listeners.forEach(callback => callback(data));
  };

  this.ws.onerror = (error) => {
      this.connecting = false;
    //  console.error('❌ Error Chat WebSocket:', error);
    };

    this.ws.onclose = (event) => {
      this.connecting = false;
     // console.log(`🔌 Chat WebSocket desconectado del match ${matchId}. Código: ${event.code}`);
      
      // Si el código es 4001 (No valid user) o similar, forzar refresco total antes de reintentar
      if (event.code === 4001 || event.code === 4002) {
        // console.log('🔑 Token inválido detectado. Intentando refrescar y reconectar...');
        setTimeout(() => this.connect(matchId), 2000);
        return;
      }

      if (event.code !== 1000 && event.code < 4000) {
       // console.log('🔄 Intentando reconectar chat...');
        setTimeout(() => this.connect(matchId), 3000);
      }
    };
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
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.matchId = null;
    }
  }
}

const chatWebSocket = new ChatWebSocket();

export const useChatWebSocket = (matchId, onMessage) => {
  useEffect(() => {
    if (!matchId) return;

    chatWebSocket.connect(matchId);
    const unsubscribe = chatWebSocket.subscribe(onMessage);

    return () => {
      unsubscribe();
    };
  }, [matchId, onMessage]);

  const sendMessage = useCallback((message) => {
    chatWebSocket.sendMessage(message);
  }, []);

  const sendTyping = useCallback((isTyping) => {
    chatWebSocket.sendTyping(isTyping);
  }, []);

  return { sendMessage, sendTyping };
};
