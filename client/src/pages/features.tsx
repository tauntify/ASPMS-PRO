import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Clock,
  Receipt,
  Wallet,
  Users,
  BarChart3,
  FileText,
  Shield,
  Calendar,
  TrendingUp,
  Package,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

export default function Features() {
  const [, setLocation] = useLocation();

  const featureCategories = [
    {
      title: "Project Management",
      icon: Building2,
      description: "Complete project lifecycle management",
      features: [
        {
          icon: Building2,
          name: "Project Tracking",
          description: "Create and manage unlimited projects with customizable divisions, items, and budgets"
        },
        {
          icon: Users,
          name: "Team Assignment",
          description: "Assign employees and clients to projects with role-based permissions"
        },
        {
          icon: FileText,
          name: "Task Management",
          description: "Break down projects into tasks with priorities, deadlines, and progress tracking"
        },
        {
          icon: Calendar,
          name: "Milestone Tracking",
          description: "Set and monitor project milestones to stay on schedule"
        }
      ]
    },
    {
      title: "Time & Attendance",
      icon: Clock,
      description: "Comprehensive time tracking and management",
      features: [
        {
          icon: Clock,
          name: "Timesheet Management",
          description: "Track billable and non-billable hours with daily time logging"
        },
        {
          icon: Calendar,
          name: "Attendance Tracking",
          description: "Monitor employee attendance with automatic integration to timesheets"
        },
        {
          icon: CheckCircle2,
          name: "Approval Workflows",
          description: "Submit and approve timesheets with proper authorization controls"
        },
        {
          icon: BarChart3,
          name: "Time Analytics",
          description: "Weekly and monthly summaries with productivity insights"
        }
      ]
    },
    {
      title: "Financial Management",
      icon: Wallet,
      description: "Complete financial oversight and control",
      features: [
        {
          icon: Receipt,
          name: "Billing & Invoicing",
          description: "Generate professional invoices with automatic tax, overhead, and G&A calculations"
        },
        {
          icon: Wallet,
          name: "Expense Tracking",
          description: "Track project expenses by category with approval and reimbursement workflows"
        },
        {
          icon: TrendingUp,
          name: "Budget Management",
          description: "Set and monitor project budgets with real-time variance tracking"
        },
        {
          icon: BarChart3,
          name: "Financial Reporting",
          description: "Comprehensive financial dashboards and reports for informed decision-making"
        }
      ]
    },
    {
      title: "Team Management",
      icon: Users,
      description: "Efficient employee and resource management",
      features: [
        {
          icon: Users,
          name: "Employee Management",
          description: "Maintain complete employee profiles with salary, designation, and contact information"
        },
        {
          icon: Package,
          name: "Resource Allocation",
          description: "Optimize team utilization with resource planning and workload management"
        },
        {
          icon: FileText,
          name: "Document Management",
          description: "Store and organize employee documents securely"
        },
        {
          icon: TrendingUp,
          name: "Salary Management",
          description: "Track salaries, advances, and payment history with automatic calculations"
        }
      ]
    },
    {
      title: "Client Portal",
      icon: Building2,
      description: "Dedicated client access and collaboration",
      features: [
        {
          icon: Building2,
          name: "Client Dashboards",
          description: "Clients can view their project status, budgets, and timelines"
        },
        {
          icon: Receipt,
          name: "Invoice Access",
          description: "Clients can view and download invoices directly"
        },
        {
          icon: FileText,
          name: "Project Updates",
          description: "Real-time project progress visibility for clients"
        },
        {
          icon: Shield,
          name: "Secure Access",
          description: "Role-based permissions ensure data privacy and security"
        }
      ]
    },
    {
      title: "Reporting & Analytics",
      icon: BarChart3,
      description: "Insights to drive better decisions",
      features: [
        {
          icon: BarChart3,
          name: "Project Analytics",
          description: "Track project performance, budget utilization, and timeline adherence"
        },
        {
          icon: TrendingUp,
          name: "Financial Dashboards",
          description: "Real-time financial overview with revenue, expenses, and profitability"
        },
        {
          icon: Users,
          name: "Team Performance",
          description: "Monitor employee productivity, utilization, and contributions"
        },
        {
          icon: Receipt,
          name: "Custom Reports",
          description: "Generate detailed reports for clients, management, and stakeholders"
        }
      ]
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
            Powerful Features for Professional Teams
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Everything you need to manage architecture and interior design projects from start to finish
          </p>
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, categoryIndex) => (
        <section
          key={categoryIndex}
          className={`container mx-auto px-4 py-16 ${categoryIndex % 2 === 1 ? 'bg-card/30' : ''}`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <category.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-display font-bold mb-4">{category.title}</h3>
              <p className="text-xl text-muted-foreground">{category.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {category.features.map((feature, featureIndex) => (
                <Card key={featureIndex} className="hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2">{feature.name}</CardTitle>
                        <CardDescription className="text-base">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-display font-bold mb-6">
            Ready to Experience These Features?
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            Start your free trial today and see how ASPMS can transform your project management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setLocation("/signup")}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/pricing")}>
              View Pricing
            </Button>
          </div>
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
