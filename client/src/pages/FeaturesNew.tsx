import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Zap, Users, FileText, Calendar, DollarSign, BarChart3, Shield, Bell } from "lucide-react";

export default function FeaturesNew() {
  const features = [
    {
      icon: Zap,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time with instant updates and notifications",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: FileText,
      title: "Blueprint Management",
      description: "Upload, version control, and annotate architectural drawings and documents",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      icon: Users,
      title: "Client Portal",
      description: "Give clients secure access to view progress, approve designs, and communicate",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Calendar,
      title: "Project Timeline",
      description: "Visual Gantt charts and milestone tracking to keep projects on schedule",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: DollarSign,
      title: "BOQ & Procurement",
      description: "Manage bill of quantities, track purchases, and monitor project budgets",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      icon: BarChart3,
      title: "Reporting & Analytics",
      description: "Generate detailed reports and insights on project performance",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with role-based access control",
      gradient: "from-red-500 to-rose-500"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Stay informed with intelligent alerts for deadlines and updates",
      gradient: "from-amber-500 to-yellow-500"
    }
  ];

  const comparison = [
    { feature: "Project Tracking", ofivio: true, asana: true, clickup: true },
    { feature: "BOQ & Procurement", ofivio: true, asana: false, clickup: false },
    { feature: "Client Portal", ofivio: true, asana: false, clickup: false },
    { feature: "Architecture Focused", ofivio: true, asana: false, clickup: false },
    { feature: "Blueprint Versioning", ofivio: true, asana: false, clickup: false },
    { feature: "Site Visit Logs", ofivio: true, asana: false, clickup: false },
    { feature: "Material Tracking", ofivio: true, asana: false, clickup: false },
    { feature: "Custom Workflows", ofivio: true, asana: true, clickup: true },
  ];

  return (
    <div className="w-full bg-white text-gray-800 min-h-screen">
      {/* Header */}
      <section className="max-w-7xl mx-auto py-20 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold mb-6"
        >
          Everything you need to manage{" "}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            architecture projects
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 max-w-3xl mx-auto"
        >
          Built specifically for architects, engineers, and construction teams. Ofivio combines powerful project management with industry-specific tools.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-semibold text-gray-800 mt-4"
        >
          Design. Manage. Deliver.
        </motion.p>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-blue-200">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Ofivio
            </span>{" "}
            compares
          </h2>
          <p className="text-center text-gray-600 mb-2 text-lg">
            See why architecture teams choose Ofivio over generic project management tools
          </p>
          <p className="text-center text-blue-600 mb-12 font-semibold">
            Design. Manage. Deliver.
          </p>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white">
                    <th className="p-4 text-left font-bold">Feature</th>
                    <th className="p-4 text-center font-bold text-lg">Ofivio</th>
                    <th className="p-4 text-center font-semibold">Asana</th>
                    <th className="p-4 text-center font-semibold">ClickUp</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, index) => (
                    <tr
                      key={row.feature}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center">
                        {row.ofivio ? (
                          <Check className="w-6 h-6 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {row.asana ? (
                          <Check className="w-6 h-6 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {row.clickup ? (
                          <Check className="w-6 h-6 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-gray-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-7xl mx-auto py-20 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Perfect for every architecture workflow
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Residential Projects",
              description: "Manage home design projects from concept to completion with client collaboration tools"
            },
            {
              title: "Commercial Buildings",
              description: "Handle large-scale projects with complex BOQs, multiple stakeholders, and strict timelines"
            },
            {
              title: "Interior Design",
              description: "Track material procurement, vendor coordination, and installation schedules seamlessly"
            }
          ].map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">{useCase.title}</h3>
                  <p className="text-gray-600">{useCase.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
