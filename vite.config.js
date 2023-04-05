// vite.config.js
import { defineConfig } from 'vite';
import Checker from 'vite-plugin-checker';
import esbuild from 'rollup-plugin-esbuild';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['./tsconfig.module.json'],
    }),
    Checker({ typescript: true }),
  ],
  build: {
    target: 'esnext',
    lib: {
      entry: {
        constants: './constants.ts',
      },
      formats: ['es', 'cjs'],
    },
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: '[name].[format].js',
        chunkFileNames: '[name].[format].js',
        assetFileNames: '[name].[ext]',
      },
      external: ['peer-dependency'],
      plugins: [
        esbuild({
          target: 'esnext',
        }),
      ],
    },
  },
});
