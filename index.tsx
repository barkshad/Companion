
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global error boundary for development/debugging blank pages
window.addEventListener('error', (event) => {
  console.error('Runtime error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
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
  console.error('Fatal error during React mounting:', error);
}
