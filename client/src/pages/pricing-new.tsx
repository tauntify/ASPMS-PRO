import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Users, Building2, Zap, ArrowRight, Crown } from "lucide-react";

export default function PricingNew() {
  const [, setLocation] = useLocation();

  const plans = [
    {
      id: "trial",
      name: "Free Trial",
      price: "Free",
      duration: "3 days",
      description: "Try ARKA Services with no commitment",
      icon: Sparkles,
      color: "blue",
      popular: false,
      features: [
        "Full dashboard access",
        "View all features",
        "JPEG exports only",
        "Watermarked exports",
        "3-day trial period",
        "No credit card required",
      ],
      limitations: [
        "Cannot add employees",
        "Cannot add projects",
        "No PDF/Excel exports",
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
      accountType: "trial",
    },
    {
      id: "individual",
      name: "Individual Plan",
      price: "$10",
      duration: "/month",
      description: "Perfect for freelancers and solo professionals",
      icon: Users,
      color: "green",
      popular: false,
      features: [
        "Up to 5 projects",
        "Single user account",
        "PDF & Excel exports",
        "No watermarks",
        "Budget tracking",
        "Timesheet management",
        "Expense tracking",
        "Email support",
        "All core features",
      ],
      buttonText: "Get Started",
      buttonVariant: "default" as const,
      accountType: "individual",
      maxEmployees: 0,
      maxProjects: 5,
      maxAccounts: 1,
    },
    {
      id: "custom",
      name: "Custom Plan",
      price: "$50+",
      duration: "/month",
      description: "Build your own plan based on your needs",
      icon: Zap,
      color: "purple",
      popular: true,
      features: [
        "Base: $50/month",
        "Up to 5 employees",
        "Up to 10 projects",
        "5 user accounts",
        "Add more: $10/employee, $5/project",
        "PDF & Excel exports",
        "No watermarks",
        "All features included",
        "Priority support",
      ],
      buttonText: "Build Your Plan",
      buttonVariant: "default" as const,
      accountType: "custom",
      maxEmployees: 5,
      maxProjects: 10,
      maxAccounts: 5,
    },
    {
      id: "organization",
      name: "Organization Plan",
      price: "$300",
      duration: "/month",
      description: "For teams and enterprises with advanced needs",
      icon: Building2,
      color: "orange",
      popular: false,
      features: [
        "Up to 30 employees",
        "Up to 50 projects",
        "Unlimited user accounts",
        "All export formats",
        "Advanced reporting",
        "Team collaboration",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
        "All privileges included",
      ],
      buttonText: "Get Started",
      buttonVariant: "default" as const,
      accountType: "organization",
      maxEmployees: 30,
      maxProjects: 50,
      maxAccounts: -1, // Unlimited
    },
  ];

  const handlePlanSelect = (plan: typeof plans[0]) => {
    if (plan.id === "trial") {
      // Go to signup with trial
      setLocation(`/signup?plan=trial`);
    } else if (plan.id === "custom") {
      // Go to package builder
      setLocation("/package-builder");
    } else if (plan.id === "individual") {
      // Go to signup with individual plan
      setLocation(`/signup?plan=individual`);
    } else if (plan.id === "organization") {
      // Go to signup with organization plan
      setLocation(`/signup?plan=organization`);
    }
  };

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/20 border border-primary/50 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground tracking-wide">
                  ARKA SERVICES
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Choose Your Plan
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-display font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Start with a free trial, pick a fixed plan, or build your own.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${
                  plan.popular ? 'border-2 border-primary shadow-lg scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-6">
                  <div className="mb-4 mx-auto">
                    <div className={`w-16 h-16 rounded-xl ${colorClasses[plan.color as keyof typeof colorClasses]} bg-opacity-10 border-2 ${colorClasses[plan.color as keyof typeof colorClasses].replace('bg-', 'border-')} flex items-center justify-center`}>
                      <Icon className={`w-8 h-8 ${colorClasses[plan.color as keyof typeof colorClasses].replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-sm min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.duration && (
                      <span className="text-muted-foreground ml-2">{plan.duration}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations && plan.limitations.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2 font-semibold">
                        Trial Limitations:
                      </p>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-xs text-muted-foreground">• {limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.buttonVariant}
                    size="lg"
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens after my free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  After your 3-day trial ends, you'll need to purchase a plan to continue using ARKA Services.
                  All your data will be preserved and immediately accessible once you subscribe.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. If you have a custom plan,
                  you can adjust the number of employees and projects as your needs change.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's included in the Individual Plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The Individual Plan is perfect for freelancers and solo professionals at just $10/month.
                  You get up to 5 projects with a single user account and all core features included.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does the Custom Plan work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Start at $50/month base fee, then add exactly what you need: $10 per employee and $5 per project.
                  Perfect for growing businesses that need flexibility.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="max-w-3xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-4">
                Not sure which plan is right for you?
              </h3>
              <p className="text-muted-foreground mb-6">
                Start with a free trial to explore all features, or contact our team for personalized recommendations.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" onClick={() => setLocation("/signup?plan=trial")}>
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.location.href = "mailto:support@arka.pk"}>
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
