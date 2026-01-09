
import React from 'react';
// Correctly import ReactDOM from react-dom/client and fix the variable name to resolve UMD global error
import ReactDOM from 'react-dom/client';
// Fix path to App component which is located in the components directory
import App from './components/App.tsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  // Use the properly imported ReactDOM to create the root
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
