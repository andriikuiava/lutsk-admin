import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Add error handling
const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} catch (error) {
  console.error('Failed to render app:', error);
  root.innerHTML = `
    <div style="color: red; padding: 20px;">
      <h1>Something went wrong</h1>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
