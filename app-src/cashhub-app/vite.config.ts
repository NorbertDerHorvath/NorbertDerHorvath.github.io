import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    // 🔑 KULCS: GitHub Pages alútvonal
    // workflow-ban BASE_PATH=/apps/cashhub-app/
    // lokálban fallback-ként ugyanez
    base: process.env.BASE_PATH || '/apps/cashhub-app/',

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    plugins: [react()],

    // (Nem kritikus most, de maradhat)
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
