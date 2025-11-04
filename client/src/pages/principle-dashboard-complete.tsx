import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Project, User, Task, Division, Item } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  Users,
  CheckCircle2,
  DollarSign,
  Plus,
  Search,
  Clock,
  TrendingUp,
  Activity,
  Calendar,
  FileText,
  ChevronRight,
  X,
  UserPlus,
  FolderPlus,
  Settings as SettingsIcon,
  Receipt,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ActiveSection = "overview" | "projects" | "clients" | "employees" | "hr" | "accounts" | "timesheet" | "procurement" | "invoices";

export default function PrincipleDashboardComplete() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserRole, setNewUserRole] = useState<"client" | "employee" | "procurement" | "accountant" | "hr">("employee");

  // Fetch all data
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Filter data
  const filteredProjects = projects.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProjects = projects.filter(p => p.projectStatus !== "completed" && p.projectStatus !== "archived");
  const clients = users.filter(u => u.role === "client");
  const employees = users.filter(u => u.role === "employee");
  const hrUsers = users.filter(u => u.role === "hr");
  const accountants = users.filter(u => u.role === "accountant" || (u as any).designation === "Accountant");
  const procurementUsers = users.filter(u => u.role === "procurement" || (u as any).designation === "Procurement Incharge");

  // Stats
  const completedTasks = tasks.filter(t => t.status === "Done").length;
  const pendingTasks = tasks.filter(t => t.status === "Undone").length;

  // Open project in the old dashboard view
  const handleOpenProject = (project: Project) => {
    setLocation(`/budget?projectId=${project.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 min-h-screen bg-white/70 backdrop-blur-sm border-r border-gray-200 p-4 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Dashboard</h2>
            <p className="text-xs text-gray-500">Principal Control Panel</p>
          </div>

          <nav className="space-y-1">
            {[
              { id: "overview", icon: Activity, label: "Overview", badge: null },
              { id: "projects", icon: Briefcase, label: "Projects", badge: activeProjects.length },
              { id: "clients", icon: Users, label: "Clients", badge: clients.length },
              { id: "employees", icon: Users, label: "Employees", badge: employees.length },
              { id: "hr", icon: ClipboardList, label: "HR Management", badge: hrUsers.length },
              { id: "accounts", icon: DollarSign, label: "Accounts & Finance", badge: null },
              { id: "timesheet", icon: Clock, label: "Time Management", badge: null },
              { id: "procurement", icon: FileText, label: "Procurement", badge: procurementUsers.length },
              { id: "invoices", icon: Receipt, label: "Invoices", badge: null },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as ActiveSection)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.badge !== null && (
                  <Badge variant="secondary" className="h-5 px-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Overview Section */}
          {activeSection === "overview" && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-sm text-gray-500 mt-1">Complete view of your organization</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="p-5 bg-gradient-to-br from-white to-blue-50/30 border-blue-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Active Projects</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{activeProjects.length}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-blue-600" />
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-white to-green-50/30 border-green-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Clients</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{clients.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-white to-purple-50/30 border-purple-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Team Members</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{employees.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-white to-amber-50/30 border-amber-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Active Tasks</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{pendingTasks}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-amber-600" />
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Button
                  onClick={() => setShowCreateProject(true)}
                  className="h-20 bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FolderPlus className="w-6 h-6" />
                    <span>Create Project</span>
                  </div>
                </Button>

                <Button
                  onClick={() => {
                    setNewUserRole("client");
                    setShowCreateUser(true);
                  }}
                  variant="outline"
                  className="h-20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <UserPlus className="w-6 h-6" />
                    <span>Add Client</span>
                  </div>
                </Button>

                <Button
                  onClick={() => {
                    setNewUserRole("employee");
                    setShowCreateUser(true);
                  }}
                  variant="outline"
                  className="h-20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <UserPlus className="w-6 h-6" />
                    <span>Add Employee</span>
                  </div>
                </Button>

                <Button
                  onClick={() => setActiveSection("invoices")}
                  variant="outline"
                  className="h-20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Receipt className="w-6 h-6" />
                    <span>Create Invoice</span>
                  </div>
                </Button>
              </div>

              {/* Recent Projects */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Recent Projects</h3>
                <div className="grid grid-cols-3 gap-4">
                  {projects.slice(0, 6).map((project) => (
                    <Card
                      key={project.id}
                      className="p-4 hover:shadow-lg transition-all cursor-pointer border-gray-200"
                      onClick={() => handleOpenProject(project)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{project.name}</h4>
                          <p className="text-xs text-gray-500">{project.clientName}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {project.projectStatus || 'Active'}
                      </Badge>
                    </Card>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* Projects Section */}
          {activeSection === "projects" && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage all your projects</p>
                </div>
                <Button onClick={() => setShowCreateProject(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Project
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="p-5 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleOpenProject(project)}
                  >
                    <div className="h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mb-3">
                      <Briefcase className="w-8 h-8 text-blue-700" />
                    </div>
                    <h4 className="font-bold text-base mb-1">{project.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{project.clientName}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {project.projectType || 'Project'}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Other sections will continue... */}
        </main>
      </div>

      {/* Create Project Dialog - Simple for now, will be enhanced */}
      <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter project details to get started
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8 text-gray-500">
            <p>Project creation form will be integrated from the old dashboard...</p>
            <p className="text-sm mt-2">This requires importing ProjectSelector and related components</p>
            <Button onClick={() => setShowCreateProject(false)} className="mt-4">
              Close for now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
