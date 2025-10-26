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
import TimesheetManagement from "@/pages/timesheet-management";
import BillingInvoicing from "@/pages/billing-invoicing";
import ExpenseTracking from "@/pages/expense-tracking";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

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

  return <Component />;
}

function RoleDashboard() {
  const { user } = useAuth();
  
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
      <Route path="/login" component={Login} />
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
      <Route path="/">
        {() => <ProtectedRoute component={RoleDashboard} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
