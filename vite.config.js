import { resolve } from 'path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { chromeExtension } from 'vite-plugin-chrome-extension';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: 'src/manifest.json',
      output: {
        manualChunks: undefined,
        assetFileNames: 'styles/[name].[ext]',
      },
    },
  },
  plugins: [vue(), chromeExtension()],
});
