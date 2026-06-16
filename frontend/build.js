import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runBuild() {
  console.log("Starting Chrome Extension Build...");

  // 1. Build Popup UI (standard React SPA build)
  console.log("Building Popup React UI...");
  await build({
    root: __dirname,
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'index.html'),
        }
      }
    }
  });

  // 2. Build Content Script as a self-contained IIFE library (to prevent code splitting)
  console.log("Building Content Script...");
  await build({
    root: __dirname,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, 'src/content.tsx'), // We will name it content.tsx because it contains React code for Shadow DOM
        name: 'ContentScript',
        formats: ['iife'],
        fileName: () => 'content.js'
      },
      rollupOptions: {
        output: {
          extend: true
        }
      }
    }
  });

  // 3. Build Background Script as a self-contained IIFE library
  console.log("Building Background Worker...");
  await build({
    root: __dirname,
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, 'src/background.ts'),
        name: 'BackgroundScript',
        formats: ['iife'],
        fileName: () => 'background.js'
      }
    }
  });

  // 4. Copy manifest.json to dist
  console.log("Copying manifest.json...");
  fs.copyFileSync(
    resolve(__dirname, 'src/manifest.json'),
    resolve(__dirname, 'dist/manifest.json')
  );

  console.log("Chrome Extension Build Completed Successfully!");
}

runBuild().catch(console.error);
