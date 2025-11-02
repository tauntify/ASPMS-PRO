import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, ArrowLeft, FileText } from "lucide-react";

export default function Terms() {
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
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
            Terms & Conditions
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Legal terms and conditions for using ARKA SERVICES Project Management System
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/30 border-primary/20">
            <CardContent className="p-12 text-center">
              <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-3xl font-display font-bold mb-4">
                Coming Soon
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Our comprehensive Terms & Conditions are currently being prepared.
                This document will outline the terms of service, user responsibilities,
                and legal agreements for using ASPMS.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                In the meantime, if you have any questions about our service terms,
                please contact our support team.
              </p>
              <Button onClick={() => setLocation("/")}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Placeholder Info */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h4 className="font-semibold text-lg mb-4">What will be covered:</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>User account terms and responsibilities</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Subscription and billing terms</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Data usage and intellectual property rights</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Service level agreements and limitations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Termination and cancellation policies</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Disclaimer of warranties and limitation of liability</span>
                </li>
              </ul>
            </CardContent>
          </Card>
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
