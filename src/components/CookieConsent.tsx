import { useState, useEffect } from "react";
import { X, Settings, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { getConsentState, saveConsentState, type ConsentPreferences } from "@/lib/consent";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [consent, setConsent] = useState<ConsentPreferences>(DEFAULT_STATE);

  function DEFAULT_STATE(): ConsentPreferences {
    return {
      essential: true,
      analytics: false,
      advertising: false,
      decided: false,
      updatedAt: new Date().toISOString(),
    };
  }

  useEffect(() => {
    const currentState = getConsentState();
    setConsent(currentState);
    if (!currentState.decided) {
      setIsVisible(true);
    }

    const handleOpenModal = () => {
      setConsent(getConsentState());
      setShowPreferencesModal(true);
    };

    window.addEventListener("algojua_open_consent_modal", handleOpenModal);
    return () => {
      window.removeEventListener("algojua_open_consent_modal", handleOpenModal);
    };
  }, []);

  const handleAcceptAll = () => {
    const updated = saveConsentState({
      analytics: true,
      advertising: true,
    });
    setConsent(updated);
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  const handleRejectNonEssential = () => {
    const updated = saveConsentState({
      analytics: false,
      advertising: false,
    });
    setConsent(updated);
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  const handleDismissWithoutConsent = () => {
    // Dismissing or closing without explicit accept defaults to rejecting non-essentials
    handleRejectNonEssential();
  };

  const handleSaveCustomPreferences = () => {
    const updated = saveConsentState({
      analytics: consent.analytics,
      advertising: consent.advertising,
    });
    setConsent(updated);
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  return (
    <>
      {/* Banner */}
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 border-t border-white/10 bg-background/95 backdrop-blur-md shadow-2xl animate-slide-up">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 text-sm text-muted-foreground pr-4">
              <div className="flex items-center gap-2 mb-1 font-semibold text-foreground text-base">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>Privacy &amp; Cookie Preferences</span>
              </div>
              <p>
                We use essential cookies for site functionality and, with your consent, non-essential cookies
                (Google AdSense and analytics) to personalize content, deliver relevant ads, and measure site traffic.
                Review our{" "}
                <a href="/privacy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </a>{" "}
                for full details.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreferencesModal(true)}
                className="rounded-full flex items-center gap-1.5 text-xs sm:text-sm"
              >
                <Settings className="w-4 h-4" />
                Customize
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRejectNonEssential}
                className="rounded-full text-xs sm:text-sm"
              >
                Reject Non-Essential
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm"
              >
                Accept All
              </Button>
              <button
                onClick={handleDismissWithoutConsent}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full"
                aria-label="Close and reject non-essential cookies"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Dialog */}
      <Dialog open={showPreferencesModal} onOpenChange={setShowPreferencesModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage how AlgoJua uses cookies and tracking technologies. You can change these preferences at any time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Essential */}
            <div className="flex items-center justify-between space-x-4 border-b border-border/50 pb-4">
              <div className="space-y-1 pr-4">
                <Label className="font-semibold text-base flex items-center gap-2">
                  Essential Cookies
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-normal">
                    Always Required
                  </span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Necessary for core features like security, session routing, and accessibility.
                </p>
              </div>
              <Switch checked disabled aria-label="Essential Cookies Always Active" />
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between space-x-4 border-b border-border/50 pb-4">
              <div className="space-y-1 pr-4">
                <Label htmlFor="analytics-switch" className="font-semibold text-base cursor-pointer">
                  Analytics Cookies
                </Label>
                <p className="text-xs text-muted-foreground">
                  Helps us measure pageviews, article engagement, and reader journeys anonymously.
                </p>
              </div>
              <Switch
                id="analytics-switch"
                checked={consent.analytics}
                onCheckedChange={(checked) => setConsent((prev) => ({ ...prev, analytics: checked }))}
              />
            </div>

            {/* Advertising */}
            <div className="flex items-center justify-between space-x-4 pb-2">
              <div className="space-y-1 pr-4">
                <Label htmlFor="advertising-switch" className="font-semibold text-base cursor-pointer">
                  Advertising Cookies (Google AdSense)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allows Google AdSense to serve relevant advertisements and personalize ad content.
                </p>
              </div>
              <Switch
                id="advertising-switch"
                checked={consent.advertising}
                onCheckedChange={(checked) => setConsent((prev) => ({ ...prev, advertising: checked }))}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleRejectNonEssential} className="w-full sm:w-auto rounded-full">
              Reject Optional
            </Button>
            <Button onClick={handleSaveCustomPreferences} className="w-full sm:w-auto rounded-full bg-primary">
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
