import { refreshToken } from '../api/api';

class BookingsWebSocket {
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
      console.warn('⚠️ No se encontró un token válido. Abortando conexión WebSocket.');
      return;
    }

    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const host = apiUrl.replace(/^https?:\/\//, '');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${host}/ws/bookings/`;

    try {
    //  console.log(`🔌 Intentando conectar a WebSocket (intento ${this.reconnectAttempts + 1})...`);
      this.ws = new WebSocket(wsUrl, [token]);

      this.ws.onopen = () => {
      //  console.log('✅ Booking WebSocket conectado');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach(callback => callback(data));
        } catch (error) {
          console.error('❌ Error parseando mensaje de Booking WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Error en Booking WebSocket:', error);
      };

      this.ws.onclose = async (event) => {
        console.log(`🔌 Booking WebSocket desconectado (Código: ${event.code})`);
        
        // Si el código es 4001, el token probablemente expiró
        if (event.code === 4001) {
          console.log('🔑 Token expirado (4001). Intentando refrescar y reconectar...');
          const newToken = await refreshToken();
          if (newToken) {
            this.reconnectAttempts = 0;
            this.connect();
            return;
          }
        }

        // No reintentar si el cierre fue normal
        if (event.code !== 1000 && event.code !== 1001) {
          this.handleReconnect();
        }
      };
    } catch (error) {
      console.error('❌ Excepción al conectar WebSocket:', error);
      this.handleReconnect();
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`⏳ Reintentando conexión en ${this.reconnectDelay}ms...`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      // 3 & 4. Limpieza de tokens y Fuerza de nuevo inicio de sesión
      console.error('❌ Máximos intentos de reconexión alcanzados. Limpiando tokens y redirigiendo...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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

export const bookingsWebSocket = new BookingsWebSocket();
