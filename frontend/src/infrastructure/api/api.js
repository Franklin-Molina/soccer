import axios from 'axios';

// URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Interceptor de Respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. Evitar bucles: si el error viene del endpoint de refresco, lo rechazamos de inmediato
    if (originalRequest.url.includes('/api/users/login/refresh/')) {
      return Promise.reject(error); 
    }

    // 2. Manejar el error 401 (Acceso denegado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 👇 Llamamos a tu super función de arriba en lugar de reescribir la petición
      const refreshSuccess = await refreshToken();

      if (refreshSuccess) {
        // Si el refresco fue exitoso, reintentamos la petición original
        return api(originalRequest);
      } else {
        // Si falló, la sesión está muerta. Limpiamos la bandera y rechazamos.
        localStorage.removeItem('hasSession');
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;