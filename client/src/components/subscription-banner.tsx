import { AlertCircle, Clock, XCircle, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useSubscription } from "@/hooks/use-subscription";

export function SubscriptionBanner() {
  const { data: subscriptionData, isLoading } = useSubscription();
  const [, setLocation] = useLocation();

  if (isLoading || !subscriptionData) {
    return null;
  }

  const { subscription, status } = subscriptionData;

  // Don't show banner if everything is fine
  if (status.status === "active" && subscription.status !== "trial") {
    return null;
  }

  const handleUpgrade = () => {
    setLocation("/package-builder");
  };

  // Trial active - show info banner
  if (subscription.status === "trial" && status.status === "active") {
    return (
      <Alert className="bg-blue-50 border-blue-200 mb-4">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Free Trial Active</AlertTitle>
        <AlertDescription className="text-blue-800">
          {status.message}
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpgrade}
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              View Packages
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Trial warning - 2 days or less remaining
  if (subscription.status === "trial" && status.status === "warning") {
    return (
      <Alert className="bg-yellow-50 border-yellow-400 mb-4">
        <Clock className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-900 font-bold">Trial Expiring Soon!</AlertTitle>
        <AlertDescription className="text-yellow-800">
          {status.message}
          <div className="mt-2 space-x-2">
            <Button
              size="sm"
              onClick={handleUpgrade}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Purchase Package Now
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Trial expired - grace period
  if (subscription.status === "trial" && status.status === "expired") {
    return (
      <Alert className="bg-orange-50 border-orange-400 mb-4">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900 font-bold">Free Trial Expired</AlertTitle>
        <AlertDescription className="text-orange-800">
          {status.message}
          <div className="mt-3 space-y-2">
            <p className="font-semibold">
              Purchase a package now to keep all your data and continue using ARKA Services.
            </p>
            <Button
              size="sm"
              onClick={handleUpgrade}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Purchase Package Now
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Account blocked
  if (subscription.status === "blocked" || status.status === "blocked") {
    return (
      <Alert className="bg-red-50 border-red-500 mb-4">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-900 font-bold">Account Blocked</AlertTitle>
        <AlertDescription className="text-red-800">
          {status.message}
          <div className="mt-3 space-y-2">
            <p className="font-semibold">
              Your account has been blocked. All your data is safely preserved.
            </p>
            <p>Purchase a package to restore full access to your account.</p>
            <Button
              size="sm"
              onClick={handleUpgrade}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Purchase Package to Restore Access
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Paid subscription warning
  if (subscription.status === "active" && status.status === "warning") {
    return (
      <Alert className="bg-yellow-50 border-yellow-400 mb-4">
        <Clock className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-900 font-bold">Subscription Expiring Soon</AlertTitle>
        <AlertDescription className="text-yellow-800">
          {status.message}
          <div className="mt-2">
            <Button
              size="sm"
              onClick={handleUpgrade}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Renew Subscription
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Paid subscription expired
  if (subscription.status === "active" && status.status === "expired") {
    return (
      <Alert className="bg-orange-50 border-orange-400 mb-4">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900 font-bold">Subscription Expired</AlertTitle>
        <AlertDescription className="text-orange-800">
          {status.message}
          <div className="mt-2">
            <Button
              size="sm"
              onClick={handleUpgrade}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Renew Subscription
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
