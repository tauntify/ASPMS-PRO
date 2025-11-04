import { useTranslation } from "react-i18next";
import { Shield, Lock, Key, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Security() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("settings.security")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage security settings and access controls
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Button variant="outline">
            <Key className="h-4 w-4 mr-2" />
            Enable 2FA
          </Button>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Session Timeout</Label>
            <p className="text-sm text-muted-foreground">
              Automatically logout after 30 minutes of inactivity
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Login Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when someone logs into your account
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <Separator />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5" />
            <h3 className="font-semibold">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm border-l-2 border-green-500 pl-3 py-2">
              <div>
                <p className="font-medium">Login from Chrome</p>
                <p className="text-muted-foreground text-xs">IP: 192.168.1.1</p>
              </div>
              <span className="text-muted-foreground text-xs">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between text-sm border-l-2 border-blue-500 pl-3 py-2">
              <div>
                <p className="font-medium">Settings updated</p>
                <p className="text-muted-foreground text-xs">Studio profile changed</p>
              </div>
              <span className="text-muted-foreground text-xs">1 day ago</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Button variant="outline">
            <Lock className="h-4 w-4 mr-2" />
            {t("common.changePassword")}
          </Button>
        </div>
      </div>
    </div>
  );
}
