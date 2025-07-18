import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('main.tsx: Starting application...');

const rootElement = document.getElementById('root');
console.log('main.tsx: Root element found:', rootElement);

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log('main.tsx: App rendered successfully');
} else {
  console.error('main.tsx: Root element not found!');
}
