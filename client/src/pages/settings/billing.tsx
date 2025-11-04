import { useTranslation } from "react-i18next";
import { CreditCard, Package, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Billing() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("settings.billing")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>You are currently on the Professional plan</CardDescription>
            </div>
            <Badge className="text-lg px-4 py-2">
              Professional
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Monthly Subscription</span>
              </div>
              <span className="font-semibold">$49.00 / month</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Next billing date</span>
              </div>
              <span className="text-sm text-muted-foreground">December 1, 2025</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2026</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border p-6 bg-amber-50/50 border-amber-200">
        <h3 className="font-semibold text-amber-900 mb-2">Placeholder Section</h3>
        <p className="text-sm text-amber-800">
          Full billing features including Stripe integration, invoice history, and payment management
          will be implemented in a future update.
        </p>
      </div>
    </div>
  );
}
