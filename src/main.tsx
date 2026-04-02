import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Guard: don't register SW in iframes or preview hosts
const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if ('serviceWorker' in navigator && !isInIframe && !isPreviewHost) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[FORGE] Service worker registered:', registration.scope);
      setInterval(() => registration.update(), 60 * 60 * 1000);
    } catch (error) {
      console.error('[FORGE] Service worker registration failed:', error);
    }
  });
} else if (isPreviewHost || isInIframe) {
  // Unregister any existing SW in preview/iframe
  navigator.serviceWorker?.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
  });
}

createRoot(document.getElementById("root")!).render(<App />);
