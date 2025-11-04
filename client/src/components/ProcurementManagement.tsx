import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@shared/schema";
import { Package, ShoppingCart, Truck, CheckCircle2 } from "lucide-react";

export function ProcurementManagement() {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Procurement Management</h2>
        <p className="text-sm text-gray-500 mt-1">Track orders, deliveries, and inventory</p>
      </div>

      {/* Procurement Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-amber-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-purple-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">In Transit</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <Truck className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-green-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Delivered</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Procurement Items by Project */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Procurement by Project</h3>
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Procurement items will appear here</p>
          <p className="text-sm mt-2">Items are linked to BOQ entries in project divisions</p>
        </div>
      </Card>
    </div>
  );
}
