// src/infrastructure/websocket/matchesWebSocket.js
class MatchesWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  connect(token) {
    if (this.ws?.readyState === WebSocket.OPEN) {
     // console.log('WebSocket already connected');
      return;
    }

    // Construir URL del WebSocket dinámicamente usando la IP de red si está configurada
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const host = apiUrl.replace(/^https?:\/\//, '');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${host}/ws/matches/`;

    try {
      // Pasamos el token como un "subprotocolo" (Sec-WebSocket-Protocol)
      // para evitar exponerlo en la URL.
      this.ws = new WebSocket(wsUrl, [token]);

      this.ws.onopen = () => {
       // console.log('✅ WebSocket connected to matches');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
         // console.log('📨 WebSocket message received:', data);
          
          // Notificar a todos los listeners
          this.listeners.forEach(callback => callback(data));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
       // console.error('❌ WebSocket error:', error);
      };

      this.ws.onclose = (event) => {
     //   console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        // Evitar reconexión infinita si se cerró intencionalmente
        if (event.code !== 1000 && event.code !== 1001) {
          this.handleReconnect(token);
        }
      };
    } catch (error) {
     // console.error('Error creating WebSocket:', error);
      this.handleReconnect(token);
    }
  }

  handleReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect(token);
      }, this.reconnectDelay);
    } else {
      console.error('❌ Max reconnection attempts reached');
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
