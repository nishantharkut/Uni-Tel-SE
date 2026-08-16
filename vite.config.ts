import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::", // accessible on LAN
    port: 5173,      // default Vite port
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // allows imports like "@/components/Button"
    },
  },
  build: {
    outDir: "dist",   // build output directory
    sourcemap: false, // set to true if you want source maps in production
  },
});
