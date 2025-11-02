import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Users,
  Clock,
  Receipt,
  TrendingUp,
  Shield,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Building2,
      title: "Project Management",
      description: "Comprehensive tools for architecture and interior design project tracking, from concept to completion."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Manage employees, clients, and procurement teams all in one unified platform."
    },
    {
      icon: Clock,
      title: "Timesheet Tracking",
      description: "Track billable and non-billable hours with automatic attendance integration and approval workflows."
    },
    {
      icon: Receipt,
      title: "Billing & Invoicing",
      description: "Generate professional invoices with automatic calculations for tax, overhead, and general administration."
    },
    {
      icon: TrendingUp,
      title: "Expense Management",
      description: "Track project expenses, employee reimbursements, and maintain complete financial transparency."
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Secure, role-based permissions ensure data privacy and proper access control across your organization."
    }
  ];

  const pricingPlans = [
    {
      name: "Individual",
      price: "$10",
      period: "per month",
      description: "Perfect for freelance architects and designers",
      features: [
        "Single user account",
        "Unlimited projects",
        "Timesheet management",
        "Basic invoicing",
        "Expense tracking",
        "Client portal access"
      ]
    },
    {
      name: "Organization",
      price: "$100",
      period: "per month",
      description: "Built for architecture firms and design studios",
      features: [
        "Unlimited principle accounts",
        "Add employees at $10/month each",
        "Advanced team management",
        "Multi-project tracking",
        "Resource allocation",
        "Comprehensive reporting",
        "Priority support"
      ],
      highlighted: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                ARKA SERVICES
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setLocation("/about")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </button>
              <button
                onClick={() => setLocation("/features")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => setLocation("/pricing")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
              <Button variant="outline" onClick={() => setLocation("/login")}>
                Login
              </Button>
              <Button onClick={() => setLocation("/signup")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            ARKA SERVICES PROJECT MANAGEMENT
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Professional project management platform designed for architecture and interior design professionals.
            Streamline your workflow, track budgets, and deliver excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg" onClick={() => setLocation("/signup")}>
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg" onClick={() => setLocation("/pricing")}>
              View Pricing
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Start managing projects in minutes
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-display font-bold mb-4">
              Everything You Need to Manage Projects
            </h3>
            <p className="text-xl text-muted-foreground">
              Powerful features designed specifically for architecture and design professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-display font-bold mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.highlighted ? 'border-primary shadow-lg shadow-primary/20' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-5xl font-display font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    size="lg"
                    onClick={() => setLocation("/signup")}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="link" onClick={() => setLocation("/pricing")}>
              View detailed pricing and features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-display font-bold mb-6">
            Ready to Transform Your Project Management?
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            Join architecture and design professionals who trust ASPMS for their project management needs
          </p>
          <Button size="lg" className="text-lg" onClick={() => setLocation("/signup")}>
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-display font-bold text-lg">ARKA SERVICES</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional project management for architecture and design
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setLocation("/features")}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLocation("/pricing")}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Pricing
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setLocation("/about")}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    About
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setLocation("/privacy")}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLocation("/terms")}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Terms & Conditions
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 ARKA Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
