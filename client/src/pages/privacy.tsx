import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, ArrowLeft, Shield } from "lucide-react";

export default function Privacy() {
  const [, setLocation] = useLocation();

  const sections = [
    {
      title: "Information We Collect",
      content: [
        "When you create an account, we collect your name, email address, and contact information.",
        "For organization accounts, we collect company information and employee details.",
        "We automatically collect usage data, including IP addresses, browser type, and access times.",
        "Project data, timesheets, invoices, and other information you enter into the system."
      ]
    },
    {
      title: "How We Use Your Information",
      content: [
        "To provide and maintain our project management services.",
        "To process transactions and send related information including invoices and confirmations.",
        "To send administrative information, updates, and security alerts.",
        "To improve our services and develop new features.",
        "To monitor and analyze usage patterns and trends.",
        "To detect, prevent, and address technical issues and security threats."
      ]
    },
    {
      title: "Data Storage and Security",
      content: [
        "Your data is stored securely using industry-standard encryption.",
        "We use Firebase Cloud Firestore for database services with enterprise-grade security.",
        "All data transmissions are encrypted using SSL/TLS protocols.",
        "We implement role-based access controls to protect your information.",
        "Regular security audits and updates are performed to maintain data protection.",
        "We maintain backups of your data to prevent loss."
      ]
    },
    {
      title: "Data Sharing and Disclosure",
      content: [
        "We do not sell your personal information to third parties.",
        "Your project data is only accessible to users within your organization based on their role permissions.",
        "We may share data with service providers who assist in operating our platform (e.g., hosting, analytics).",
        "We may disclose information if required by law or to protect our rights and safety.",
        "In the event of a merger or acquisition, your data may be transferred to the new entity."
      ]
    },
    {
      title: "Your Rights and Choices",
      content: [
        "You have the right to access, update, or delete your personal information.",
        "You can export your project data at any time from your dashboard.",
        "You may request deletion of your account and associated data.",
        "You can opt out of non-essential communications.",
        "Organization administrators have additional controls over employee data within their account."
      ]
    },
    {
      title: "Cookies and Tracking",
      content: [
        "We use cookies and similar technologies to maintain your session.",
        "Authentication tokens are stored locally to keep you logged in.",
        "We use analytics to understand how users interact with our platform.",
        "You can control cookie settings through your browser preferences."
      ]
    },
    {
      title: "Data Retention",
      content: [
        "We retain your data for as long as your account is active.",
        "After account deletion, we may retain certain data for legal and accounting purposes.",
        "Backup copies may persist for up to 90 days after deletion.",
        "You can request permanent deletion of all data by contacting support."
      ]
    },
    {
      title: "Children's Privacy",
      content: [
        "Our services are not intended for users under the age of 18.",
        "We do not knowingly collect information from children.",
        "If we learn that we have collected data from a child, we will delete it promptly."
      ]
    },
    {
      title: "International Data Transfers",
      content: [
        "Your data may be processed and stored in different countries.",
        "We ensure appropriate safeguards are in place for international data transfers.",
        "Data is primarily stored in secure data centers provided by Google Cloud (Firebase)."
      ]
    },
    {
      title: "Changes to This Policy",
      content: [
        "We may update this privacy policy from time to time.",
        "We will notify you of significant changes via email or platform notification.",
        "Continued use of our services after changes constitutes acceptance of the updated policy.",
        "The effective date of the current policy is displayed at the bottom of this page."
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
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
            Privacy Policy
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-4">
            Your privacy and data security are our top priorities
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground leading-relaxed mb-4">
                ARKA SERVICES Project Management System ("ASPMS", "we", "us", or "our") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
                project management platform.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By using ASPMS, you agree to the collection and use of information in accordance with this policy.
                If you do not agree with the terms of this privacy policy, please do not access the platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardContent className="p-8">
                <h3 className="text-2xl font-display font-bold mb-4 text-primary">
                  {index + 1}. {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                      <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-display font-bold mb-4">
                Contact Us About Privacy
              </h3>
              <p className="text-muted-foreground mb-6">
                If you have questions or concerns about this privacy policy or our data practices,
                please contact us at:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Email:</strong> privacy@arkaservices.com
                </p>
                <p>
                  <strong className="text-foreground">Address:</strong> ARKA Services, Pakistan
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Summary */}
      <section className="container mx-auto px-4 py-12 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-2xl font-display font-bold mb-6 text-center">
                Our Commitment to You
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Data Security</h4>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade encryption and security measures
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Transparency</h4>
                  <p className="text-sm text-muted-foreground">
                    Clear information about how we use your data
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Your Control</h4>
                  <p className="text-sm text-muted-foreground">
                    Full access, export, and deletion rights
                  </p>
                </div>
              </div>
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
