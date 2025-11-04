import { useTranslation } from "react-i18next";
import { Check, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ThemesTab() {
  const { t } = useTranslation();
  const { theme: currentTheme, setTheme, isDark } = useTheme();

  const themes = [
    {
      key: 'light' as const,
      name: 'Light Mode',
      description: 'Clean and bright interface for daytime use',
      icon: Sun,
      preview: {
        background: '#ffffff',
        card: '#ffffff',
        sidebar: '#1f2937',
        primary: '#8b5cf6',
      }
    },
    {
      key: 'dark' as const,
      name: 'Dark Mode',
      description: 'Comfortable dark interface for nighttime use',
      icon: Moon,
      preview: {
        background: '#1f2937',
        card: '#374151',
        sidebar: '#111827',
        primary: '#8b5cf6',
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("settings.themes")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose between light and dark mode
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((themeOption) => {
          const isActive = currentTheme === themeOption.key;
          const Icon = themeOption.icon;

          return (
            <Card
              key={themeOption.key}
              className={`cursor-pointer transition-all ${
                isActive ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => setTheme(themeOption.key)}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <h3 className="font-semibold">{themeOption.name}</h3>
                    </div>
                    {isActive && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {themeOption.description}
                  </p>

                  <div className="aspect-video rounded-lg border overflow-hidden">
                    <div
                      className="h-full w-full flex"
                      style={{ backgroundColor: themeOption.preview.background }}
                    >
                      {/* Sidebar preview */}
                      <div
                        className="w-1/3 p-3 space-y-2"
                        style={{ backgroundColor: themeOption.preview.sidebar }}
                      >
                        <div className="h-2 w-full bg-gray-600 rounded" />
                        <div className="h-2 w-3/4 bg-gray-600 rounded" />
                        <div className="h-2 w-full bg-gray-600 rounded" />
                      </div>
                      {/* Content preview */}
                      <div className="flex-1 p-3 space-y-2">
                        <div
                          className="h-8 rounded"
                          style={{ backgroundColor: themeOption.preview.primary }}
                        />
                        <div
                          className="h-16 rounded"
                          style={{ backgroundColor: themeOption.preview.card }}
                        />
                      </div>
                    </div>
                  </div>

                  {isActive ? (
                    <Button className="w-full" disabled>
                      <Check className="h-4 w-4 mr-2" />
                      Active Theme
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setTheme(themeOption.key)}
                    >
                      Apply Theme
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-lg border p-6 bg-muted/50">
        <h3 className="font-semibold mb-2">Asana-Inspired Design</h3>
        <p className="text-sm text-muted-foreground">
          Our new design system features a clean, modern interface inspired by Asana.
          The purple accent color and sleek card-based layout provide a professional
          and intuitive experience across all dashboards.
        </p>
      </div>
    </div>
  );
}
