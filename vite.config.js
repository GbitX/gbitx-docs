import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5181 },
  // Single-page docs: no aggressive splitting needed — the locale JSONs
  // are the only sizeable chunks and Rollup will already split them.
});
