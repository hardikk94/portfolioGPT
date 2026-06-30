import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({ include: ['**/*.js', '**/*.jsx'] })],
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
  },
});
