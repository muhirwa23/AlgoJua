import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem("cookieConsent");
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-white/10 bg-background/80 backdrop-blur-md shadow-2xl animate-slide-up">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm text-muted-foreground mr-8">
          We use cookies, including Google AdSense cookies, to personalize content, ads, and to analyze our traffic. 
          By clicking <strong className="text-secondary-foreground">"Accept"</strong>, you consent to our use of cookies as described in our{" "}
          <a href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</a>.
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button onClick={handleAccept} className="w-full sm:w-auto whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90">
            Accept Cookies
          </Button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
