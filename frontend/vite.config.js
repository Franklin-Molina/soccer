import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const API_URL = env.VITE_API_URL;

  return {
    base: "/",
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      // 1. IMPORTANTE: Permite acceso desde fuera del contenedor
      host: true, 
      strictPort: true,
      port: 5173, 
      
      // 2. LA SOLUCIÓN: Activa el sondeo de archivos (Polling)
      watch: {
        usePolling: true,
      },

      // 3. CORRECCIÓN DE PUERTO (Vital si usas mapeo 3000:5173 en Docker)
      // Si entras por el navegador al puerto 3000, Vite debe saberlo.
      hmr: {
       // clientPort: 3000, 
      },

      open: false, 
      proxy: {
        "/api": {
          target: API_URL,
          changeOrigin: true,
          // rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
    },
    build: {
      sourcemap: mode === "development",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return id
                .toString()
                .split("node_modules/")[1]
                .split("/")[0]
                .toString();
            }
          },
        },
      },
    },
  };
});