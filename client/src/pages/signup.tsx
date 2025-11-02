import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { loginWithGoogle } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Users, AlertCircle, ArrowLeft, Eye, EyeOff, Crown, Sparkles, Zap } from "lucide-react";

type AccountType = "individual" | "organization";
type PlanType = "trial" | "individual" | "custom" | "organization";

export default function Signup() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const planParam = urlParams.get('plan') as PlanType | null;

  const [accountType, setAccountType] = useState<AccountType | null>(
    planParam === "organization" ? "organization" :
    planParam === "individual" || planParam === "trial" ? "individual" : null
  );
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(planParam);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    organizationName: "" // Only for organization accounts
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Signup failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Store token and redirect to dashboard
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      window.location.href = "/dashboard";
    }
  });

  const googleSignupMutation = useMutation({
    mutationFn: async () => {
      if (!accountType) {
        throw new Error("Please select an account type first");
      }
      if (!acceptedTerms) {
        throw new Error("You must accept the terms and conditions");
      }
      // Store account type preference for Google signup
      sessionStorage.setItem('signup_account_type', accountType);
      await loginWithGoogle();
    }
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (accountType === "organization" && !formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }

    if (!acceptedTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountType) {
      setErrors({ accountType: "Please select an account type" });
      return;
    }

    if (!validateForm()) {
      return;
    }

    signupMutation.mutate({
      ...formData,
      accountType,
      role: accountType === "individual" ? "principle" : "principle" // Both get principle role initially
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Step 1: Account Type Selection
  if (!accountType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>

            {/* Selected Plan Badge */}
            {selectedPlan && (
              <div className="mb-6">
                <Badge variant="outline" className="text-lg px-6 py-2">
                  {selectedPlan === "trial" && (
                    <><Sparkles className="w-4 h-4 mr-2" /> Free Trial - 3 Days</>
                  )}
                  {selectedPlan === "individual" && (
                    <><User className="w-4 h-4 mr-2" /> Individual Plan - $50/month</>
                  )}
                  {selectedPlan === "custom" && (
                    <><Zap className="w-4 h-4 mr-2" /> Custom Plan - Build Your Own</>
                  )}
                  {selectedPlan === "organization" && (
                    <><Crown className="w-4 h-4 mr-2" /> Organization Plan</>
                  )}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-4"
                  onClick={() => setLocation("/pricing")}
                >
                  Change Plan
                </Button>
              </div>
            )}

            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              {selectedPlan ? "Create Your Account" : "Choose Your Account Type"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {selectedPlan ? `Complete signup to start your ${selectedPlan === "trial" ? "free trial" : "subscription"}` : "Select the plan that best fits your needs"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Individual Account */}
            <Card
              className="cursor-pointer hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              onClick={() => setAccountType("individual")}
            >
              <CardHeader className="text-center pb-8">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-2">Individual</CardTitle>
                <div className="mb-2">
                  <span className="text-5xl font-display font-bold text-primary">$10</span>
                  <span className="text-muted-foreground ml-2">per month</span>
                </div>
                <CardDescription className="text-base">
                  Perfect for freelance architects and designers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">✓</span>
                    <span>Single user account</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">✓</span>
                    <span>Unlimited projects</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">✓</span>
                    <span>Full project management features</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">✓</span>
                    <span>Timesheet & invoicing</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => setAccountType("individual")}>
                  Select Individual
                </Button>
              </CardContent>
            </Card>

            {/* Organization Account */}
            <Card
              className="cursor-pointer hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 border-primary/50"
              onClick={() => setAccountType("organization")}
            >
              <CardHeader className="text-center pb-8">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-2">Organization</CardTitle>
                <div className="mb-2">
                  <span className="text-5xl font-display font-bold text-primary">$100</span>
                  <span className="text-muted-foreground ml-2">per month</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium mb-2">+ $10 per employee</p>
                <CardDescription className="text-base">
                  Built for architecture firms and design studios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">✓</span>
                    <span>Unlimited principle accounts</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">✓</span>
                    <span>Add employees ($10/month each)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">✓</span>
                    <span>Team management & resource allocation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">✓</span>
                    <span>Advanced reporting & analytics</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => setAccountType("organization")}>
                  Select Organization
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Signup Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Button variant="ghost" onClick={() => setAccountType(null)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change Account Type
          </Button>
          <div className="flex items-center justify-center gap-2 mb-2">
            {accountType === "individual" ? (
              <User className="h-8 w-8 text-primary" />
            ) : (
              <Users className="h-8 w-8 text-primary" />
            )}
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {accountType === "individual" ? "Individual" : "Organization"} Signup
            </h1>
          </div>
          <p className="text-muted-foreground">
            Create your ASPMS account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Fill in your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {signupMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {signupMutation.error instanceof Error
                      ? signupMutation.error.message
                      : "Signup failed. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {accountType === "organization" && (
                <div className="space-y-2">
                  <Label htmlFor="organizationName">
                    Organization Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="Enter organization name"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange("organizationName", e.target.value)}
                    disabled={signupMutation.isPending}
                  />
                  {errors.organizationName && (
                    <p className="text-sm text-destructive">{errors.organizationName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  disabled={signupMutation.isPending}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={signupMutation.isPending}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={signupMutation.isPending}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  disabled={signupMutation.isPending}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={signupMutation.isPending}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    disabled={signupMutation.isPending}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-start space-x-2 py-4">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => {
                    setAcceptedTerms(checked as boolean);
                    if (errors.terms) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.terms;
                        return newErrors;
                      });
                    }
                  }}
                  disabled={signupMutation.isPending}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the{" "}
                  <button
                    type="button"
                    onClick={() => window.open("/terms", "_blank")}
                    className="text-primary hover:underline"
                  >
                    Terms & Conditions
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => window.open("/privacy", "_blank")}
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-destructive">{errors.terms}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={signupMutation.isPending || googleSignupMutation.isPending}
              >
                {signupMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  OR
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => googleSignupMutation.mutate()}
                disabled={signupMutation.isPending || googleSignupMutation.isPending}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {googleSignupMutation.isPending ? "Signing in..." : "Sign up with Google"}
              </Button>
            </form>

            {googleSignupMutation.isError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {googleSignupMutation.error instanceof Error
                    ? googleSignupMutation.error.message
                    : "Google signup failed"}
                </AlertDescription>
              </Alert>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <button
                onClick={() => setLocation("/login")}
                className="text-primary hover:underline"
              >
                Login here
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
