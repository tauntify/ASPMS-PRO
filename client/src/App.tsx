import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import PrincipleDashboard from "@/pages/principle-dashboard";
import EmployeeDashboard from "@/pages/employee-dashboard";
import ClientDashboard from "@/pages/client-dashboard";
import ProcurementDashboard from "@/pages/procurement-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminProfile from "@/pages/admin-profile";
import TimesheetManagement from "@/pages/timesheet-management";
import BillingInvoicing from "@/pages/billing-invoicing";
import ExpenseTracking from "@/pages/expense-tracking";
import PackageBuilder from "@/pages/package-builder";
import BlockedAccount from "@/pages/blocked";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import Landing from "@/pages/landing";
import About from "@/pages/about";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import PricingNew from "@/pages/pricing-new";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/use-subscription";
import { CookieConsent } from "@/components/cookie-consent";
import { setupGlobalErrorHandlers, setTrackingUserId } from "@/lib/error-tracking";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { data: subscriptionData, isLoading: subLoading } = useSubscription();

  // Show loading only while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" data-testid="loader-auth"></div>
          <p className="mt-4 text-muted-foreground" data-testid="text-loading">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Admin users bypass subscription checks completely
  if (user?.role === "admin") {
    return <Component />;
  }

  // For non-admin users, wait for subscription data to load
  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" data-testid="loader-auth"></div>
          <p className="mt-4 text-muted-foreground" data-testid="text-loading">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if account is blocked
  if (subscriptionData && subscriptionData.subscription.status === "blocked") {
    return <Redirect to="/blocked" />;
  }

  return <Component />;
}

function RoleDashboard() {
  const { user } = useAuth();

  // Show admin dashboard for admin users
  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  // Show principle dashboard for principle users
  if (user?.role === "principle") {
    return <PrincipleDashboard />;
  }

  // Show employee dashboard for employee users
  if (user?.role === "employee") {
    return <EmployeeDashboard />;
  }

  // Show client dashboard for client users
  if (user?.role === "client") {
    return <ClientDashboard />;
  }

  // Show procurement dashboard for procurement users
  if (user?.role === "procurement") {
    return <ProcurementDashboard />;
  }

  // Show regular dashboard for other users
  return <Dashboard />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Landing} />
      <Route path="/about" component={About} />
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={PricingNew} />
      <Route path="/pricing-old" component={Pricing} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/blocked" component={BlockedAccount} />

      {/* Protected Routes */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={RoleDashboard} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} />}
      </Route>
      <Route path="/admin/profile">
        {() => <ProtectedRoute component={AdminProfile} />}
      </Route>
      <Route path="/budget">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/timesheet-management">
        {() => <ProtectedRoute component={TimesheetManagement} />}
      </Route>
      <Route path="/billing-invoicing">
        {() => <ProtectedRoute component={BillingInvoicing} />}
      </Route>
      <Route path="/expense-tracking">
        {() => <ProtectedRoute component={ExpenseTracking} />}
      </Route>
      <Route path="/package-builder">
        {() => <ProtectedRoute component={PackageBuilder} />}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user } = useAuth();

  // Set user ID for tracking when user logs in
  useEffect(() => {
    if (user?.id) {
      setTrackingUserId(user.id);
    }
  }, [user?.id]);

  return (
    <TooltipProvider>
      <Toaster />
      <CookieConsent />
      <Router />
    </TooltipProvider>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");

    // Setup global error handlers
    setupGlobalErrorHandlers();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
