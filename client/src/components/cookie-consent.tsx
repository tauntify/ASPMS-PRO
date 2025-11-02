import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Cookie, Settings, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const COOKIE_CONSENT_KEY = "cookie-consent";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch (e) {
        console.error("Failed to parse cookie preferences");
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Apply preferences (you can add actual cookie setting logic here)
    if (prefs.analytics) {
      console.log("Analytics cookies enabled");
      // Enable Google Analytics or other analytics
    }
    if (prefs.marketing) {
      console.log("Marketing cookies enabled");
      // Enable marketing pixels
    }
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectNonEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
    });
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t shadow-lg">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">This website uses cookies</h3>
                <p className="text-sm text-muted-foreground">
                  We use cookies to improve your experience on our site. Essential cookies are required for the site to function.
                  You can choose to accept all cookies or customize your preferences.{" "}
                  <a href="/privacy-policy" className="text-primary hover:underline">
                    Learn more in our Privacy Policy
                  </a>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Customize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rejectNonEssential}
              >
                Reject Non-Essential
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. Essential cookies are required and cannot be disabled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Essential Cookies */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={true}
                  disabled
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Essential Cookies (Required)</h4>
                  <p className="text-sm text-muted-foreground">
                    These cookies are necessary for the website to function properly. They enable core functionality
                    such as security, network management, and accessibility. These cookies cannot be disabled.
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Examples: Authentication, session management, security tokens
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Analytics Cookies */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, analytics: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Analytics Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    These cookies help us understand how visitors interact with our website by collecting and
                    reporting information anonymously. This helps us improve our services.
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Examples: Google Analytics, page views, user behavior tracking
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Marketing Cookies */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketing: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Marketing Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    These cookies are used to track visitors across websites. The intention is to display ads
                    that are relevant and engaging for individual users.
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Examples: Ad targeting, conversion tracking, social media integration
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={rejectNonEssential}
            >
              Reject Non-Essential
            </Button>
            <Button
              className="flex-1"
              onClick={saveCustomPreferences}
            >
              Save Preferences
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-2">
            For more information, read our{" "}
            <a href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            {" "}and{" "}
            <a href="/gdpr-compliance" className="text-primary hover:underline">
              GDPR Compliance
            </a>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
