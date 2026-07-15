import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    fs: {
      strict: true,
      allow: ["."],
    },
    // 로컬 백엔드(8080)로 프록시 → 브라우저는 같은 출처(5173)로만 요청하므로 CORS 불필요
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
