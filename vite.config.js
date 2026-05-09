import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // Serve everything from project root so existing image/font paths work
  root: '.',
  // Disable auto-public-dir; we reference images directly from root at runtime
  publicDir: false,
  server: {
    // In dev, Vite serves files from root — images/fonts accessible at /images/…
    fs: { strict: false },
  },
  build: {
    outDir: 'dist',
    // Ensure Vite processes the HTML entry point correctly
    rollupOptions: {
      input: path.resolve(process.cwd(), 'index.html'),
    },
  },
});
