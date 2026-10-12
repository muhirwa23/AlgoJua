import { getConsentState } from "./consent";

const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID || "ca-pub-2719075484276244";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

let isScriptLoading = false;
let isScriptLoaded = false;

export function loadAdSenseScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    const consent = getConsentState();
    if (!consent.advertising) {
      resolve(false);
      return;
    }

    if (isScriptLoaded || document.querySelector("script[src*='adsbygoogle.js']")) {
      isScriptLoaded = true;
      resolve(true);
      return;
    }

    if (isScriptLoading) {
      const checkInterval = setInterval(() => {
        if (isScriptLoaded) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
      return;
    }

    isScriptLoading = true;
    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    script.async = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      resolve(true);
    };

    script.onerror = (err) => {
      console.warn("Failed to load Google AdSense script:", err);
      isScriptLoading = false;
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

export function pushAdUnit(): void {
  if (typeof window !== "undefined") {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense push error:", e);
    }
  }
}

export function getAdClientId(): string {
  return ADSENSE_CLIENT_ID;
}
