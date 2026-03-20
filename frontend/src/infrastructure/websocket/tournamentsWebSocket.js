// src/infrastructure/websocket/tournamentsWebSocket.js
import { refreshToken } from '../api/api';

class TournamentsWebSocket {
  constructor() {
    this.ws = null;
    this.tournamentId = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.reconnectTimeoutId = null;
    this.isIntentionalDisconnect = false;
    this.connecting = false;
  }

  async connect(tournamentId) {
    if (this.connecting) return;
    
    if (this.ws?.readyState === WebSocket.OPEN && this.tournamentId === tournamentId) {
      return;
    }

    // Bajamos la bandera al intentar conectar
    this.isIntentionalDisconnect = false;

    if (this.ws) {
      this.ws.close();
    }

    this.connecting = true;
    this.tournamentId = tournamentId;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const host = apiUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${host}/ws/tournaments/${tournamentId}/`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // console.log(`✅ Tournaments WebSocket conectado al torneo ${tournamentId}`);
        this.reconnectAttempts = 0;
        this.connecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach(callback => callback(data));
        } catch (error) {
          console.error('❌ Error parseando mensaje de Tournaments WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        // console.error('❌ Error en Tournaments WebSocket:', error);
        this.connecting = false;
      };

      this.ws.onclose = async (event) => {
        this.connecting = false;
        
        if (this.isIntentionalDisconnect) {
          return;
        }

        // console.log(`🔌 Tournaments WebSocket desconectado (Código: ${event.code})`);
        
        if (event.code === 4001 || event.code === 4002 || event.code === 4003) {
          // console.log('🔑 Sesión expirada. Intentando refrescar y reconectar a Tournaments...');
          const success = await refreshToken();
          if (success) {
            this.reconnectAttempts = 0;
            this.connect(tournamentId);
            return;
          }
        }

        if (event.code !== 1000 && event.code !== 1001) {
          this.handleReconnect(tournamentId);
        }
      };
    } catch (error) {
      console.error('❌ Excepción al conectar Tournaments WebSocket:', error);
      this.connecting = false;
      this.handleReconnect(tournamentId);
    }
  }

  handleReconnect(tournamentId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      // console.log(`⏳ Reintentando conexión a Tournaments en ${this.reconnectDelay}ms... (Intento ${this.reconnectAttempts})`);
      this.reconnectTimeoutId = setTimeout(() => this.connect(tournamentId), this.reconnectDelay);
    } else {
      // console.error('❌ Máximos intentos de reconexión Tournaments alcanzados.');
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
      this.tournamentId = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
    this.connecting = false;
  }
}

export const tournamentsWebSocket = new TournamentsWebSocket();
