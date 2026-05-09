import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    // Copy static asset folders into dist/ so they are available on Cloudflare Pages.
    // publicDir stays false to avoid the dist-into-dist conflict; this plugin
    // handles the copy explicitly.
    viteStaticCopy({
      targets: [
        { src: 'images', dest: '.' },
        { src: 'fonts',  dest: '.' },
      ],
    }),
  ],
  root: '.',
  publicDir: false,
  server: {
    fs: { strict: false },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: path.resolve(process.cwd(), 'index.html'),
    },
  },
});
