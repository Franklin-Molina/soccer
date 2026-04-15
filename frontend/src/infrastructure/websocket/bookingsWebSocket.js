import { refreshToken } from '../api/api';

class BookingsWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    
    // NUEVAS VARIABLES DE CONTROL
    this.reconnectTimeoutId = null; 
    this.isIntentionalDisconnect = false; 
  }

  async connect() {
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) return;

    // Al intentar conectar, bajamos la bandera de desconexión intencional
    this.isIntentionalDisconnect = false;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const host = apiUrl.replace(/^https?:\/\//, '');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${host}/ws/bookings/`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach(callback => callback(data));
        } catch (error) {
       //   console.error('❌ Error parseando mensaje de Booking WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
       // console.error('❌ Error en Booking WebSocket:', error);
      };

      this.ws.onclose = async (event) => {
      //  console.log(`🔌 Booking WebSocket desconectado (Código: ${event.code})`);
        
        // 1. Si la desconexión es intencional, no hacemos nada.
        if (this.isIntentionalDisconnect) {
          return;
        }

        // 2. Si hay un fallo de autenticación (4001), intentamos refrescar token.
        // Pero si falla el refresco, seguimos intentando conectar como anónimo.
        if (event.code === 4001 || event.code === 4003) {
          const success = await refreshToken();
          if (success) {
            this.reconnectAttempts = 0;
            this.connect();
            return;
          }
          // Si no se pudo refrescar, no redirigimos; permitimos que el flujo continúe 
          // a handleReconnect para intentar conectar de nuevo (que podría ser anónimo)
        }

        // 3. Reintentar conexión para otros códigos de error
        if (event.code !== 1000 && event.code !== 1001) {
          this.handleReconnect();
        }
      };
    } catch (error) {
    //  console.error('❌ Excepción al conectar WebSocket:', error);
      this.handleReconnect();
    }
  }

  handleReconnect() {
    // 🛑 NUEVO: Guardia extra de seguridad
    if (this.isIntentionalDisconnect) return;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
   //   console.log(`⏳ Reintentando conexión en ${this.reconnectDelay}ms...`);
      
      // 🛑 NUEVO: Guardamos el ID del timeout para poder destruirlo después
      this.reconnectTimeoutId = setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
    //  console.error('❌ Máximos intentos de reconexión alcanzados. Redirigiendo...');
      window.location.href = '/';
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  disconnect() {
    // 🛑 NUEVO: Activamos la bandera
    this.isIntentionalDisconnect = true;

    // 🛑 NUEVO: Destruimos el temporizador si estaba contando
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Normal Closure');
      this.ws = null;
    }
    
    this.listeners.clear();
    this.reconnectAttempts = 0; // Reiniciamos los intentos por si entra otro usuario
  }
}

export const bookingsWebSocket = new BookingsWebSocket();
