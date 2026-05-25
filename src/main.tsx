/**
 * Client entry: fonts, optional Firebase bootstrap, React root.
 * Firebase loads only when VITE_FIREBASE_* build vars are present (see src/lib/firebase.ts).
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import App from '@/App.tsx';
import './index.css';

if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID && import.meta.env.VITE_FIREBASE_APP_ID) {
  void import('@/lib/firebase').then((m) => m.initFirebase());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
