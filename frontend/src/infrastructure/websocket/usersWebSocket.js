import { refreshToken } from '../api/api';

class UsersWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.baseReconnectDelay = 3000;
    this.isConnecting = false;
  }

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return;
    if (this.isConnecting) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const host = apiUrl.replace(/^https?:\/\//, '');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${host}/ws/users/`;

    try {
      console.log(`🔌 Conectando a Users WebSocket (intento ${this.reconnectAttempts + 1})...`);
      this.isConnecting = true;
      // Ya no enviamos el token manualmente; las cookies se envían automáticamente
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ Users WebSocket conectado');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach(callback => callback(data));
        } catch (error) {
          console.error('❌ Error parseando mensaje de Users WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Error en Users WebSocket:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = async (event) => {
        this.isConnecting = false;
        console.log(`🔌 Users WebSocket desconectado (Código: ${event.code})`);
        
        // El backend de Channels podría cerrar con 4001 o 4003 si no hay cookie
        if (event.code === 4001 || event.code === 4003) {
          console.log('🔑 Sesión expirada. Intentando refrescar y reconectar a Users...');
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
      this.isConnecting = false;
      console.error('❌ Excepción al conectar Users WebSocket:', error);
      this.handleReconnect();
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      // Backoff exponencial: 3s, 6s, 12s, 24s, 48s
      const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`⏳ Reintentando conexión a Users en ${delay}ms...`);
      setTimeout(() => this.connect(), delay);
    } else {
      console.error('❌ Máximos intentos de reconexión Users alcanzados. Redirigiendo...');
      window.location.href = '/';
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Normal Closure');
      this.ws = null;
    }
    this.listeners.clear();
  }
}

export const usersWebSocket = new UsersWebSocket();
