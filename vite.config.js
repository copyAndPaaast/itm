/**
 * Vite configuration for ITM system
 * Supports both backend library build and React UI development
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom'],
          'mui': ['@mui/material', '@mui/icons-material'],
          'redux': ['@reduxjs/toolkit', 'react-redux'],
          'cytoscape': ['cytoscape', 'cytoscape-dagre', 'cytoscape-cola', 'cytoscape-cose-bilkent']
        }
      }
    }
  },
  
  // Development server
  server: {
    host: true,
    port: 3000,
    open: true
  },
  
  // Path aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ui': resolve(__dirname, './src/ui'),
      '@components': resolve(__dirname, './src/ui/components'),
      '@store': resolve(__dirname, './src/ui/store')
    }
  }
})