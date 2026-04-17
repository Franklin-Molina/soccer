import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000" || "";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  withCredentials: true,
});

// ==============================
// 🔥 LOGOUT CENTRALIZADO
// ==============================
let isLoggingOut = false;

async function forceLogout() {
  if (isLoggingOut) return;
  isLoggingOut = true;

  console.warn("🔒 Sesión inválida. Limpieza local...");

  // ❌ NO llamar backend
  // await axios.post(...)

  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });

  localStorage.clear();
  sessionStorage.clear();

  window.dispatchEvent(new Event("auth:logout"));
}

// ==============================
// 🔄 REFRESH TOKEN
// ==============================
let refreshTokenPromise = null;


export const refreshToken = async (retries = 3, delay = 2000) => {
  if (refreshTokenPromise) return refreshTokenPromise;

  refreshTokenPromise = (async () => {
    for (let i = 0; i < retries; i++) {
      try {
        await axios.post(
          `${API_BASE_URL}/api/users/login/refresh/`,
          {},
          { withCredentials: true }
        );
        refreshTokenPromise = null;
        return true;
      } catch (error) {
        const isLastAttempt = i === retries - 1;
        const isNetworkError =
          !error.response ||
          error.code === "ECONNABORTED" ||
          error.message === "Network Error";

        // 🔥 Solo reintenta si es error de red (backend despertando)
        // No reintenta si es 401/400 — eso es sesión inválida, logout inmediato
        if (isNetworkError && !isLastAttempt) {
          console.warn(`⏳ Backend despertando (${i + 1}/${retries})...`);
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }

        if (error.response?.status === 401 || error.response?.status === 400) {
          console.error("❌ Token inválido o expirado");
          refreshTokenPromise = null;
          return false; // Logout inmediato, sin más reintentos
        }

        refreshTokenPromise = null;
        return false;
      }
    }
    return false;
  })();

  return refreshTokenPromise;
};

// ==============================
// 🔄 COLA DE REFRESH
// ==============================
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

// ==============================
// ⚡ CORTACIRCUITOS (Solo para Logout)
// ==============================
api.interceptors.request.use(
  (config) => {
    if (isLoggingOut) {
      return Promise.reject(new Error("🚫 Solicitud bloqueada por cierre de sesión"));
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================
// 🔥 INTERCEPTOR RESPUESTA
// ==============================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ⚠️ Validación básica (solo null check)
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 🚨 Servidor no responde
    if (!error.response) {
      if (originalRequest.method === 'get' && !originalRequest._retry) {
        originalRequest._retry = true;
        console.warn("⏳ Servidor no responde, reintentando en 2s...");
        await new Promise(res => setTimeout(res, 2000));
        return api(originalRequest);
      }

      console.warn("🚨 Servidor no disponible tras reintento.");
      window.dispatchEvent(new Event("server-down"));
      return Promise.reject(error);
    }

    // 🚫 Evitar loop en refresh
    if (originalRequest?.url?.includes("/api/users/login/refresh/")) {
      if (error.response.status === 401) {
        forceLogout();
      }
      return Promise.reject(error);
    }

    // 🔐 Manejo 401
    if (error.response.status === 401) {

      // 🚫 Si ya se reintentó, no repetir
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      // 🚫 Si no hay sesión, no intentes refresh
      const hasSession = document.cookie.includes("sessionid"); // ajusta nombre real
      if (!hasSession) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        if (isLoggingOut) return Promise.reject(error);

        return new Promise((resolve) => {
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
        refreshSubscribers = [];
        forceLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;