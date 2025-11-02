import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Target, Users, Zap, ArrowLeft } from "lucide-react";

export default function About() {
  const [, setLocation] = useLocation();

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
            About ARKA SERVICES
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Empowering architecture and interior design professionals with cutting-edge project management tools
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-3xl font-display font-bold mb-4">Our Mission</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                ARKA SERVICES Project Management System (ASPMS) was built with a singular focus: to provide architecture and interior design professionals with a comprehensive, intuitive platform that handles every aspect of project management.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We understand the unique challenges of managing design projects - from tracking billable hours and managing budgets to coordinating teams and maintaining client relationships. ASPMS brings all these elements together in one powerful system.
              </p>
            </div>
            <Card className="bg-card/50 border-primary/20">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-display font-semibold text-xl mb-2 text-primary">Designed for Professionals</h4>
                    <p className="text-muted-foreground">
                      Built specifically for the workflows and requirements of architecture and interior design firms
                    </p>
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-xl mb-2 text-primary">Comprehensive Solution</h4>
                    <p className="text-muted-foreground">
                      From timesheets to invoicing, expense tracking to resource management - everything in one place
                    </p>
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-xl mb-2 text-primary">Scalable & Flexible</h4>
                    <p className="text-muted-foreground">
                      Whether you're a solo practitioner or managing a large team, ASPMS scales with your needs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-4 py-20 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-display font-bold mb-4">What We Stand For</h3>
            <p className="text-xl text-muted-foreground">
              Our core values drive everything we build
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-display font-semibold text-2xl mb-3">Efficiency</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Streamline workflows, automate repetitive tasks, and focus on what matters most - delivering exceptional design work
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-display font-semibold text-2xl mb-3">Collaboration</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Foster seamless communication between teams, clients, and stakeholders with role-based access and real-time updates
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-display font-semibold text-2xl mb-3">Transparency</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Complete visibility into project finances, timelines, and team performance with comprehensive reporting and analytics
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-display font-bold mb-6">Built from Experience</h3>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed text-left">
              <p>
                ASPMS was born from real-world experience managing architecture and interior design projects. We recognized that existing project management tools weren't designed with the specific needs of design professionals in mind.
              </p>
              <p>
                Traditional tools forced designers to adapt their workflows to generic systems. We took a different approach - building a platform that adapts to how architecture and design firms actually work.
              </p>
              <p>
                From tracking billable hours on multiple projects to managing complex budgets with overhead and G&A calculations, from coordinating procurement to generating professional invoices - ASPMS handles it all with the precision and elegance design professionals expect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-display font-bold mb-6">
            Join the Future of Project Management
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            Experience the difference a purpose-built solution can make
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setLocation("/signup")}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/features")}>
              Explore Features
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
