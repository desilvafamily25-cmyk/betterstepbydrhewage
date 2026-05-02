import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X, Share } from 'lucide-react';

export function InstallAppBanner() {
  const { canInstall, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  if (isIOS) {
    return (
      <div className="bg-[#1B3D34] rounded-2xl p-4 text-white relative">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 text-white/60 hover:text-white"
        >
          <X size={16} />
        </button>
        <div className="flex items-start gap-3 pr-4">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Share size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">Add BetterStep to your Home Screen</p>
            <p className="text-white/75 text-xs mt-1 leading-relaxed">
              Tap the <span className="font-bold text-white">Share</span> button at the bottom of your browser, then tap <span className="font-bold text-white">"Add to Home Screen"</span> for quick access like an app.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1B3D34] rounded-2xl p-4 text-white relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-white/60 hover:text-white"
      >
        <X size={16} />
      </button>
      <div className="flex items-center gap-3 pr-4">
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <Download size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Install the BetterStep App</p>
          <p className="text-white/75 text-xs mt-0.5">Add to your home screen for quick access</p>
        </div>
        <button
          onClick={install}
          className="bg-white text-[#1B3D34] rounded-xl px-4 py-2 text-sm font-bold flex-shrink-0"
        >
          Install
        </button>
      </div>
    </div>
  );
}
