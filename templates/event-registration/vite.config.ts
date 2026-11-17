import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Built into the portfolio's public folder and shown inside a frame on the Services cards.
export default defineConfig({
  base: '/demos/event-registration/',
  plugins: [react(), tailwindcss()],
  build: { outDir: '../../public/demos/event-registration', emptyOutDir: true },
});
