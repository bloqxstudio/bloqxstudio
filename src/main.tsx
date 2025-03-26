
import React from 'react'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'

// Create a container for error handling
const container = document.getElementById("root");

if (!container) {
  console.error("Failed to find the root element");
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Failed to initialize the application: Root element not found.</div>';
} else {
  try {
    const root = createRoot(container);
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error("Failed to render the application:", error);
    container.innerHTML = '<div style="color: red; padding: 20px;">Failed to initialize the application. Please check the console for more details.</div>';
  }
}
