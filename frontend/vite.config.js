import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Route to the correct backend service
            if (req.url.startsWith('/api/auth') || req.url.startsWith('/api/users') || req.url.startsWith('/api/profiles')) {
              proxyReq.setHeader('host', 'localhost:8081');
            } else if (req.url.startsWith('/api/reviews')) {
              proxy.options.target = 'http://localhost:8083';
            } else {
              proxy.options.target = 'http://localhost:8082';
            }
          });
        },
      },
    },
  },
});
