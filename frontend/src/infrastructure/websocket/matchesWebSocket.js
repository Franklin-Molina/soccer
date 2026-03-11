// src/infrastructure/websocket/matchesWebSocket.js
import { refreshToken } from '../api/api';

class MatchesWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const host = apiUrl.replace(/^https?:\/\//, '');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${host}/ws/matches/`;

    try {
      // Ya no enviamos el token manualmente; las cookies se envían automáticamente
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
      //  console.log('✅ Matches WebSocket conectado');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach(callback => callback(data));
        } catch (error) {
          console.error('❌ Error parseando mensaje de Matches WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Error en Matches WebSocket:', error);
      };

      this.ws.onclose = async (event) => {
        console.log(`🔌 Matches WebSocket desconectado (Código: ${event.code})`);
        
        // El backend de Channels podría cerrar con 4001 o 4003 si no hay cookie
        if (event.code === 4001 || event.code === 4003) {
          console.log('🔑 Sesión expirada. Intentando refrescar y reconectar a Matches...');
          const success = await refreshToken();
          if (success) {
            this.reconnectAttempts = 0;
            this.connect();
            return;
          }
        }

        if (event.code !== 1000 && event.code !== 1001) {
          this.handleReconnect();
        }
      };
    } catch (error) {
      console.error('❌ Excepción al conectar Matches WebSocket:', error);
      this.handleReconnect();
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`⏳ Reintentando conexión a Matches en ${this.reconnectDelay}ms...`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error('❌ Máximos intentos de reconexión Matches alcanzados. Redirigiendo...');
      window.location.href = '/';
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    
    // Retornar función para desuscribirse
    return () => {
      this.listeners.delete(callback);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Normal Closure');
      this.ws = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
     // console.warn('WebSocket is not connected. Cannot send message.');
    }
  }
}

// Exportar una instancia única (singleton)
export const matchesWebSocket = new MatchesWebSocket();
