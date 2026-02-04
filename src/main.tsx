import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register custom service worker for notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Register our custom notification service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('[FORGE] Service worker registered:', registration.scope);
      
      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Every hour
      
    } catch (error) {
      console.error('[FORGE] Service worker registration failed:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
