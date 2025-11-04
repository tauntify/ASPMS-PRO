import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Project, User, Task, Division, Item, ProjectSummary } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Users,
  CheckCircle2,
  DollarSign,
  Plus,
  Clock,
  FileText,
  ChevronRight,
  UserPlus,
  ClipboardList,
  Receipt,
  TrendingUp,
  Calendar,
  Download,
  BarChart3,
  ArrowLeft,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DivisionSidebar } from "@/components/DivisionSidebar";
import { ItemManagement } from "@/components/ItemManagement";
import { Analytics } from "@/components/Analytics";
import { MasterSummary } from "@/components/MasterSummary";
import { ExportModal } from "@/components/ExportModal";
import { ProjectDetailsDialog } from "@/components/ProjectDetailsDialog";
import { AssignTaskDialog, EditUserDialog } from "@/pages/principle-dashboard-dialogs";

type ActiveView = "overview" | "project-view" | "clients" | "employees" | "hr" | "accounts" | "timesheet" | "procurement" | "invoices";

export default function PrincipleDashboardNew() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Main navigation state
  const [activeView, setActiveView] = useState<ActiveView>("overview");

  // Project view state (when viewing a specific project)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  // Dialog states
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showAssignTask, setShowAssignTask] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [newUserRole, setNewUserRole] = useState<"client" | "employee" | "procurement" | "accountant" | "hr">("employee");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Fetch data
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Project-specific data
  const { data: divisions = [], isLoading: divisionsLoading } = useQuery<Division[]>({
    queryKey: [`/api/divisions?projectId=${selectedProjectId}`],
    enabled: !!selectedProjectId && activeView === "project-view",
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: [`/api/items?projectId=${selectedProjectId}`],
    enabled: !!selectedProjectId && activeView === "project-view",
  });

  const { data: summary } = useQuery<ProjectSummary>({
    queryKey: [`/api/summary?projectId=${selectedProjectId}`],
    enabled: !!selectedProjectId && activeView === "project-view",
  });

  // Computed data
  const activeProjects = projects.filter(p => p.projectStatus !== "completed" && p.projectStatus !== "archived");
  const clients = users.filter(u => u.role === "client");
  const employees = users.filter(u => u.role === "employee");
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedDivision = divisions.find(d => d.id === selectedDivisionId);
  const divisionItems = items.filter(item => item.divisionId === selectedDivisionId);

  // Handlers
  const handleOpenProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveView("project-view");
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setSelectedDivisionId(null);
    setShowSummary(false);
    setActiveView("overview");
  };

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/users", {
        ...data,
        organizationId: user?.organizationId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowCreateUser(false);
      toast({ title: "Success", description: "User created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // If viewing a specific project, show the project dashboard
  if (activeView === "project-view" && selectedProjectId) {
    return (
      <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
        {/* Project Header */}
        <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToProjects}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-md bg-primary/20 border border-primary/50 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground tracking-wide">
                  {selectedProject?.name || "PROJECT"}
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  {selectedProject?.clientName || "Project Dashboard"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {summary && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 border border-primary/40">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Total Budget
                  </span>
                  <span className="text-2xl font-mono font-bold text-primary">
                    {summary.totalCost.toLocaleString('en-PK')} PKR
                  </span>
                </div>
              )}

              <Button
                onClick={() => setShowProjectDetails(true)}
                variant="outline"
                className="border-purple-500/50 hover:border-purple-500"
              >
                <Info className="w-4 h-4 mr-2" />
                Project Details
              </Button>

              <Button
                onClick={() => setShowSummary(!showSummary)}
                variant="outline"
                className="border-accent/50 hover:border-accent"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {showSummary ? "Hide" : "Show"} Summary
              </Button>

              <Button
                onClick={() => setShowExport(true)}
                variant="default"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Project Content */}
        <div className="flex-1 flex overflow-hidden">
          <DivisionSidebar
            projectId={selectedProjectId}
            divisions={divisions}
            items={items}
            selectedDivisionId={selectedDivisionId}
            onSelectDivision={setSelectedDivisionId}
            isLoading={divisionsLoading}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            {showSummary ? (
              <MasterSummary summary={summary} divisions={divisions} items={items} />
            ) : (
              <ItemManagement
                division={selectedDivision}
                items={divisionItems}
                isLoading={itemsLoading}
              />
            )}
          </div>

          <Analytics
            summary={summary}
            divisions={divisions}
            items={items}
          />
        </div>

        <ProjectDetailsDialog
          project={selectedProject || null}
          open={showProjectDetails}
          onOpenChange={setShowProjectDetails}
        />

        {showExport && selectedProject && (
          <ExportModal
            onClose={() => setShowExport(false)}
            project={selectedProject}
            projectName={selectedProject.name}
            divisions={divisions}
            items={items}
            summary={summary}
          />
        )}
      </div>
    );
  }

  // Main principle dashboard with all sections
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ActiveView)} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Principal Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Complete control panel for your organization</p>
            </div>

            <TabsList className="grid grid-cols-9 w-auto">
              <TabsTrigger value="overview" className="text-xs px-3">Overview</TabsTrigger>
              <TabsTrigger value="clients" className="text-xs px-3">Clients</TabsTrigger>
              <TabsTrigger value="employees" className="text-xs px-3">Employees</TabsTrigger>
              <TabsTrigger value="hr" className="text-xs px-3">HR</TabsTrigger>
              <TabsTrigger value="accounts" className="text-xs px-3">Accounts</TabsTrigger>
              <TabsTrigger value="timesheet" className="text-xs px-3">Timesheet</TabsTrigger>
              <TabsTrigger value="procurement" className="text-xs px-3">Procurement</TabsTrigger>
              <TabsTrigger value="invoices" className="text-xs px-3">Invoices</TabsTrigger>
            </TabsList>
          </div>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-5 bg-gradient-to-br from-white to-blue-50/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Active Projects</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{activeProjects.length}</p>
                  </div>
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-white to-green-50/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Clients</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{clients.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-white to-purple-50/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Team Members</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{employees.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-white to-amber-50/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Active Tasks</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{tasks.filter(t => t.status !== "Done").length}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-amber-600" />
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              <Button
                onClick={() => {
                  setNewUserRole("client");
                  setShowCreateUser(true);
                }}
                className="h-20 bg-gradient-to-r from-green-600 to-green-700"
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
                className="h-20 bg-gradient-to-r from-purple-600 to-purple-700"
              >
                <div className="flex flex-col items-center gap-2">
                  <UserPlus className="w-6 h-6" />
                  <span>Add Employee</span>
                </div>
              </Button>

              <Button
                onClick={() => setShowAssignTask(true)}
                variant="outline"
                className="h-20"
              >
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Assign Task</span>
                </div>
              </Button>

              <Button
                onClick={() => setActiveView("invoices")}
                variant="outline"
                className="h-20"
              >
                <div className="flex flex-col items-center gap-2">
                  <Receipt className="w-6 h-6" />
                  <span>Create Invoice</span>
                </div>
              </Button>
            </div>

            {/* Projects Grid */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">All Projects</h3>
              <div className="grid grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="p-4 hover:shadow-lg transition-all cursor-pointer border-gray-200"
                    onClick={() => handleOpenProject(project.id)}
                  >
                    <div className="h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mb-3">
                      <Briefcase className="w-8 h-8 text-blue-700" />
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{project.name}</h4>
                        <p className="text-xs text-gray-500">{project.clientName}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {project.projectType || 'Active'}
                    </Badge>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Other tabs will be added in next iterations */}
          <TabsContent value="clients">
            <p>Clients section - To be implemented</p>
          </TabsContent>

          <TabsContent value="employees">
            <p>Employees section - To be implemented</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AssignTaskDialog
        open={showAssignTask}
        onOpenChange={setShowAssignTask}
        projects={projects}
      />

      <EditUserDialog
        open={showEditUser}
        onOpenChange={setShowEditUser}
        user={editingUser}
      />
    </div>
  );
}
