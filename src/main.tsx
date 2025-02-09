import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'mapbox-gl/dist/mapbox-gl.css';
import App from './App.tsx';
import './index.css';
import './styles/mapbox.css';
import { calendarService } from './lib/api/calendar';

// Initialize calendar service
calendarService.initInternal().catch((error) => {
  console.error('Failed to initialize calendar service:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
