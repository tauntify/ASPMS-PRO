import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@shared/schema";
import { UserPlus, Edit2, Calendar, FileText, DollarSign } from "lucide-react";
import { useState } from "react";
import { EditUserDialog } from "@/pages/principle-dashboard-dialogs";

export function HRManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const employees = users.filter(u => u.role === "employee" || u.role === "hr" || u.role === "accountant");

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">HR Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage employees, salaries, attendance, and documents</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{employees.length}</p>
            </div>
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-green-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{employees.filter(e => e.isActive).length}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-purple-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Salary</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {employees.filter(e => (e as any).basicSalary).length > 0
                  ? (employees.reduce((sum, e) => sum + ((e as any).basicSalary || 0), 0) / employees.filter(e => (e as any).basicSalary).length).toFixed(0)
                  : 0} PKR
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Documents</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <FileText className="w-8 h-8 text-amber-600" />
          </div>
        </Card>
      </div>

      {/* Employees Grid */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">All Employees</h3>
        <div className="grid grid-cols-3 gap-4">
          {employees.map((employee) => (
            <Card key={employee.id} className="p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold">
                      {employee.fullName?.charAt(0) || employee.username?.charAt(0) || 'E'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-base">{employee.fullName || employee.username}</h4>
                    <p className="text-sm text-gray-500">{(employee as any).designation || employee.role}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditUser(employee)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{employee.email || 'N/A'}</span>
                </div>
                {(employee as any).basicSalary && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Salary</span>
                    <span className="font-medium">{(employee as any).basicSalary.toLocaleString()} PKR</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge variant={employee.isActive ? "default" : "secondary"}>
                    {employee.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  Attendance
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Documents
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <EditUserDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={selectedUser}
      />
    </div>
  );
}
