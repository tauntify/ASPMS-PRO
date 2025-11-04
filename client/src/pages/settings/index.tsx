import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Users,
  CreditCard,
  Mail,
  Shield,
  Plug2,
  Palette,
  Globe,
  Info,
  FolderOpen,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StudioProfile from "./studio-profile";
import UsersRoles from "./users-roles";
import Security from "./security";
import Integrations from "./integrations";
import Billing from "./billing";
import Communication from "./communication";
import ThemesTab from "./themes";
import LanguageTab from "./language";
import SystemInfo from "./system-info";
import ProjectSettings from "./project-settings";

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("studio");

  const tabs = [
    {
      value: "studio",
      label: t("settings.studioProfile"),
      icon: Building2,
      component: StudioProfile,
    },
    {
      value: "projects",
      label: "Project Settings",
      icon: FolderOpen,
      component: ProjectSettings,
    },
    {
      value: "users",
      label: t("settings.usersRoles"),
      icon: Users,
      component: UsersRoles,
    },
    {
      value: "security",
      label: t("settings.security"),
      icon: Shield,
      component: Security,
    },
    {
      value: "integrations",
      label: t("settings.integrations"),
      icon: Plug2,
      component: Integrations,
    },
    {
      value: "billing",
      label: t("settings.billing"),
      icon: CreditCard,
      component: Billing,
    },
    {
      value: "communication",
      label: t("settings.communication"),
      icon: Mail,
      component: Communication,
    },
    {
      value: "themes",
      label: t("settings.themes"),
      icon: Palette,
      component: ThemesTab,
    },
    {
      value: "language",
      label: t("settings.languages"),
      icon: Globe,
      component: LanguageTab,
    },
    {
      value: "system",
      label: "System Info",
      icon: Info,
      component: SystemInfo,
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-2">
          Manage your studio configuration, integrations, and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-10 gap-2 h-auto p-2 bg-muted/50">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-background"
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <tab.component />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
