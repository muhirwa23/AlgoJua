import React, { useEffect, useRef, useState } from "react";
import { loadAdSenseScript, pushAdUnit, getAdClientId } from "@/lib/adsense";
import { getConsentState } from "@/lib/consent";

interface AdUnitProps {
  slotId?: string;
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  layout?: string;
  layoutKey?: string;
  responsive?: boolean;
  className?: string;
  label?: string;
  style?: React.CSSProperties;
}

export const AdUnit: React.FC<AdUnitProps> = ({
  slotId,
  format = "auto",
  layout,
  layoutKey,
  responsive = true,
  className = "",
  label = "Advertisement",
  style,
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef<boolean>(false);
  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const [adError, setAdError] = useState<boolean>(false);
  const [hasConsent, setHasConsent] = useState<boolean>(false);

  const clientId = getAdClientId();

  useEffect(() => {
    const consent = getConsentState();
    setHasConsent(consent.advertising);

    const handleConsentUpdated = () => {
      const updated = getConsentState();
      setHasConsent(updated.advertising);
    };

    window.addEventListener("algojua_consent_updated", handleConsentUpdated);
    return () => {
      window.removeEventListener("algojua_consent_updated", handleConsentUpdated);
    };
  }, []);

  useEffect(() => {
    if (!hasConsent || !slotId) return;

    let isMounted = true;

    loadAdSenseScript().then((success) => {
      if (!success || !isMounted) {
        setAdError(true);
        return;
      }

      if (adRef.current && !pushedRef.current) {
        // Prevent double push
        pushedRef.current = true;
        try {
          pushAdUnit();
          setAdLoaded(true);
        } catch (err) {
          console.warn("AdSense push failed:", err);
          setAdError(true);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [hasConsent, slotId]);

  if (!hasConsent) {
    return null;
  }

  // If no configured slotId is passed, render a safe, subtle placeholder in dev/preview
  if (!slotId) {
    return (
      <div className={`flex flex-col items-center justify-center my-8 ${className}`}>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</span>
        <div
          className="w-full bg-muted/30 border border-border/50 border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-xs p-6"
          style={{
            minHeight: format === "vertical" ? "300px" : "120px",
            ...style,
          }}
        >
          <div className="text-center">
            <p className="font-medium text-foreground/80">Ad Placement Space</p>
            <p className="text-[11px] opacity-75 mt-1">
              Configure VITE_ADSENSE_SLOT_ID to enable live AdSense ads
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center my-8 w-full overflow-hidden ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1.5">{label}</span>
      <div
        className="w-full flex items-center justify-center min-h-[100px] bg-muted/20 rounded-lg"
        style={style}
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", ...style }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format={format}
          {...(responsive ? { "data-full-width-responsive": "true" } : {})}
          {...(layout ? { "data-ad-layout": layout } : {})}
          {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
        />
      </div>
    </div>
  );
};

export default AdUnit;
