// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173,
//     strictPort: true,
//     proxy: {
//       // Proxy /api requests to the FastAPI backend during development
//       "/api": {
//         target: "http://localhost:8000",
//         changeOrigin: true,
//       },
//     },
//   },
//   build: {
//     outDir: "dist",
//     sourcemap: true,
//     chunkSizeWarningLimit: 700,
//     rollupOptions: {
//       output: {
//         manualChunks: {
//           vendor: ["react", "react-dom", "react-router-dom"],
//           elevenlabs: ["@elevenlabs/react"],
//         },
//       },
//     },
//   },
// });
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          elevenlabs: ["@elevenlabs/react"],
        },
      },
    },
  },
});