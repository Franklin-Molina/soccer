import axios from 'axios';


// URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json',
  },
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withCredentials: true, // ¡Crucial para las cookies HttpOnly!
});

let refreshTokenPromise = null;

// Función auxiliar para refrescar el token (Optimizada)
export const refreshToken = async (retries = 3, delay = 5000) => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    for (let i = 0; i < retries; i++) {
      try {
        // Usamos axios puro para evitar bucles infinitos con el interceptor de 'api'
        await axios.post(`${API_BASE_URL}/api/users/login/refresh/`, {}, { withCredentials: true });
        
        refreshTokenPromise = null;
        return true; // Éxito
      } catch (error) {
        const isLastAttempt = i === retries - 1;
        const serverAwakening = !error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error';

        if (serverAwakening && !isLastAttempt) {
          console.warn(`⏳ Backend despertando (intento ${i + 1}/${retries})... esperando ${delay}ms`);
          await new Promise(res => setTimeout(res, delay));
          continue;
        }

        if (error.response && (error.response.status === 401 || error.response.status === 400)) {
          console.error('❌ Error al refrescar token (Cookie expirada o inválida)');
        }

        if (isLastAttempt) {
          // 👇 Si fallan todos los intentos, matamos la bandera de sesión por seguridad
          localStorage.removeItem('hasSession');
          refreshTokenPromise = null;
        }
        return false; // Retornamos false explícitamente al fallar
      }
    }
    return false;
  })();

  return refreshTokenPromise;
};
let isServerDownFlag = false; 
// Interceptor de PETICIÓN (actúa ANTES de que salga la llamada)
api.interceptors.request.use((config) => {
  if (isServerDownFlag) {
    // Si ya sabemos que está caído, abortamos el vuelo inmediatamente
    // Esto evita que el navegador intente conectar y tire el error rojo
    return Promise.reject(new Error("Bloqueado por cortacircuitos: Servidor apagado."));
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed() {
  refreshSubscribers.forEach(cb => cb());
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // 🔥 AHORA SÍ: El cortacircuitos está dentro del interceptor
    if (!error.response) {
      isServerDownFlag = true; // 🔒 CERRAMOS EL CANDADO PARA LAS DEMÁS
      console.warn("Servidor no disponible");
      
      // Disparamos la alarma global
      window.dispatchEvent(new Event('server-down'));
      
      return Promise.reject(error);
    }

    // Evitar bucle en refresh
    if (originalRequest.url.includes('/api/users/login/refresh/')) {
      return Promise.reject(error);
    }

    // Manejo de 401
    if (error.response.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise(resolve => {
          subscribeTokenRefresh(() => {
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshSuccess = await refreshToken();

      isRefreshing = false;

      if (refreshSuccess) {
        onRefreshed();
        return api(originalRequest);
      } else {
        localStorage.removeItem('hasSession');
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;