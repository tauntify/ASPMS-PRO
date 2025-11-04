import { useTranslation } from "react-i18next";
import { Github, Chrome, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Integrations() {
  const { t } = useTranslation();

  const integrations = [
    {
      id: "github",
      name: "GitHub",
      description: "Connect your GitHub account for code synchronization and CI/CD",
      icon: Github,
      connected: false,
      status: "Available",
    },
    {
      id: "google",
      name: "Google Workspace",
      description: "Integrate with Google Drive, Calendar, and other services",
      icon: Chrome,
      connected: false,
      status: "Available",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("settings.integrations")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect third-party services and APIs
        </p>
      </div>

      <div className="grid gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  {integration.connected ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {t("integrations.connected")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50">
                      <XCircle className="h-3 w-3 mr-1" />
                      {t("integrations.notConnected")}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Status: {integration.status}
                  </p>
                  {integration.connected ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                      <Button variant="destructive" size="sm">
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm">
                      {t("integrations.connect")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="rounded-lg border p-6 bg-blue-50/50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Social Media Integrations</h3>
        <p className="text-sm text-blue-800">
          Facebook, Twitter, Instagram, Pinterest, and Snapchat integrations will be available soon.
          These features are currently disabled and will be enabled in a future update.
        </p>
      </div>
    </div>
  );
}
