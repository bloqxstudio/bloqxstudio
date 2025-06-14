
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import './index.css'

// Get the root element
const container = document.getElementById('root')

if (!container) {
  console.error("Failed to find the root element")
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Failed to initialize the application: Root element not found.</div>'
} else {
  try {
    // Create a root
    const root = createRoot(container)
    
    // Initial render
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  } catch (error) {
    console.error("Failed to render the application:", error)
    container.innerHTML = '<div style="color: red; padding: 20px;">Failed to initialize the application. Please check the console for more details.</div>'
  }
}
