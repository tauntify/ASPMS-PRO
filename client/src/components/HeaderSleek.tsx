import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  Globe,
  User,
  ChevronDown,
  BookOpen,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
import type { OrganizationSettings, NewsItem } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HeaderSleek() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch organization settings
  const { data: orgSettings } = useQuery<OrganizationSettings>({
    queryKey: ["/api/orgs/settings"],
    queryFn: async () => {
      const orgId = user?.organizationId || "arka_office";
      const response = await apiFetch(`/api/orgs/${orgId}/settings`);
      if (!response.ok) {
        throw new Error("Failed to fetch organization settings");
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch news ticker items
  const { data: newsItems } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
    queryFn: async () => {
      const response = await apiFetch("/api/news/arka_office");
      if (!response.ok) {
        return [];
      }
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const handleLogout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("ofivio-language", lang);
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.username;
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getOrgDisplayName = () => {
    if (!user) return "";
    if (user.role === "principle" && user.organizationId) {
      return `ofivio.${orgSettings?.studioName || user.organizationId}`;
    }
    return user.username;
  };

  return (
    <div className="w-full">
      {/* Main Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Studio Control Center */}
            <div className="flex items-center gap-3">
              <div className="font-bold text-xl text-gray-900">
                Studio Control Center
              </div>
            </div>

            {/* Center: Global Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder={t("header.globalSearch")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-xs uppercase">
                      {i18n.language.slice(0, 2)}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
                  <DropdownMenuLabel>{t("common.language")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => changeLanguage("en")}
                    className={i18n.language === "en" ? "bg-blue-50" : ""}
                  >
                    🇬🇧 English (EN)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeLanguage("ur")}
                    className={i18n.language === "ur" ? "bg-blue-50" : ""}
                  >
                    🇵🇰 اردو (Urdu)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeLanguage("ar")}
                    className={i18n.language === "ar" ? "bg-blue-50" : ""}
                  >
                    🇸🇦 عربي (Arabic)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeLanguage("fr")}
                    className={i18n.language === "fr" ? "bg-blue-50" : ""}
                  >
                    🇫🇷 Français (French)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeLanguage("es")}
                    className={i18n.language === "es" ? "bg-blue-50" : ""}
                  >
                    🇪🇸 Español (Spanish)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeLanguage("it")}
                    className={i18n.language === "it" ? "bg-blue-50" : ""}
                  >
                    🇮🇹 Italiano (Italian)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeLanguage("nl")}
                    className={i18n.language === "nl" ? "bg-blue-50" : ""}
                  >
                    🇳🇱 Nederlands (Dutch)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeLanguage("zh")}
                    className={i18n.language === "zh" ? "bg-blue-50" : ""}
                  >
                    🇨🇳 中文 (Chinese)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Blog Link */}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/blog">
                  <BookOpen className="h-4 w-4" />
                </Link>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <div className="font-medium">{user?.username}</div>
                      <div className="text-xs text-gray-500 font-normal">
                        {user?.email}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="h-4 w-4 mr-2" />
                      {t("common.profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      {t("common.settings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("common.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
