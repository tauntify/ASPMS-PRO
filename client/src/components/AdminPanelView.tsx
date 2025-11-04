import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Briefcase,
  Users,
  DollarSign,
  CheckCircle2,
  Plus,
  FolderOpen,
  BarChart3,
  Settings,
  FileText,
  TrendingUp,
  ChevronRight,
  Calendar,
  MessageCircle,
  ClipboardList,
  UserPlus,
  X,
  ArrowLeft,
  Menu,
  ChevronLeft,
  Info,
} from "lucide-react";
import { Project, User, Task } from "@shared/schema";

interface Props {
  projects: Project[];
  users: User[];
  tasks: Task[];
  onOpenProject: (projectId: string) => void;
  onCreateProject: () => void;
}

export function AdminPanelView({ projects, users, tasks, onOpenProject, onCreateProject }: Props) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"project" | "summary" | "tasks" | null>(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Calculate statistics
  const activeProjects = projects.filter((p) => p.status === "active");
  const pendingApprovals = tasks.filter((t) => t.status === "pending").length;
  const tasksDueToday = tasks.filter((t) => {
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  }).length;

  const totalRevenue = "PKR 12.3M";

  const openDrawer = (project: Project, type: "project" | "summary" | "tasks") => {
    setSelectedProject(project);
    setDrawerType(type);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedProject(null);
      setDrawerType(null);
    }, 300);
  };

  // Mock data for right column
  const upcomingMeetings = [
    { id: 1, title: "Site Walk — DHA Villa", when: "Apr 14", loc: "On-site" },
    { id: 2, title: "Approval Call — MEP", when: "Apr 16", loc: "ARKA Office" },
  ];

  const recentActivity = [
    { id: 1, user: "Ayesha", action: "commented on", target: "DHA Villa" },
    { id: 2, user: "Client", action: "approved BOQ item", target: "#B-33" },
    { id: 3, user: "Procurement", action: "marked orders received", target: "" },
  ];

  return (
    <>
      <div className={`grid gap-0 overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'grid-cols-[60px_1fr_380px]' : 'grid-cols-[280px_1fr_380px]'
      } h-full`}>
        {/* LEFT SIDEBAR - Claude Style Collapsible */}
        <aside className="bg-white border-r border-gray-200 overflow-y-auto relative">
          {/* Collapse/Expand Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-4 right-2 p-1.5 hover:bg-gray-100 rounded-md transition-colors z-10"
          >
            {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {!sidebarCollapsed && (
            <div className="p-4">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Studio Control</h2>
                <p className="text-xs text-gray-500">Management Panel</p>
              </div>

              <nav className="space-y-1">
            <button
              onClick={() => setActiveNav("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                activeNav === "dashboard"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveNav("projects")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                activeNav === "projects"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span>Projects</span>
            </button>
            <button
              onClick={() => setActiveNav("clients")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                activeNav === "clients"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Clients</span>
            </button>
            <button
              onClick={() => setActiveNav("employees")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                activeNav === "employees"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>Employees</span>
            </button>
            <button
              onClick={() => setActiveNav("procurement")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                activeNav === "procurement"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span>Procurement</span>
            </button>
            <button
              onClick={() => setActiveNav("accounts")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                activeNav === "accounts"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Accounts</span>
            </button>
            <button
              onClick={() => setActiveNav("meetings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                activeNav === "meetings"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Meetings & Events</span>
            </button>
            <button
              onClick={() => setActiveNav("tasks")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                activeNav === "tasks"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Tasks</span>
            </button>
            <button
              onClick={() => setActiveNav("reports")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                activeNav === "reports"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Reports</span>
            </button>
            <button
              onClick={() => setActiveNav("admin")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                activeNav === "admin"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Admin</span>
            </button>
              </nav>
            </div>
          )}

          {/* Collapsed Sidebar Icons */}
          {sidebarCollapsed && (
            <div className="pt-16 px-2 space-y-2">
              <button
                onClick={() => setActiveNav("dashboard")}
                className={`w-full p-3 rounded-lg transition-all ${
                  activeNav === "dashboard" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
                title="Dashboard"
              >
                <Briefcase className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={() => setActiveNav("projects")}
                className={`w-full p-3 rounded-lg transition-all ${
                  activeNav === "projects" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
                title="Projects"
              >
                <FolderOpen className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={() => setActiveNav("clients")}
                className={`w-full p-3 rounded-lg transition-all ${
                  activeNav === "clients" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
                title="Clients"
              >
                <Users className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={() => setActiveNav("employees")}
                className={`w-full p-3 rounded-lg transition-all ${
                  activeNav === "employees" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
                title="Employees"
              >
                <UserPlus className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={() => setActiveNav("procurement")}
                className={`w-full p-3 rounded-lg transition-all ${
                  activeNav === "procurement" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
                title="Procurement"
              >
                <ClipboardList className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={() => setActiveNav("accounts")}
                className={`w-full p-3 rounded-lg transition-all ${
                  activeNav === "accounts" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
                title="Accounts"
              >
                <DollarSign className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={() => setActiveNav("meetings")}
                className={`w-full p-3 rounded-lg transition-all ${
                  activeNav === "meetings" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
                title="Meetings & Events"
              >
                <Calendar className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={() => setActiveNav("tasks")}
                className={`w-full p-3 rounded-lg transition-all ${
                  activeNav === "tasks" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
                title="Tasks"
              >
                <CheckCircle2 className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={() => setActiveNav("reports")}
                className={`w-full p-3 rounded-lg transition-all ${
                  activeNav === "reports" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
                title="Reports"
              >
                <BarChart3 className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={() => setActiveNav("admin")}
                className={`w-full p-3 rounded-lg transition-all ${
                  activeNav === "admin" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
                title="Admin"
              >
                <Settings className="w-5 h-5 mx-auto" />
              </button>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="overflow-y-auto relative">
          {/* Header - Sticky */}
          <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Studio Control — Overview</h2>
                <p className="text-sm text-gray-500 mt-1">All projects & live pipelines</p>
              </div>
              <Button onClick={onCreateProject} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </div>
          </div>

          <div className="px-6 space-y-6">

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-5 bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm text-gray-600 font-medium">Total Active Projects</h3>
                <div className="text-3xl font-bold text-gray-900">{activeProjects.length}</div>
                <div className="text-xs text-gray-500">3 new this week</div>
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-white to-amber-50 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm text-gray-600 font-medium">Pending Approvals</h3>
                <div className="text-3xl font-bold text-gray-900">{pendingApprovals}</div>
                <div className="text-xs text-gray-500">Awaiting responses</div>
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-white to-red-50 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm text-gray-600 font-medium">Tasks Due Today</h3>
                <div className="text-3xl font-bold text-gray-900">{tasksDueToday}</div>
                <div className="text-xs text-gray-500">Critical: 5</div>
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-white to-green-50 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm text-gray-600 font-medium">Monthly Revenue</h3>
                <div className="text-3xl font-bold text-gray-900">{totalRevenue}</div>
                <div className="text-xs text-gray-500">Invoice due: PKR 2.1M</div>
              </div>
            </Card>
          </div>

          {/* Projects Section */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-5">Projects</h3>
            <div className="grid grid-cols-3 gap-4">
              {projects.slice(0, 6).map((project) => {
                // Calculate progress percentage (mock data for now)
                const progress = 65;
                const dueDate = project.endDate || "2025-09-15";

                return (
                  <div
                    key={project.id}
                    className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-white to-blue-50/50 border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Project Type Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
                        {project.projectType || "New-Build"}
                      </Badge>
                    </div>

                    {/* Project Info */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <h4 className="font-bold text-base text-gray-900 truncate pr-16">{project.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <Users className="w-3 h-3" />
                          <span>{project.clientName}</span>
                          <span>•</span>
                          <span>{project.projectArea} {project.areaUnit}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Due {dueDate}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-bold text-blue-600">{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Icon Above Buttons */}
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Action Buttons - 3 Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-9 px-2"
                        onClick={() => openDrawer(project, "project")}
                      >
                        <FolderOpen className="w-3 h-3 mr-1" />
                        Open
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs h-9 px-2 bg-blue-600 hover:bg-blue-700"
                        onClick={() => openDrawer(project, "summary")}
                      >
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Summary
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-9 px-2"
                        onClick={() => openDrawer(project, "tasks")}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Tasks
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Insights Section */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-5">Insights</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <div className="flex items-center justify-center h-52">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                    <div className="text-base font-medium text-gray-700">Project Health</div>
                    <div className="text-xs text-gray-500 mt-1">Donut chart (placeholder)</div>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                <div className="flex items-center justify-center h-52">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-green-600 mx-auto mb-3" />
                    <div className="text-base font-medium text-gray-700">Revenue Trend</div>
                    <div className="text-xs text-gray-500 mt-1">Line chart (placeholder)</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="bg-white border-l border-gray-200 p-4 overflow-y-auto space-y-4">
          {/* Upcoming Meetings */}
          <Card className="p-4 shadow-sm">
            <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Upcoming Meetings
            </h4>
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="w-10 h-10 bg-blue-100">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                      {meeting.title.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">{meeting.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {meeting.when} • {meeting.loc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-4 shadow-sm">
            <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-purple-600" />
              Recent Activity
            </h4>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="w-10 h-10 bg-purple-100">
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-sm font-semibold">
                      {activity.user.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-sm">
                    <span className="font-medium text-gray-900">{activity.user}</span>{" "}
                    <span className="text-gray-600">{activity.action}</span>{" "}
                    {activity.target && <span className="font-medium text-blue-600">{activity.target}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-4 shadow-sm">
            <h4 className="font-semibold text-sm mb-4">Quick Actions</h4>
            <div className="space-y-2">
              <Button onClick={onCreateProject} className="w-full bg-blue-600 hover:bg-blue-700 justify-start" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
              <Button className="w-full bg-green-600 hover:bg-green-700 justify-start" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </Card>
        </aside>
      </div>

      {/* SLIDING DRAWER - Slides from right */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-[540px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <button
                onClick={closeDrawer}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedProject?.name}</h3>
                <p className="text-xs text-gray-500">
                  {drawerType === "project" && "Project Details"}
                  {drawerType === "summary" && "Master Project Dashboard"}
                  {drawerType === "tasks" && "Project Tasks"}
                </p>
              </div>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {drawerType === "project" && (
              <div className="space-y-6">
                {/* Progress Pills */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="text-xs font-semibold text-blue-700 uppercase">Design</div>
                    <div className="text-2xl font-bold text-blue-900 mt-1">68%</div>
                    <div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: "68%" }} />
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="text-xs font-semibold text-purple-700 uppercase">Procurement</div>
                    <div className="text-2xl font-bold text-purple-900 mt-1">40%</div>
                    <div className="mt-2 h-1.5 bg-purple-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600" style={{ width: "40%" }} />
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="text-xs font-semibold text-green-700 uppercase">Construction</div>
                    <div className="text-2xl font-bold text-green-900 mt-1">0%</div>
                    <div className="mt-2 h-1.5 bg-green-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600" style={{ width: "0%" }} />
                    </div>
                  </div>
                </div>

                {/* Budget Card */}
                <Card className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-green-700">Budget</div>
                      <div className="text-3xl font-bold text-gray-900 mt-1">PKR 95M</div>
                    </div>
                    <DollarSign className="w-12 h-12 text-green-600" />
                  </div>
                </Card>

                {/* Overview Section */}
                <Card className="p-5 bg-gray-50">
                  <h4 className="font-bold text-base mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    Overview
                  </h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address:</span>
                      <span className="font-medium">DHA Phase 8, Karachi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Start:</span>
                      <span className="font-medium">2025-03-01</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  </div>
                </Card>

                {/* Milestones Section */}
                <Card className="p-5">
                  <h4 className="font-bold text-base mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    Milestones
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Concept Submission</span>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">Pending</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Due: 2025-04-10</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">MEP Approval</span>
                        <Badge className="bg-blue-100 text-blue-700">Waiting Client</Badge>
                      </div>
                      <div className="text-xs text-gray-500">Due: 2025-04-20</div>
                    </div>
                  </div>
                </Card>

                {/* Approvals & Client Feedback */}
                <Card className="p-5 bg-blue-50 border border-blue-200">
                  <h4 className="font-bold text-base mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Approvals & Client Feedback
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-sm text-gray-900">MEP Drawing - Level 2</div>
                          <div className="text-xs text-gray-500 mt-1">Requested by: Aamir • Apr 1</div>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs h-7">
                          Approve
                        </Button>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Client Response:</span> Not yet responded
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* BOQ Highlights */}
                <Card className="p-5 bg-purple-50 border border-purple-200">
                  <h4 className="font-bold text-base mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    BOQ Highlights
                  </h4>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 mb-3 font-medium">Top cost drivers</div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                      <span className="text-sm font-medium text-gray-900">Concrete works</span>
                      <span className="text-sm font-bold text-gray-900">PKR 12M</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                      <span className="text-sm font-medium text-gray-900">MEP</span>
                      <span className="text-sm font-bold text-gray-900">PKR 9.2M</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                      <span className="text-sm font-medium text-gray-900">Finishes</span>
                      <span className="text-sm font-bold text-gray-900">PKR 7.5M</span>
                    </div>
                  </div>
                </Card>

                {/* Action Button */}
                <Button
                  onClick={() => onOpenProject(selectedProject?.id.toString() || "")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Open Full Project View
                </Button>
              </div>
            )}

            {drawerType === "summary" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-xs text-gray-600">Total Items</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">156</div>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                    <div className="text-xs text-gray-600">Completed</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">98</div>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100">
                    <div className="text-xs text-gray-600">In Progress</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">42</div>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100">
                    <div className="text-xs text-gray-600">Pending</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">16</div>
                  </Card>
                </div>

                <Card className="p-4">
                  <h4 className="font-bold text-sm mb-3">Progress Distribution</h4>
                  <div className="flex items-center justify-center h-40 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Chart Placeholder</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-bold text-sm mb-3">Cost Analysis</h4>
                  <div className="flex items-center justify-center h-40 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                    <div className="text-center">
                      <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Chart Placeholder</div>
                    </div>
                  </div>
                </Card>

                <Button
                  onClick={() => onOpenProject(selectedProject?.id.toString() || "")}
                  className="w-full"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Go to Project Details
                </Button>
              </div>
            )}

            {drawerType === "tasks" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm text-gray-900">Task Title {i}</div>
                            <div className="text-xs text-gray-500 mt-1">Assigned to: Team Member</div>
                            <div className="text-xs text-gray-500">Due: Apr 20, 2025</div>
                          </div>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Task
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {/* Floating Action Button */}
      <button
        onClick={onCreateProject}
        className="fixed right-9 bottom-9 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all flex items-center justify-center z-30"
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
}
