import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import {
  Project, User, Task, Division, Item, ProjectSummary,
  projectTypes, projectSubTypes, areaUnits, projectScopes, feeModelTypes, projectStatuses, siteTypes
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
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
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DivisionSidebar } from "@/components/DivisionSidebar";
import { ItemManagement } from "@/components/ItemManagement";
import { Analytics } from "@/components/Analytics";
import { MasterSummary } from "@/components/MasterSummary";
import { ExportModal } from "@/components/ExportModal";
import { ProjectDetailsDialog } from "@/components/ProjectDetailsDialog";
import { AssignTaskDialog, EditUserDialog } from "@/pages/principle-dashboard-dialogs";
import { HRManagement } from "@/components/HRManagement";
import { AccountsManagement } from "@/components/AccountsManagement";
import { TimesheetManagement } from "@/components/TimesheetManagement";
import { ProcurementManagement } from "@/components/ProcurementManagement";
import { InvoiceManagement } from "@/components/InvoiceManagement";
import { UpcomingMeetings } from "@/components/UpcomingMeetings";
import { RecentActivities } from "@/components/RecentActivities";
import { ReportsSection } from "@/components/ReportsSection";
import { ComprehensiveOverview } from "@/components/ComprehensiveOverview";
import { AdminPanelView } from "@/components/AdminPanelView";

type ActiveView = "overview" | "project-view" | "clients" | "employees" | "hr" | "accounts" | "timesheet" | "procurement" | "invoices" | "reports";

export default function PrincipleDashboardNew() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Main navigation state
  const [activeView, setActiveView] = useState<ActiveView>("overview");
  const [overviewMode, setOverviewMode] = useState<"comprehensive" | "admin">("comprehensive");

  // Project view state (when viewing a specific project)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  // Dialog states
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
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
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditUser(true);
  };
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
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      {/* Black Navigation Bar - Only Overview and Admin Panel */}
      <div className="bg-gray-900 text-white border-b border-gray-800">
        <div className="flex items-center justify-between px-6 py-3">
          <div>
            <h1 className="text-xl font-bold">Principal Dashboard</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setOverviewMode("comprehensive")}
              variant={overviewMode === "comprehensive" ? "default" : "ghost"}
              size="sm"
              className={overviewMode === "comprehensive" ? "" : "text-white hover:bg-gray-800"}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              onClick={() => setOverviewMode("admin")}
              variant={overviewMode === "admin" ? "default" : "ghost"}
              size="sm"
              className={overviewMode === "admin" ? "" : "text-white hover:bg-gray-800"}
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="flex-1 overflow-hidden">
        {overviewMode === "comprehensive" ? (
          <ComprehensiveOverview projects={projects} users={users} tasks={tasks} />
        ) : (
          <AdminPanelView
            projects={projects}
            users={users}
            tasks={tasks}
            onOpenProject={(projectId) => {
              setSelectedProjectId(projectId);
              setActiveView("project-view");
            }}
            onCreateProject={() => setShowCreateProject(true)}
          />
        )}
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

      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        clients={clients}
      />

      <CreateUserDialog
        open={showCreateUser}
        onOpenChange={setShowCreateUser}
        role={newUserRole}
      />
    </div>
  );
}

// Create Project Dialog Component
function CreateProjectDialog({
  open,
  onOpenChange,
  clients,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: User[];
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    projectTitle: "",
    projectType: "",
    subType: "",
    area: "",
    areaUnit: "sqm" as any,
    stories: "",
    projectScope: [] as string[],
    feeModelType: "",
    feeModelValue: "",
    feeModelUnit: "",
    constructionCostEstimate: "",
    supervisionPercent: "",
    projectStatus: "active" as any,
    primaryAddress: "",
    siteType: "on-site" as any,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project created successfully" });
      onOpenChange(false);
      // Reset form
      setFormData({
        name: "",
        clientId: "",
        projectTitle: "",
        projectType: "",
        subType: "",
        area: "",
        areaUnit: "sqm",
        stories: "",
        projectScope: [],
        feeModelType: "",
        feeModelValue: "",
        feeModelUnit: "",
        constructionCostEstimate: "",
        supervisionPercent: "",
        projectStatus: "active",
        primaryAddress: "",
        siteType: "on-site",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const projectData: any = {
      name: formData.name,
      clientId: formData.clientId || undefined,
      clientName: formData.clientId ? clients.find(c => c.id === formData.clientId)?.fullName : undefined,
      projectTitle: formData.projectTitle || undefined,
      projectType: formData.projectType || undefined,
      subType: formData.subType || undefined,
      area: formData.area ? parseFloat(formData.area) : undefined,
      areaUnit: formData.areaUnit || undefined,
      stories: formData.stories ? parseInt(formData.stories) : undefined,
      projectScope: formData.projectScope.length > 0 ? formData.projectScope : undefined,
      constructionCostEstimate: formData.constructionCostEstimate ? parseFloat(formData.constructionCostEstimate) : undefined,
      supervisionPercent: formData.supervisionPercent ? parseFloat(formData.supervisionPercent) : undefined,
      projectStatus: formData.projectStatus,
      primaryAddress: formData.primaryAddress || undefined,
      siteType: formData.siteType || undefined,
    };

    // Add fee model if provided
    if (formData.feeModelType && formData.feeModelValue) {
      projectData.feeModel = {
        type: formData.feeModelType,
        value: parseFloat(formData.feeModelValue),
        unit: formData.feeModelType === "perUnit" ? formData.feeModelUnit : undefined,
      };
    }

    createProjectMutation.mutate(projectData);
  };

  const toggleScope = (scope: string) => {
    setFormData((prev) => ({
      ...prev,
      projectScope: prev.projectScope.includes(scope)
        ? prev.projectScope.filter((s) => s !== scope)
        : [...prev.projectScope, scope],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input
                  id="projectTitle"
                  value={formData.projectTitle}
                  onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientId">Client</Label>
                <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectStatus">Project Status</Label>
                <Select value={formData.projectStatus} onValueChange={(v: any) => setFormData({ ...formData, projectStatus: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Project Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Select value={formData.projectType} onValueChange={(v) => setFormData({ ...formData, projectType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subType">Sub Type</Label>
                <Select value={formData.subType} onValueChange={(v) => setFormData({ ...formData, subType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectSubTypes.map((subType) => (
                      <SelectItem key={subType} value={subType}>
                        {subType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <div className="flex gap-2">
                  <Input
                    id="area"
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="0"
                  />
                  <Select value={formData.areaUnit} onValueChange={(v: any) => setFormData({ ...formData, areaUnit: v })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {areaUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stories">Number of Stories</Label>
                <Input
                  id="stories"
                  type="number"
                  value={formData.stories}
                  onChange={(e) => setFormData({ ...formData, stories: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Project Scope */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Project Scope</h3>
            <div className="grid grid-cols-4 gap-3">
              {projectScopes.map((scope) => (
                <div key={scope} className="flex items-center space-x-2">
                  <Checkbox
                    id={scope}
                    checked={formData.projectScope.includes(scope)}
                    onCheckedChange={() => toggleScope(scope)}
                  />
                  <Label htmlFor={scope} className="text-sm font-normal cursor-pointer">
                    {scope}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Financial Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feeModelType">Fee Model Type</Label>
                <Select value={formData.feeModelType} onValueChange={(v) => setFormData({ ...formData, feeModelType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee model" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeModelTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeModelValue">Fee Value</Label>
                <Input
                  id="feeModelValue"
                  type="number"
                  value={formData.feeModelValue}
                  onChange={(e) => setFormData({ ...formData, feeModelValue: e.target.value })}
                  placeholder="0"
                />
              </div>
              {formData.feeModelType === "perUnit" && (
                <div className="space-y-2">
                  <Label htmlFor="feeModelUnit">Fee Unit</Label>
                  <Select value={formData.feeModelUnit} onValueChange={(v) => setFormData({ ...formData, feeModelUnit: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {areaUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="constructionCost">Construction Cost Estimate</Label>
                <Input
                  id="constructionCost"
                  type="number"
                  value={formData.constructionCostEstimate}
                  onChange={(e) => setFormData({ ...formData, constructionCostEstimate: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supervision">Supervision %</Label>
                <Input
                  id="supervision"
                  type="number"
                  value={formData.supervisionPercent}
                  onChange={(e) => setFormData({ ...formData, supervisionPercent: e.target.value })}
                  placeholder="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Location Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryAddress">Primary Address</Label>
                <Input
                  id="primaryAddress"
                  value={formData.primaryAddress}
                  onChange={(e) => setFormData({ ...formData, primaryAddress: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteType">Site Type</Label>
                <Select value={formData.siteType} onValueChange={(v: any) => setFormData({ ...formData, siteType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {siteTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Create User Dialog Component
function CreateUserDialog({
  open,
  onOpenChange,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "client" | "employee" | "procurement" | "accountant" | "hr";
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    password: "",
    email: "",
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User created successfully" });
      onOpenChange(false);
      setFormData({
        username: "",
        fullName: "",
        password: "",
        email: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userData = {
      username: formData.username,
      fullName: formData.fullName,
      password: formData.password,
      email: formData.email || undefined,
      role: role,
    };

    createUserMutation.mutate(userData);
  };

  const getRoleTitle = () => {
    const titles: Record<typeof role, string> = {
      client: "Client",
      employee: "Employee",
      procurement: "Procurement Manager",
      accountant: "Accountant",
      hr: "HR Manager",
    };
    return titles[role];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New {getRoleTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              minLength={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="optional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "Creating..." : `Create ${getRoleTitle()}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
