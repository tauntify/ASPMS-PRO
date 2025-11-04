import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@shared/schema";
import { Receipt, FileText, Download, Plus, DollarSign, Clock } from "lucide-react";

export function InvoiceManagement() {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
          <p className="text-sm text-gray-500 mt-1">Generate and track project invoices</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-white to-green-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Invoiced</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0 PKR</p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Paid</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0 PKR</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0 PKR</p>
            </div>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-red-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Overdue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0 PKR</p>
            </div>
            <Receipt className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Recent Invoices</h3>
        <div className="text-center py-8 text-gray-500">
          <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No invoices yet</p>
          <p className="text-sm mt-2">Create invoices from project BOQ items</p>
          <Button className="mt-4 gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Invoice
          </Button>
        </div>
      </Card>
    </div>
  );
}
