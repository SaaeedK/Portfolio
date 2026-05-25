/**
 * Vite + React + Tailwind. Dev server proxies /api/* to wrangler pages dev
 * (VITE_DEV_CONTACT_API_PROXY, default http://127.0.0.1:8788).
 */
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const contactProxy = env.VITE_DEV_CONTACT_API_PROXY || 'http://127.0.0.1:8788';

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('motion')) return 'vendor-motion';
            if (
              id.includes('react-dom') ||
              id.includes('react-router') ||
              /[/\\]react[/\\]/.test(id)
            ) {
              return 'vendor-react';
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api/contact': {
          target: contactProxy,
          changeOrigin: true,
        },
        '/api/logs': {
          target: contactProxy,
          changeOrigin: true,
        },
      },
    },
  };
});
