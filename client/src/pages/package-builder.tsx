import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/lib/auth";
import {
  Building2,
  Users,
  FolderKanban,
  DollarSign,
  Check,
  ArrowLeft,
  Sparkles,
  Shield,
} from "lucide-react";

const SUBSCRIPTION_CONFIG = {
  BASE_FEE: 50,
  EMPLOYEE_FEE: 10,
  PROJECT_FEE: 5,
};

export default function PackageBuilder() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: subscriptionData } = useSubscription();
  const [numEmployees, setNumEmployees] = useState(1);
  const [numProjects, setNumProjects] = useState(1);

  const calculateTotal = () => {
    return (
      SUBSCRIPTION_CONFIG.BASE_FEE +
      numEmployees * SUBSCRIPTION_CONFIG.EMPLOYEE_FEE +
      numProjects * SUBSCRIPTION_CONFIG.PROJECT_FEE
    );
  };

  const handlePurchase = () => {
    // TODO: Integrate with payment gateway (Stripe/PayFast)
    alert("Payment integration will be added soon. Please contact support to activate your package.");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/20 border border-primary/50 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground tracking-wide">
                  ARKA SERVICES
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Custom Package Builder
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              Build Your Custom Package
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose exactly what you need. Pay only for what you use.
            </p>
          </div>

          {/* Current Subscription Status */}
          {subscriptionData && subscriptionData.subscription.status === "trial" && (
            <Card className="mb-8 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      You're currently on a free trial
                    </h3>
                    <p className="text-sm text-blue-800">
                      Purchase a package to unlock all features and keep your data after the trial ends.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Package Builder Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Base Account
                  </CardTitle>
                  <CardDescription>
                    Includes dashboard, basic features, and support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Base Fee (Required)</div>
                    <div className="text-2xl font-bold text-primary">
                      ${SUBSCRIPTION_CONFIG.BASE_FEE}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Employees
                  </CardTitle>
                  <CardDescription>
                    Add employees to your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="employees">Number of Employees</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNumEmployees(Math.max(0, numEmployees - 1))}
                        disabled={numEmployees === 0}
                      >
                        -
                      </Button>
                      <Input
                        id="employees"
                        type="number"
                        min="0"
                        max="1000"
                        value={numEmployees}
                        onChange={(e) => setNumEmployees(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-24 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNumEmployees(numEmployees + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      ${SUBSCRIPTION_CONFIG.EMPLOYEE_FEE} × {numEmployees} employees
                    </span>
                    <span className="font-semibold">
                      ${numEmployees * SUBSCRIPTION_CONFIG.EMPLOYEE_FEE}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="w-5 h-5" />
                    Projects
                  </CardTitle>
                  <CardDescription>
                    Manage multiple projects simultaneously
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="projects">Number of Projects</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNumProjects(Math.max(0, numProjects - 1))}
                        disabled={numProjects === 0}
                      >
                        -
                      </Button>
                      <Input
                        id="projects"
                        type="number"
                        min="0"
                        max="1000"
                        value={numProjects}
                        onChange={(e) => setNumProjects(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-24 text-center"
                      >
                      </Input>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setNumProjects(numProjects + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      ${SUBSCRIPTION_CONFIG.PROJECT_FEE} × {numProjects} projects
                    </span>
                    <span className="font-semibold">
                      ${numProjects * SUBSCRIPTION_CONFIG.PROJECT_FEE}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-2 border-primary/20">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Package Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Base Fee</span>
                      <span className="font-medium">${SUBSCRIPTION_CONFIG.BASE_FEE}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Employees ({numEmployees})</span>
                      <span className="font-medium">${numEmployees * SUBSCRIPTION_CONFIG.EMPLOYEE_FEE}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Projects ({numProjects})</span>
                      <span className="font-medium">${numProjects * SUBSCRIPTION_CONFIG.PROJECT_FEE}</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">Total per Month</span>
                      <span className="font-bold text-2xl text-primary">
                        ${calculateTotal()}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm mb-3">What's Included:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Full dashboard access</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">PDF & Excel exports</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Unlimited data storage</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Email support</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">All future updates</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePurchase}
                    disabled={numEmployees === 0 && numProjects === 0}
                  >
                    Purchase Package
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    You can upgrade or downgrade anytime
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Secure & Reliable</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is encrypted and backed up automatically
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Flexible Billing</h3>
                <p className="text-sm text-muted-foreground">
                  Only pay for what you need. Adjust anytime.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Expert Support</h3>
                <p className="text-sm text-muted-foreground">
                  Our team is here to help you succeed
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
