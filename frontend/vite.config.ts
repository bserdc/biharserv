import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const backendOrigin = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const srcPath = fileURLToPath(new URL('./src', import.meta.url));

  return {
    // The portal is hosted beneath the main site's Student Zone route.
    // Relative asset URLs keep the production build portable at that location.
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': srcPath,
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
