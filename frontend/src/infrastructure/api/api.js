import axios from 'axios';

// TODO: Configurar la URL base de la API desde una variable de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuración para incluir la cookie CSRF automáticamente
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withCredentials: true, // Importante para enviar cookies a través de dominios/puertos
});

let refreshTokenPromise = null;

// Función auxiliar para refrescar el token con reintentos para manejar el "cold start" de Render
export const refreshToken = async (failedToken = null, retries = 3, delay = 5000) => {
  // Si el token en localStorage ya es diferente al que falló, significa que otra petición ya lo refrescó
  const currentToken = localStorage.getItem('accessToken');
  if (failedToken && currentToken !== failedToken && currentToken !== null) {
    return currentToken;
  }

  // Si ya hay un refresco en curso, retornar esa misma promesa
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) {
    console.warn('❌ No hay refreshToken disponible en localStorage');
    return null;
  }

  refreshTokenPromise = (async () => {
    for (let i = 0; i < retries; i++) {
    try {
      // console.log(`🔄 Intentando refrescar token (intento ${i + 1}/${retries})...`);
      const response = await axios.post(`${API_BASE_URL}/api/users/login/refresh/`, { refresh });
      const { access } = response.data;
      
      // console.log('✅ Token refrescado exitosamente');
      localStorage.setItem('accessToken', access);
      refreshTokenPromise = null;
      return access;
    } catch (error) {
      const isLastAttempt = i === retries - 1;
      const serverAwakening = !error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error';

      // Si el servidor no responde (cold start) y no es el último intento, esperar y reintentar
      if (serverAwakening && !isLastAttempt) {
        console.warn(`⏳ Backend despertando (intento ${i + 1}/${retries})... esperando ${delay}ms`);
        await new Promise(res => setTimeout(res, delay));
        continue;
      }

      // 1. Manejo selectivo de limpieza de tokens: Solo limpiar si hay error real
      // Si el error es una respuesta del servidor (ej: 401, 400), el token de refresco ya no es válido
      if (error.response) {
        console.error('❌ Error real del servidor al refrescar token. Limpiando credenciales:', error.response.status, error.response.data);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else if (isLastAttempt) {
        console.error('❌ Se agotaron los reintentos y el servidor sigue sin responder.');
      }

      if (isLastAttempt) {
        refreshTokenPromise = null;
      }
      return null;
    }
  }
  refreshTokenPromise = null;
  return null;
  })();

  return refreshTokenPromise;
};

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken'); 
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // CASO 1: El servidor está apagado o no hay internet (Cold Start)
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn("⚠️ El servidor no responde. Intentando despertar backend...");
      
      const currentToken = localStorage.getItem('accessToken');
      const newAccessToken = await refreshToken(currentToken);
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
    }

    // CASO 2: Error 401 (Token expirado o inválido)
    if (error.response && error.response.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        // Extraer el token que falló de los headers de la petición original
        const authHeader = originalRequest.headers.Authorization;
        const failedToken = authHeader ? authHeader.split(' ')[1] : null;

        const newAccessToken = await refreshToken(failedToken);
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      }

      // Si el refresco falla o ya se intentó, limpiar y redirigir
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default api;
