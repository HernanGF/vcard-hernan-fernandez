import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// If someone opens the legacy shared link from AI Studio, redirect them smoothly to the official Vercel domain
if (typeof window !== 'undefined' && window.location.hostname.includes('ais-pre-')) {
  window.location.replace('https://vcard-hernan-fernandez.vercel.app');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
