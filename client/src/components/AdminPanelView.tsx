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
import { OverviewLeftSidebar } from "@/components/OverviewLeftSidebar";
import { OverviewRightSidebar } from "@/components/OverviewRightSidebar";

interface Props {
  projects: Project[];
  users: User[];
  tasks: Task[];
  onOpenProject: (projectId: string) => void;
  onCreateProject: () => void;
}

export function AdminPanelView({ projects, users, tasks, onOpenProject, onCreateProject }: Props) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState<string>("home");
  const [rightSidebarSection, setRightSidebarSection] = useState<string | null>(null);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"project" | "summary" | "tasks" | null>(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setRightSidebarSection(section);
  };

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
    setRightSidebarOpen(true);
  };

  const closeDrawer = () => {
    setRightSidebarOpen(false);
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
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Left Sidebar */}
      <OverviewLeftSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
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
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onCreateProject}
        className="fixed right-9 bottom-9 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all flex items-center justify-center z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Right Sidebar */}
      <OverviewRightSidebar
        section={rightSidebarSection}
        onClose={() => setRightSidebarSection(null)}
        projects={projects}
        users={users}
        tasks={tasks}
      />
    </div>
  );
}
