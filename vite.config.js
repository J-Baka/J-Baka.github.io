import { defineConfig } from 'vite';

// User site (J-Baka.github.io) is served from the domain root, so base is '/'.
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
});
