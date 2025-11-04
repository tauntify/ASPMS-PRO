import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is Ofivio and who is it for?",
      answer: "Ofivio is a project management platform designed for architects and construction teams. It unites design workflows, procurement, and construction tracking. Perfect for architecture studios, engineering firms, and construction companies looking to streamline their project delivery."
    },
    {
      question: "How does client approval work?",
      answer: "Clients receive notifications, view progress, comment, approve or object to milestones. Approval is recorded in the project timeline with timestamps and comments. Clients can access a secure portal to review designs, documents, and provide feedback in real-time."
    },
    {
      question: "Can I import BOQs and invoices?",
      answer: "Yes — import CSV/Excel BOQs and attach invoices to procurement items. Integration with accounting systems is available for Enterprise plans. You can also export data for external analysis or reporting."
    },
    {
      question: "Does Ofivio support multiple currencies?",
      answer: "Yes — set project currency in settings. Enterprise accounts can enforce currency rules by region. We support all major currencies including USD, EUR, GBP, PKR, AED, and more."
    },
    {
      question: "How is user access controlled?",
      answer: "Role-based access (Admin, Manager, Designer, Supplier, Client) with fine-grained permissions for projects and procurement. You can customize permissions at the project level and restrict sensitive information as needed."
    },
    {
      question: "Are my files secure?",
      answer: "Files are stored with encrypted storage and optional enterprise key management for compliance plans. We use industry-standard AES-256 encryption and comply with SOC 2 Type II standards. Enterprise plans include data residency options."
    },
    {
      question: "What integrations are available?",
      answer: "Popular integrations include Google Drive, GitHub, Slack, and accounting software. More available for Enterprise accounts including AutoCAD, Revit, BIM 360, Procore, and custom API integrations."
    },
    {
      question: "Do you provide onboarding?",
      answer: "Yes — paid onboarding and training packages are available for medium and enterprise customers. We offer video tutorials, documentation, live training sessions, and dedicated customer success managers for Enterprise plans."
    },
    {
      question: "Can I host Ofivio on my own infrastructure?",
      answer: "We offer a cloud SaaS and an on-premise option for large enterprise customers with compliance needs. Contact our sales team to discuss self-hosted deployment options."
    },
    {
      question: "How do I get support?",
      answer: "Email support@ofivio.com or use the in-app chat. Enterprise customers have 24/7 priority support with dedicated account managers. We typically respond within 2 hours for paid plans."
    },
    {
      question: "What's your refund policy?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us within 30 days of your first payment for a full refund, no questions asked."
    },
    {
      question: "Can I change my plan later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged a prorated amount. When downgrading, credits will be applied to your next billing cycle."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full bg-gradient-to-b from-blue-50 to-white text-gray-800 min-h-screen">
      {/* Header */}
      <section className="max-w-4xl mx-auto py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6"
        >
          <HelpCircle className="w-4 h-4" />
          Got questions? We've got answers
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold mb-6"
        >
          Frequently Asked{" "}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Questions
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 mb-2"
        >
          Answers to common questions about Ofivio
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

      {/* FAQ Grid */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid gap-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 flex items-center gap-2">
                        <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </span>
                        {faq.question}
                      </h3>
                      {openIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 text-gray-600 leading-relaxed pl-10"
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {openIndex === index ? (
                        <ChevronUp className="w-6 h-6 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-12 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Our team is here to help you get started with Ofivio
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@ofivio.com"
              className="inline-block bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-all transform hover:scale-105"
            >
              Email Us
            </a>
          </div>
          <p className="mt-6 text-sm text-blue-100">
            📧 support@ofivio.com • 📞 +92 300 0000000
          </p>
        </motion.div>
      </section>
    </div>
  );
}
