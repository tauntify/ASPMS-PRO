import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle, Shield, DollarSign, ArrowRight } from "lucide-react";

export default function BlockedAccount() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <Card className="border-2 border-red-500">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-red-900 mb-2">
                Account Blocked
              </CardTitle>
              <CardDescription className="text-lg">
                Your free trial has expired
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="bg-red-50 border-red-200">
              <Shield className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-900">Your data is safe!</AlertTitle>
              <AlertDescription className="text-red-800">
                All your projects, employees, and data are safely preserved and will be
                immediately accessible once you purchase a package.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What happened?</h3>
              <p className="text-muted-foreground">
                Your 3-day free trial has ended. To continue using ARKA Services and access
                your data, you need to purchase a subscription package.
              </p>

              <h3 className="font-semibold text-lg mt-6">What's included in a package?</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Full access to all your projects and data</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Add unlimited employees and manage your team</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Create and manage multiple projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Export reports in PDF and Excel formats</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Budget tracking and financial management</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Timesheet and attendance management</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>All future updates and features</span>
                </li>
              </ul>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Flexible Pricing</h4>
                  <p className="text-sm text-muted-foreground">
                    Build your own package: $50 base fee + $10 per employee + $5 per project
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                className="flex-1"
                size="lg"
                onClick={() => setLocation("/package-builder")}
              >
                Purchase Package Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setLocation("/login")}
                className="flex-1"
              >
                Back to Login
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Need help? Contact us at support@arka.pk
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
