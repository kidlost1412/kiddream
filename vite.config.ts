import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            // Manual chunks for better code splitting
            manualChunks: {
              // React core
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              // State management
              'state-vendor': ['zustand'],
              // Animations
              'animation-vendor': ['framer-motion'],
              // Supabase
              'supabase-vendor': ['@supabase/supabase-js'],
              // UI utilities
              'ui-vendor': ['date-fns'],
            },
          },
        },
        // Optimize dependencies
        commonjsOptions: {
          transformMixedEsModules: true,
        },
        // Minification
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production',
          },
        },
      },
      // Optimize dependencies
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'framer-motion'],
      },
    };
});
