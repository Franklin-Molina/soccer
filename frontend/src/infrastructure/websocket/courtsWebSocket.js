// src/infrastructure/websocket/courtsWebSocket.js
import { refreshToken } from '../api/api';

class CourtsWebSocket {
  constructor() {
    this.ws = null;
    this.courtId = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.reconnectTimeoutId = null;
    this.isIntentionalDisconnect = false;
    this.connecting = false;
  }

  async connect(courtId) {
    if (this.connecting) return;
    
    if (this.ws?.readyState === WebSocket.OPEN && this.courtId === courtId) {
      return;
    }

    this.isIntentionalDisconnect = false;

    if (this.ws) {
      this.ws.close();
    }

    this.connecting = true;
    this.courtId = courtId;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const host = apiUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    const wsUrl = courtId 
      ? `${wsProtocol}//${host}/ws/courts/${courtId}/`
      : `${wsProtocol}//${host}/ws/courts/`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.connecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach(callback => callback(data));
        } catch (error) {
          console.error('❌ Error parseando mensaje de Courts WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        this.connecting = false;
      };

      this.ws.onclose = async (event) => {
        this.connecting = false;
        
        if (this.isIntentionalDisconnect) {
          return;
        }

        if (event.code === 4001 || event.code === 4002 || event.code === 4003) {
          const success = await refreshToken();
          if (success) {
            this.reconnectAttempts = 0;
            this.connect(courtId);
            return;
          }
        }

        if (event.code !== 1000 && event.code !== 1001) {
          this.handleReconnect(courtId);
        }
      };
    } catch (error) {
      console.error('❌ Excepción al conectar Courts WebSocket:', error);
      this.connecting = false;
      this.handleReconnect(courtId);
    }
  }

  handleReconnect(courtId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.reconnectTimeoutId = setTimeout(() => this.connect(courtId), this.reconnectDelay);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  disconnect() {
    this.isIntentionalDisconnect = true;
    
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Normal Closure');
      this.ws = null;
      this.courtId = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
    this.connecting = false;
  }
}

export const courtsWebSocket = new CourtsWebSocket();
