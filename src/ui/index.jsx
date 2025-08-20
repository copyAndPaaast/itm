/**
 * Entry point for ITM React UI application
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Get the root container
const container = document.getElementById('root')

if (!container) {
  throw new Error('Failed to find the root element. Make sure you have an element with id="root" in your HTML.')
}

// Create React root and render the app
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)