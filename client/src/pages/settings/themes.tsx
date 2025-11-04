import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { themes } from "@/lib/themes";
import type { ThemeKey } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ThemesTab() {
  const { t } = useTranslation();
  const { theme: currentTheme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("settings.themes")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Customize the look and feel of your application
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(themes).map(([key, value]) => {
          const isActive = currentTheme === key;
          return (
            <Card
              key={key}
              className={`cursor-pointer transition-all ${
                isActive ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => setTheme(key as ThemeKey)}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{value.name}</h3>
                    {isActive && (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="aspect-video rounded-lg border overflow-hidden">
                    <div
                      className="h-full w-full"
                      style={{ backgroundColor: value.colors.background }}
                    >
                      <div className="p-4 space-y-2">
                        <div
                          className="h-8 rounded"
                          style={{ backgroundColor: value.colors.primary }}
                        />
                        <div
                          className="h-16 rounded"
                          style={{ backgroundColor: value.colors.cardBg }}
                        />
                        <div className="flex gap-2">
                          <div
                            className="h-4 w-20 rounded"
                            style={{ backgroundColor: value.colors.accent }}
                          />
                          <div
                            className="h-4 w-16 rounded"
                            style={{ backgroundColor: value.colors.borderColor }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Object.entries(value.colors).slice(0, 4).map(([name, color]) => (
                      <div key={name} className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-muted-foreground capitalize">
                          {name}
                        </span>
                      </div>
                    ))}
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
                      onClick={() => setTheme(key as ThemeKey)}
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
        <h3 className="font-semibold mb-2">Custom Colors</h3>
        <p className="text-sm text-muted-foreground">
          Advanced color customization will be available in a future update. You can currently choose
          from the three preset themes above.
        </p>
      </div>
    </div>
  );
}
