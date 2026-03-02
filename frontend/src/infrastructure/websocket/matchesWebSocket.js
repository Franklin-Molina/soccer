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
    // 1. Obtención de tokens frescos: Siempre intentamos refrescar/obtener el más reciente
    let token = await refreshToken();
    
    // Si no hay token después del refresh, intentamos el de localStorage como respaldo
    if (!token) {
      token = localStorage.getItem('accessToken');
    }

    // 2. Validación de tokens: Verificar que exista un token válido antes de conectar
    if (!token) {
    //  console.warn('⚠️ No se encontró un token válido para Matches WebSocket. Abortando.');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const host = apiUrl.replace(/^https?:\/\//, '');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${host}/ws/matches/`;

    try {
     // console.log(`🔌 Conectando a Matches WebSocket (intento ${this.reconnectAttempts + 1})...`);
      this.ws = new WebSocket(wsUrl, [token]);

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
        
        // Si el código es 4001, el token probablemente expiró
        if (event.code === 4001) {
          console.log('🔑 Token expirado (4001). Intentando refrescar y reconectar a Matches...');
          const newToken = await refreshToken();
          if (newToken) {
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
      // 3 & 4. Limpieza de tokens y Fuerza de nuevo inicio de sesión
      console.error('❌ Máximos intentos de reconexión Matches alcanzados. Limpiando tokens...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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
