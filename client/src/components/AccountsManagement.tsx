import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Project, ProjectSummary } from "@shared/schema";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export function AccountsManagement() {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Calculate financial overview
  const totalRevenue = 0; // To be calculated from invoices
  const totalExpenses = 0; // To be calculated from expenses
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Accounts & Finance</h2>
        <p className="text-sm text-gray-500 mt-1">Financial overview and analysis</p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-white to-green-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalRevenue.toLocaleString()} PKR</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-red-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalExpenses.toLocaleString()} PKR</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Net Profit</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{netProfit.toLocaleString()} PKR</p>
            </div>
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-purple-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Payments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0 PKR</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Project Financial Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Project Financial Overview</h3>
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all">
              <div>
                <h4 className="font-semibold text-base">{project.name}</h4>
                <p className="text-sm text-gray-500">{project.clientName}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">0 PKR</p>
                <p className="text-xs text-gray-500">Budget</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
