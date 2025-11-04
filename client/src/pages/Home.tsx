import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Star,
  CheckCircle,
  Zap,
  Users,
  FileText,
  Calendar,
  DollarSign,
  BarChart3,
  Shield,
  Building2,
  Workflow,
  MessageSquare
} from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: FileText,
      title: "Design & Procurement",
      description: "Link BOQs and procurement to budgets and progress — keep architects and contractors aligned.",
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      icon: Users,
      title: "Client Portal",
      description: "Invite clients to review, approve or object — comment and sign off milestones.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Workflow,
      title: "Project Workflows",
      description: "Milestones, stages, and automated notifications keep teams on schedule.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const detailedFeatures = [
    {
      icon: Building2,
      title: "Built for design workflows",
      description: "From schematic to construction documents — manage handoffs between architects, engineers, and contractors with versioned submissions and comment threads.",
      points: [
        "Versioned drawing uploads & approvals",
        "Integrated comments and redlines",
        "3D model link attachments"
      ]
    },
    {
      icon: DollarSign,
      title: "Procurement & BOQ",
      description: "Track procurement items, link invoices and delivery status to project milestones. Assign procurement managers and set approval workflows.",
      points: [
        "Supplier tracking & purchase requests",
        "Cost tracking and comparisons",
        "Attach bills and receipts"
      ]
    }
  ];

  const stats = [
    { value: "3,210", label: "Active teams", gradient: "from-blue-600 to-cyan-500" },
    { value: "98%", label: "Satisfaction score" },
    { value: "1,142", label: "Tasks completed daily" }
  ];

  const testimonials = [
    {
      quote: "Ofivio changed how we run projects — from drawings to handover everything is tracked.",
      author: "Sara Ahmed",
      company: "ARKA Studio",
      rating: 5
    },
    {
      quote: "Procurement sync and BOQ saved us weeks of admin work.",
      author: "Omar Khan",
      company: "Bravo Retail",
      rating: 5
    },
    {
      quote: "The client portal transformed our approval process completely.",
      author: "Fatima Ali",
      company: "Design Co.",
      rating: 5
    },
    {
      quote: "Best tool for managing architectural projects end-to-end.",
      author: "Ahmed Hassan",
      company: "Urban Arch",
      rating: 5
    }
  ];

  return (
    <div className="w-full bg-gradient-to-b from-blue-50 via-white to-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto py-20 px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            >
              <Zap className="w-4 h-4" />
              Trusted by 3,000+ architecture teams
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Designed for architects —{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                deliver projects, delight clients
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Ofivio combines project planning, client portals, procurement, and construction tracking
              into one visual platform tailored for architecture studios and construction teams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                onClick={() => setLocation("/login")}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Start free — no card <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/pricing")}
                className="px-8 py-6 text-lg font-semibold border-2 hover:bg-gray-50 transition-all"
              >
                Compare plans
              </Button>
            </div>

            {/* Quick Features */}
            <div className="grid sm:grid-cols-3 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-blue-200">
                      <CardContent className="p-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-sm mb-1">{feature.title}</h4>
                        <p className="text-xs text-gray-600">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Panel - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="/assets/images/main header image/representation-user-experience-interface-design.jpg"
                alt="Ofivio Dashboard"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
            </div>

            {/* Floating Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-2xl p-6 max-w-xs"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-gray-500 text-sm">Active projects</div>
                  <div className="text-3xl font-bold text-gray-900">48</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-sm">Open tasks</div>
                  <div className="text-3xl font-bold text-gray-900">1,142</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-gray-500 text-sm mb-2">Overall progress</div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 w-2/3 rounded-full"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Why Ofivio is best for architecture
            </h2>
            <p className="text-xl text-gray-600">
              A single system to manage design, procurement and construction
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {detailedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-200 group">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                      <p className="text-gray-600 mb-6">{feature.description}</p>
                      <ul className="space-y-3">
                        {feature.points.map((point) => (
                          <li key={point} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`text-center p-8 rounded-xl ${
                  stat.gradient
                    ? `bg-gradient-to-r ${stat.gradient}`
                    : "bg-white/10 backdrop-blur-sm"
                } hover:scale-105 transition-transform`}
              >
                <div className={`text-5xl font-extrabold mb-2 ${stat.gradient ? "text-white" : "text-white"}`}>
                  {stat.value}
                </div>
                <div className={`text-lg ${stat.gradient ? "text-blue-100" : "text-white/90"}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">What customers say</h2>
            <p className="text-xl text-gray-600">Architects and studios that trust Ofivio</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4 text-yellow-400">
                      {[...Array(item.rating)].map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 mb-4 italic leading-relaxed">
                      "{item.quote}"
                    </p>
                    <div className="border-t pt-4">
                      <p className="font-semibold text-gray-900">{item.author}</p>
                      <p className="text-xs text-gray-500">{item.company}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Trusted By Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-gray-600 mb-6 font-semibold">Loved by leading firms:</p>
            <div className="flex flex-wrap justify-center gap-6">
              {["ARKA Studio", "Bravo Retail", "Design Co.", "Urban Arch", "BuildCo", "StudioX"].map((company) => (
                <div
                  key={company}
                  className="bg-white px-8 py-4 rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <span className="font-bold text-gray-800">{company}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 rounded-3xl p-12 md:p-16 text-white text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Ready to transform your workflow?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of architecture teams managing projects with Ofivio. Design. Manage. Deliver.
            </p>
            <Button
              onClick={() => setLocation("/login")}
              className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 text-lg font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
            >
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="mt-4 text-sm text-blue-100">No credit card required • Start in minutes</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
