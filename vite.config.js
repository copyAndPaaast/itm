/**
 * Vite configuration for ITM system
 * Supports both backend library build and React UI development
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  // Different configurations for different modes
  const isUIMode = process.env.VITE_MODE === 'ui'
  
  if (isUIMode) {
    // Configuration for React UI development
    return {
      plugins: [react()],
      
      // Root directory for the React app
      root: 'src/ui',
      
      // Build configuration for UI
      build: {
        outDir: '../../dist/ui',
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
        open: true,
        proxy: {
          '/api': {
            target: 'http://localhost:4000',
            changeOrigin: true,
            secure: false
          }
        }
      },
      
      // Path aliases for UI
      resolve: {
        alias: {
          '@': resolve(__dirname, './src'),
          '@ui': resolve(__dirname, './src/ui'),
          '@components': resolve(__dirname, './src/ui/components'),
          '@store': resolve(__dirname, './src/ui/store')
        }
      }
    }
  }
  
  // Default configuration for backend library
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.js'),
        name: 'Graph2',
        fileName: 'index',
        formats: ['es']
      },
      rollupOptions: {
        external: [],
        output: {
          globals: {}
        }
      }
    }
  }
})