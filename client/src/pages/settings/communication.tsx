import { useTranslation } from "react-i18next";
import { Mail, MessageSquare, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Communication() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("settings.communication")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure communication channels and branding
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about projects and tasks
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get push notifications on your device
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates via SMS
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Templates
          </h3>
          <div className="space-y-4">
            <div>
              <Label>Email Signature</Label>
              <Textarea
                placeholder="Add your email signature here..."
                className="mt-2 min-h-[120px]"
                defaultValue="Best regards,\nYour Studio Team"
              />
            </div>
            <Button variant="outline">Save Email Settings</Button>
          </div>
        </div>

        <Separator className="my-8" />

        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messaging Services
          </h3>
          <div className="rounded-lg border p-6 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              WhatsApp Business, Twilio, and SendGrid integrations will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
