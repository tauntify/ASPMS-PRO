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
  Palette,
  User,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
import { themes } from "@/lib/themes";
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
      {/* Fixed Ofivio Header - Cannot be removed or edited by users */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-bold text-lg tracking-wide">OFIVIO</div>
            {newsItems && newsItems.length > 0 && (
              <div className="hidden md:flex items-center gap-2 ml-4">
                <span className="text-xs text-blue-200 uppercase tracking-wider">
                  {t("header.newsTicker")}:
                </span>
                <div className="overflow-hidden max-w-xl">
                  <div className="animate-marquee whitespace-nowrap">
                    {newsItems.map((item, idx) => (
                      <span key={idx} className="mx-6 text-sm">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-200 transition-colors"
                          >
                            {item.title}
                          </a>
                        ) : (
                          item.title
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-xs text-blue-200">
            Powered by ARKA Technologies
          </div>
        </div>
      </div>

      {/* User-specific Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Organization/User Info */}
            <div className="flex items-center gap-3">
              {user?.role === "principle" && orgSettings?.logoURL ? (
                <img
                  src={orgSettings.logoURL}
                  alt="Organization Logo"
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <div className="font-semibold text-gray-900">
                  {getOrgDisplayName()}
                </div>
                {orgSettings?.tagline && user?.role === "principle" && (
                  <div className="text-xs text-gray-500">
                    {orgSettings.tagline}
                  </div>
                )}
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
              {/* Theme Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Palette className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("common.theme")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(themes).map(([key, value]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setTheme(key as any)}
                      className={theme === key ? "bg-blue-50" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded border"
                          style={{ backgroundColor: value.colors.primary }}
                        />
                        <span>{value.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

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
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("common.language")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => changeLanguage("en")}
                    className={i18n.language === "en" ? "bg-blue-50" : ""}
                  >
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeLanguage("ur")}
                    className={i18n.language === "ur" ? "bg-blue-50" : ""}
                  >
                    '1/H (Urdu)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
