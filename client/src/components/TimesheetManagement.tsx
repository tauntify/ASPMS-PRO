import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { User } from "@shared/schema";
import { Clock, Calendar, CheckCircle2, XCircle } from "lucide-react";

export function TimesheetManagement() {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const employees = users.filter(u => u.role === "employee");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Time Management</h2>
        <p className="text-sm text-gray-500 mt-1">Track employee hours and timesheets</p>
      </div>

      {/* Timesheet Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Hours (Month)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0h</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-green-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Billable Hours</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0h</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Non-Billable</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0h</p>
            </div>
            <XCircle className="w-8 h-8 text-amber-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-purple-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Approval</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Employee Timesheet List */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Employee Timesheets</h3>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Timesheet entries will appear here</p>
          <p className="text-sm mt-2">Employees can log their daily hours for project tasks</p>
        </div>
      </Card>
    </div>
  );
}
