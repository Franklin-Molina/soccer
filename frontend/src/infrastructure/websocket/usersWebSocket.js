class UsersWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.baseReconnectDelay = 3000;
    this.isConnecting = false;
  }

  connect(token) {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return;
    if (this.isConnecting) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const host = apiUrl.replace(/^https?:\/\//, '');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${host}/ws/users/`;

    try {
      this.isConnecting = true;
      this.ws = new WebSocket(wsUrl, [token]);

      this.ws.onopen = () => {
        // console.log('✅ Users WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
        //  console.log('📨 Users WebSocket message:', data);
          this.listeners.forEach(callback => callback(data));
        } catch (error) {
          console.error('Error parsing Users WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        // console.error('❌ Users WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = (event) => {
        this.isConnecting = false;
        // console.log('🔌 Users WebSocket disconnected:', event.code);
        if (event.code !== 1000 && event.code !== 1001) {
          this.handleReconnect(token);
        }
      };
    } catch (error) {
      this.isConnecting = false;
      this.handleReconnect(token);
    }
  }

  handleReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      // Backoff exponencial: 3s, 6s, 12s, 24s, 48s
      const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      setTimeout(() => this.connect(token), delay);
    } else {
      console.warn('⚠️ Users WebSocket: Max reconnect attempts reached.');
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
