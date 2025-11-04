import { useTranslation } from "react-i18next";
import { Server, Database, Code, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SystemInfo() {
  const { t } = useTranslation();

  const systemData = [
    {
      title: "Application Version",
      value: "2.0.0",
      icon: Code,
      status: "stable",
    },
    {
      title: "Database",
      value: "Firebase Firestore",
      icon: Database,
      status: "operational",
    },
    {
      title: "Hosting",
      value: "Firebase Cloud Functions",
      icon: Server,
      status: "operational",
    },
    {
      title: "Last Deployment",
      value: new Date().toLocaleDateString(),
      icon: Clock,
      status: "recent",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">System Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View technical details and system status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemData.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                  {item.status}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Response Time</span>
              <span className="font-semibold">~120ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <span className="font-semibold">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <span className="font-semibold">1</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Frontend</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>React 18</p>
                <p>TypeScript</p>
                <p>Tailwind CSS</p>
                <p>Vite</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Backend</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Node.js</p>
                <p>Express</p>
                <p>Firebase Admin</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Database</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Firestore</p>
                <p>Firebase Storage</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Services</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Firebase Auth</p>
                <p>Cloud Functions</p>
                <p>Firebase Hosting</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
