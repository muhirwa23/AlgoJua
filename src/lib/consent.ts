export interface ConsentPreferences {
  essential: boolean; // Always true
  analytics: boolean;
  advertising: boolean;
  decided: boolean;
  updatedAt: string;
}

const STORAGE_KEY = "algojua_consent_preferences";

export const DEFAULT_CONSENT: ConsentPreferences = {
  essential: true,
  analytics: false,
  advertising: false,
  decided: false,
  updatedAt: new Date().toISOString(),
};

export function getConsentState(): ConsentPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_CONSENT;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Check legacy consent key for backward compatibility
      const legacyConsent = localStorage.getItem("cookieConsent");
      if (legacyConsent === "true") {
        return {
          essential: true,
          analytics: true,
          advertising: true,
          decided: true,
          updatedAt: new Date().toISOString(),
        };
      }
      return DEFAULT_CONSENT;
    }
    const parsed = JSON.parse(stored) as ConsentPreferences;
    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      advertising: Boolean(parsed.advertising),
      decided: Boolean(parsed.decided),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch (err) {
    console.error("Failed to parse consent state:", err);
    return DEFAULT_CONSENT;
  }
}

export function saveConsentState(preferences: Partial<ConsentPreferences>): ConsentPreferences {
  const current = getConsentState();
  const updated: ConsentPreferences = {
    ...current,
    ...preferences,
    essential: true,
    decided: true,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem("cookieConsent", updated.analytics && updated.advertising ? "true" : "false");
    window.dispatchEvent(new CustomEvent("algojua_consent_updated", { detail: updated }));
  } catch (err) {
    console.error("Failed to save consent state:", err);
  }

  return updated;
}
