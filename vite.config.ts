import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Bind to IPv4 to avoid HMR websocket issues when visiting via 127.0.0.1
    host: "127.0.0.1",
    port: 8080,
    hmr: {
      host: "127.0.0.1",
      port: 8080,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    // Ensure a single React instance (prevents "Invalid hook call")
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
