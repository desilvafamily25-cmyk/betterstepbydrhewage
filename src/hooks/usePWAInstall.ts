import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent;
  }
}

export function usePWAInstall() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    () => window.__pwaInstallPrompt ?? null
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    if (standalone) { setIsInstalled(true); return; }

    // iOS detection
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as Record<string, unknown>).MSStream;
    setIsIOS(ios);

    // Pick up the event if it was captured early in main.tsx
    if (window.__pwaInstallPrompt) {
      setPromptEvent(window.__pwaInstallPrompt);
    }

    // Also listen in case it fires after mount
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setPromptEvent(null);
    window.__pwaInstallPrompt = undefined;
  };

  const canInstall = !isInstalled && (!!promptEvent || isIOS);

  return { canInstall, isInstalled, isIOS, install };
}
