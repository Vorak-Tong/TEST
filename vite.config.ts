import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'client', // if your frontend is in /client folder, otherwise remove this line
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'), // '@' points to client/src
    },
  },
  server: {
    port: 5000, // default port, change if you want
    open: true, // auto open browser on start
  },
  build: {
    outDir: '../dist/client', // output relative to root, adjust as needed
    emptyOutDir: true,
  },
});
