import { useState } from "react";
import { Download, X } from "lucide-react";
import { Capacitor } from "@capacitor/core";

const DISMISS_KEY = "kaeltoon-apk-dismissed";

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

function getInitialShow(): boolean {
  const isNative = Capacitor.isNativePlatform();
  const dismissed = sessionStorage.getItem(DISMISS_KEY);
  return isAndroid() && !isNative && !dismissed;
}

export default function DownloadBanner() {
  const [show, setShow] = useState(getInitialShow);

  if (!show) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 flex items-center gap-3 max-w-lg mx-auto">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Download Kaeltoon App</p>
          <p className="text-xs text-muted-foreground">Lebih ringan, lebih cepat!</p>
        </div>
        <a
          href="/download/kaeltoon.apk"
          download="Kaeltoon.apk"
          className="shrink-0 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          Install
        </a>
        <button
          onClick={dismiss}
          className="shrink-0 p-1 rounded-lg hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
