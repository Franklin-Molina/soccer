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

// Función auxiliar para refrescar el token
export const refreshToken = async () => {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) return null;
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/login/refresh/`, { refresh });
    const { access } = response.data;
    localStorage.setItem('accessToken', access);
    return access;
  } catch (error) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
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
    // CASO 1: El servidor está apagado o no hay internet
    if (!error.response) {
      console.warn("⚠️ Error de red o servidor caído. NO desloguear.");
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Verificar si es un error 401 y no es una solicitud de refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      const newAccessToken = await refreshToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
