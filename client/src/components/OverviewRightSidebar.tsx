import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HRManagement } from "@/components/HRManagement";
import { AccountsManagement } from "@/components/AccountsManagement";
import { TimesheetManagement } from "@/components/TimesheetManagement";
import { ProcurementManagement } from "@/components/ProcurementManagement";
import { InvoiceManagement } from "@/components/InvoiceManagement";
import { ReportsSection } from "@/components/ReportsSection";
import { Project, User, Task } from "@shared/schema";

interface OverviewRightSidebarProps {
  section: string | null;
  onClose: () => void;
  projects?: Project[];
  users?: User[];
  tasks?: Task[];
}

export function OverviewRightSidebar({
  section,
  onClose,
  projects = [],
  users = [],
  tasks = []
}: OverviewRightSidebarProps) {
  if (!section) return null;

  const clients = users.filter(u => u.role === "client");
  const employees = users.filter(u => u.role === "employee");

  const renderContent = () => {
    switch (section) {
      case "projects":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Projects</h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <Card key={project.id} className="p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{project.clientName}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      project.projectStatus === "active" ? "bg-green-100 text-green-700" :
                      project.projectStatus === "completed" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {project.projectStatus}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "clients":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Clients</h2>
            <div className="space-y-3">
              {clients.map((client) => (
                <Card key={client.id} className="p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg">{client.fullName || client.username}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{client.email}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      client.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {client.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "employees":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Employees</h2>
            <div className="space-y-3">
              {employees.map((employee) => (
                <Card key={employee.id} className="p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg">{employee.fullName || employee.username}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{employee.email}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      employee.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {employee.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "hr":
        return <HRManagement />;

      case "accounts":
        return <AccountsManagement />;

      case "timesheet":
        return <TimesheetManagement />;

      case "procurement":
        return <ProcurementManagement />;

      case "invoices":
        return <InvoiceManagement />;

      case "reports":
        return <ReportsSection />;

      case "settings":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Settings</h2>
            <Card className="p-6">
              <p className="text-muted-foreground">
                Settings panel - Configure your preferences here
              </p>
              <Button className="mt-4" onClick={() => window.location.href = "/settings"}>
                Go to Full Settings
              </Button>
            </Card>
          </div>
        );

      case "tasks":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Tasks</h2>
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      task.status === "completed" ? "bg-green-100 text-green-700" :
                      task.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      {task.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "attendance":
      case "meetings":
      case "activities":
      case "approvals":
      case "approval-board":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold capitalize">{section.replace('-', ' ')}</h2>
            <Card className="p-6">
              <p className="text-muted-foreground">
                Detailed {section} view coming soon. This feature is currently under development.
              </p>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Home</h2>
            <Card className="p-6">
              <p className="text-muted-foreground">
                Welcome to your dashboard! Select an item from the left sidebar to get started.
              </p>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[1000px] bg-background border-l border-border shadow-2xl transition-all duration-300 z-30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
        <h3 className="text-lg font-semibold capitalize">{section.replace('-', ' ')}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="p-6">
          {renderContent()}
        </div>
      </ScrollArea>
    </div>
  );
}
