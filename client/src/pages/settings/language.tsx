import { useTranslation } from "react-i18next";
import { Check, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LanguageTab() {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: "en", name: "English", nativeName: "English", enabled: true },
    { code: "ur", name: "Urdu", nativeName: "اردو", enabled: true },
    { code: "ar", name: "Arabic", nativeName: "العربية", enabled: false },
    { code: "fr", name: "French", nativeName: "Français", enabled: false },
    { code: "es", name: "Spanish", nativeName: "Español", enabled: false },
    { code: "it", name: "Italian", nativeName: "Italiano", enabled: false },
    { code: "nl", name: "Dutch", nativeName: "Nederlands", enabled: false },
    { code: "zh", name: "Chinese", nativeName: "中文", enabled: false },
  ];

  const handleLanguageChange = (code: string) => {
    if (languages.find(l => l.code === code)?.enabled) {
      i18n.changeLanguage(code);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("settings.languages")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select your preferred language for the application
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {languages.map((lang) => {
          const isActive = i18n.language === lang.code;
          const isEnabled = lang.enabled;

          return (
            <Card
              key={lang.code}
              className={`cursor-pointer transition-all ${
                !isEnabled
                  ? "opacity-50 cursor-not-allowed"
                  : isActive
                  ? "ring-2 ring-primary shadow-md"
                  : "hover:shadow-md"
              }`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{lang.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {lang.nativeName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEnabled && (
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    )}
                    {isActive && isEnabled && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-lg border p-6 bg-blue-50/50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Currently Available Languages</h3>
        <p className="text-sm text-blue-800 mb-3">
          English and Urdu are currently supported. More languages will be added in future updates.
        </p>
        <div className="flex gap-2">
          <Badge>English</Badge>
          <Badge>Urdu (اردو)</Badge>
        </div>
      </div>
    </div>
  );
}
