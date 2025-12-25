import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 7700,
    open: true
  },
  build: {
    outDir: 'dist'
  }
});
