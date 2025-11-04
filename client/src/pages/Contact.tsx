import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Here you would normally send the form data to your backend
    toast({
      title: "Message sent!",
      description: "Our team will respond within 24 hours.",
    });

    // Reset form
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: "support@ofivio.com",
      description: "Send us an email anytime",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+92 300 0000000",
      description: "Mon-Fri from 9am to 6pm",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      value: "Available 9:00–18:00",
      description: "Chat with our team",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: MapPin,
      title: "Office",
      value: "Lahore, Pakistan",
      description: "Visit our office",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="w-full bg-gradient-to-b from-blue-50 to-white text-gray-800 min-h-screen">
      {/* Header */}
      <section className="max-w-7xl mx-auto py-20 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold mb-6"
        >
          Get in{" "}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Touch
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto mb-2"
        >
          Sales, onboarding or technical assistance — our team is here to help
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-blue-600 font-semibold"
        >
          Design. Manage. Deliver.
        </motion.p>
      </section>

      {/* Contact Methods */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-blue-200 group">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${method.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{method.title}</h3>
                    <p className="text-gray-900 font-semibold mb-1">{method.value}</p>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      placeholder="Tell us more about your inquiry..."
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 py-6 font-semibold"
                      onClick={() => setFormData({ name: "", email: "", subject: "", message: "" })}
                    >
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-6 font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <Card className="border-2 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">Need help?</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Whether you're looking to demo Ofivio, need technical support, or want to discuss enterprise plans, we're here to assist you every step of the way.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Business Hours</h4>
                      <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM PKT</p>
                      <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM PKT</p>
                      <p className="text-gray-600">Sunday: Closed</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Response Time</h4>
                      <p className="text-gray-600">Email: Within 2-4 hours</p>
                      <p className="text-gray-600">Live Chat: Instant during business hours</p>
                      <p className="text-gray-600">Enterprise: 24/7 priority support</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Sales Inquiries</h3>
                <p className="text-gray-700 mb-4">
                  Interested in Ofivio for your team? Let's discuss how we can help transform your architecture workflow.
                </p>
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white py-6 font-semibold shadow-xl">
                  Schedule a Demo
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-xl bg-gradient-to-br from-gray-900 to-blue-900 text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Enterprise Solutions</h3>
                <p className="text-blue-100 mb-4">
                  For organizations with 50+ users, we offer custom pricing, dedicated support, and tailored onboarding.
                </p>
                <a
                  href="mailto:sales@ofivio.com"
                  className="inline-block w-full text-center bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                >
                  Contact Sales
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
