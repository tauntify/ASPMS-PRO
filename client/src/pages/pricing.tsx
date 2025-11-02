import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle2, ArrowLeft, User, Users } from "lucide-react";

export default function Pricing() {
  const [, setLocation] = useLocation();

  const plans = [
    {
      name: "Individual",
      icon: User,
      price: "$10",
      period: "per month",
      description: "Perfect for freelance architects and interior designers",
      features: [
        "Single user account",
        "Unlimited projects",
        "Project budget tracking",
        "Task management",
        "Timesheet management",
        "Billable & non-billable hours",
        "Basic invoicing",
        "Expense tracking",
        "Client portal access",
        "Document storage",
        "Standard support"
      ],
      benefits: [
        "Manage multiple projects efficiently",
        "Track time and generate invoices",
        "Maintain professional client relationships",
        "Keep all project data organized"
      ],
      ctaText: "Start Individual Plan"
    },
    {
      name: "Organization",
      icon: Users,
      price: "$100",
      period: "per month",
      additionalCost: "+ $10 per employee",
      description: "Built for architecture firms and design studios",
      features: [
        "Unlimited principle accounts",
        "Add employees at $10/month each",
        "All Individual features",
        "Advanced team management",
        "Employee role assignments",
        "Multi-project coordination",
        "Resource allocation & planning",
        "Advanced billing & invoicing",
        "Expense approval workflows",
        "Salary management",
        "Attendance tracking",
        "Comprehensive reporting",
        "Team performance analytics",
        "Client collaboration tools",
        "Priority support"
      ],
      benefits: [
        "Scale your team as you grow",
        "Complete visibility into team performance",
        "Streamline financial management",
        "Automated payroll and billing",
        "Enterprise-grade security"
      ],
      ctaText: "Start Organization Plan",
      highlighted: true
    }
  ];

  const comparisonFeatures = [
    {
      category: "Project Management",
      features: [
        { name: "Unlimited Projects", individual: true, organization: true },
        { name: "Project Budget Tracking", individual: true, organization: true },
        { name: "Task Management", individual: true, organization: true },
        { name: "Milestone Tracking", individual: true, organization: true },
        { name: "Resource Allocation", individual: false, organization: true },
        { name: "Multi-Project Dashboards", individual: false, organization: true }
      ]
    },
    {
      category: "Team & Users",
      features: [
        { name: "Number of Users", individual: "1", organization: "Unlimited" },
        { name: "Employee Management", individual: false, organization: true },
        { name: "Role-Based Access", individual: "Basic", organization: "Advanced" },
        { name: "Team Assignments", individual: false, organization: true }
      ]
    },
    {
      category: "Time & Attendance",
      features: [
        { name: "Timesheet Management", individual: true, organization: true },
        { name: "Billable Hours Tracking", individual: true, organization: true },
        { name: "Attendance Tracking", individual: false, organization: true },
        { name: "Approval Workflows", individual: false, organization: true }
      ]
    },
    {
      category: "Financial",
      features: [
        { name: "Invoicing", individual: "Basic", organization: "Advanced" },
        { name: "Expense Tracking", individual: true, organization: true },
        { name: "Salary Management", individual: false, organization: true },
        { name: "Financial Reporting", individual: "Basic", organization: "Advanced" }
      ]
    }
  ];

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      );
    }
    return <span className="text-sm">{value}</span>;
  };

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
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setLocation("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <Button onClick={() => setLocation("/signup")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.highlighted ? 'border-primary shadow-xl shadow-primary/20 scale-105' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <plan.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-3xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-6xl font-display font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground ml-2 text-lg">{plan.period}</span>
                  </div>
                  {plan.additionalCost && (
                    <p className="text-sm text-muted-foreground font-medium">{plan.additionalCost}</p>
                  )}
                  <CardDescription className="text-base mt-4">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-8">
                    <h4 className="font-semibold mb-4 text-lg">Features Included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-8 p-6 bg-card/50 rounded-lg border border-border">
                    <h4 className="font-semibold mb-4 text-lg">Key Benefits:</h4>
                    <ul className="space-y-2">
                      {plan.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => setLocation("/signup")}
                  >
                    {plan.ctaText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Comparison */}
      <section className="container mx-auto px-4 py-20 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-display font-bold mb-4">Detailed Feature Comparison</h3>
            <p className="text-xl text-muted-foreground">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-muted/30 font-semibold border-b border-border">
              <div>Feature</div>
              <div className="text-center">Individual</div>
              <div className="text-center">Organization</div>
            </div>
            {comparisonFeatures.map((category, catIndex) => (
              <div key={catIndex}>
                <div className="bg-muted/50 px-6 py-4 border-b border-border">
                  <h4 className="font-display font-semibold text-lg">{category.category}</h4>
                </div>
                <div className="divide-y divide-border">
                  {category.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="grid grid-cols-3 gap-4 px-6 py-4 items-center">
                      <div className="col-span-1 text-muted-foreground">
                        {feature.name}
                      </div>
                      <div className="text-center">
                        {renderFeatureValue(feature.individual)}
                      </div>
                      <div className="text-center">
                        {renderFeatureValue(feature.organization)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Notes */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle>Pricing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Organization Plan Pricing</h4>
                <p>
                  The Organization plan is billed at $100/month base fee plus $10/month for each employee account you create.
                  For example, an organization with 5 employees would pay $100 + (5 × $10) = $150/month.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Adding Employees</h4>
                <p>
                  As an organization administrator, you can create and manage employee accounts from your dashboard.
                  Each additional employee is automatically billed at $10/month.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Payment Integration</h4>
                <p>
                  Full payment integration coming soon. During this period, enjoy all features without payment requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-display font-bold mb-6">
            Ready to Get Started?
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            Choose your plan and start managing projects like a pro
          </p>
          <Button size="lg" onClick={() => setLocation("/signup")}>
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 ARKA Services. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
