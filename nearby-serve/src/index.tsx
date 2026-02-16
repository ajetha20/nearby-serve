import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color:red; padding: 20px;"><h1>Fatal Error</h1><p>Could not find root element to mount to.</p></div>';
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Application crashed during mount:", error);
  rootElement.innerHTML = `
    <div style="padding: 2rem; color: #DC2626; font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
      <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Application Failed to Start</h1>
      <p style="margin-bottom: 1rem; color: #4b5563;">An error occurred while initializing the app. This is usually due to a configuration issue.</p>
      <div style="background: #FEF2F2; padding: 1rem; border-radius: 0.5rem; border: 1px solid #FECACA; overflow: auto; font-family: monospace; font-size: 0.875rem;">
        ${error instanceof Error ? error.message : String(error)}
      </div>
    </div>
  `;
}