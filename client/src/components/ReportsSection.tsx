import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, FileText, Download, Calendar, DollarSign } from "lucide-react";

export function ReportsSection() {
  const reports = [
    {
      id: "r1",
      title: "Financial Summary Report",
      description: "Overview of revenue, expenses, and profit margins",
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      lastGenerated: "2 hours ago",
    },
    {
      id: "r2",
      title: "Project Progress Report",
      description: "Status and completion percentages for all active projects",
      icon: BarChart3,
      color: "from-blue-500 to-blue-600",
      lastGenerated: "1 day ago",
    },
    {
      id: "r3",
      title: "Team Performance Report",
      description: "Employee productivity, tasks completed, and hours logged",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      lastGenerated: "3 days ago",
    },
    {
      id: "r4",
      title: "Client Activity Report",
      description: "Client interactions, approvals, and feedback summary",
      icon: FileText,
      color: "from-amber-500 to-amber-600",
      lastGenerated: "5 days ago",
    },
    {
      id: "r5",
      title: "Procurement Report",
      description: "Material orders, delivery status, and inventory levels",
      icon: Calendar,
      color: "from-red-500 to-red-600",
      lastGenerated: "1 week ago",
    },
    {
      id: "r6",
      title: "Monthly Summary",
      description: "Comprehensive overview of all activities for the month",
      icon: FileText,
      color: "from-indigo-500 to-indigo-600",
      lastGenerated: "2 weeks ago",
    },
  ];

  const handleGenerateReport = (reportId: string) => {
    // Placeholder for report generation
    alert(`Generating report: ${reportId}`);
  };

  const handleDownloadReport = (reportId: string) => {
    // Placeholder for report download
    alert(`Downloading report: ${reportId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Generate and download comprehensive reports</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export All
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{reports.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-white to-green-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Generated This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">24</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-white to-purple-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Scheduled Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Downloads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">142</p>
            </div>
            <Download className="w-8 h-8 text-amber-600" />
          </div>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="p-6 hover:shadow-lg transition-all">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${report.color} flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <div className="text-xs text-gray-500 mb-4">
                Last generated: {report.lastGenerated}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleGenerateReport(report.id)}
                  className="flex-1"
                  variant="default"
                >
                  Generate
                </Button>
                <Button
                  onClick={() => handleDownloadReport(report.id)}
                  variant="outline"
                  size="icon"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Custom Report Builder */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Custom Report Builder</h3>
        <p className="text-sm text-gray-600 mb-4">
          Create custom reports by selecting specific data points and date ranges
        </p>
        <Button className="gap-2">
          <FileText className="w-4 h-4" />
          Build Custom Report
        </Button>
      </Card>
    </div>
  );
}
