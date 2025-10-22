import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, logout } from "@/lib/auth";
import { Project, User, Task, ProcurementItem, Comment, insertProjectSchema, insertUserSchema, InsertProject, InsertUser } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Briefcase,
  Users,
  UserCheck,
  ShoppingCart,
  DollarSign,
  Calculator,
  Plus,
  UserPlus,
  ClipboardList,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  LogOut,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  activeEmployees: number;
  totalClients: number;
  pendingProcurement: number;
  totalTasks: number;
  completedTasks: number;
}

interface ProjectHealth {
  project: Project;
  health: "excellent" | "good" | "warning" | "critical";
  score: number;
  issues: string[];
}

type ActiveTab = "projects" | "employees" | "clients" | "procurement" | "accounts";

export default function PrincipleDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>("projects");
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [assignProjectOpen, setAssignProjectOpen] = useState(false);

  // Fetch all data
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: allProcurement = [] } = useQuery<ProcurementItem[]>({
    queryKey: ["/api/procurement/all"],
    queryFn: async () => {
      // Fetch procurement for all projects
      const procurementData: ProcurementItem[] = [];
      for (const project of projects) {
        try {
          const res = await fetch(`/api/procurement?projectId=${project.id}`, {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            procurementData.push(...data);
          }
        } catch (error) {
          console.error(`Failed to fetch procurement for project ${project.id}`, error);
        }
      }
      return procurementData;
    },
    enabled: projects.length > 0,
  });

  const { data: allComments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/comments/all"],
    queryFn: async () => {
      // Fetch comments for all projects
      const commentsData: Comment[] = [];
      for (const project of projects) {
        try {
          const res = await fetch(`/api/comments?projectId=${project.id}`, {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            commentsData.push(...data);
          }
        } catch (error) {
          console.error(`Failed to fetch comments for project ${project.id}`, error);
        }
      }
      return commentsData;
    },
    enabled: projects.length > 0,
  });

  // Calculate statistics
  const stats: DashboardStats = {
    totalProjects: projects.length,
    activeProjects: projects.length,
    activeEmployees: users.filter((u) => u.role === "employee" && u.isActive === 1).length,
    totalClients: users.filter((u) => u.role === "client").length,
    pendingProcurement: allProcurement.filter((p) => p.isPurchased === 0).length,
    totalTasks: allTasks.length,
    completedTasks: allTasks.filter((t) => t.status === "Done").length,
  };

  // Calculate project health
  const projectHealthScores: ProjectHealth[] = projects.map((project) => {
    const projectTasks = allTasks.filter((t) => t.projectId === project.id);
    const completedTasks = projectTasks.filter((t) => t.status === "Done").length;
    const totalTasks = projectTasks.length;
    const taskCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;

    const projectProcurement = allProcurement.filter((p) => p.projectId === project.id);
    const purchasedItems = projectProcurement.filter((p) => p.isPurchased === 1).length;
    const totalProcurement = projectProcurement.length;
    const procurementCompletion = totalProcurement > 0 ? (purchasedItems / totalProcurement) * 100 : 100;

    const score = (taskCompletion + procurementCompletion) / 2;
    const issues: string[] = [];

    if (taskCompletion < 50) issues.push("Low task completion");
    if (procurementCompletion < 50) issues.push("Pending procurement items");
    if (totalTasks === 0) issues.push("No tasks assigned");

    let health: ProjectHealth["health"] = "excellent";
    if (score < 40) health = "critical";
    else if (score < 60) health = "warning";
    else if (score < 80) health = "good";

    return { project, health, score, issues };
  });

  // Recent activity
  const recentActivity = [
    ...allTasks.map((t) => ({
      type: "task" as const,
      timestamp: new Date(t.updatedAt),
      data: t,
    })),
    ...allComments.map((c) => ({
      type: "comment" as const,
      timestamp: new Date(c.createdAt),
      data: c,
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  const handleLogout = async () => {
    await logout();
  };

  const getHealthColor = (health: ProjectHealth["health"]) => {
    switch (health) {
      case "excellent":
        return "text-green-500 border-green-500/50 bg-green-500/10";
      case "good":
        return "text-blue-500 border-blue-500/50 bg-blue-500/10";
      case "warning":
        return "text-yellow-500 border-yellow-500/50 bg-yellow-500/10";
      case "critical":
        return "text-red-500 border-red-500/50 bg-red-500/10";
    }
  };

  const getHealthIcon = (health: ProjectHealth["health"]) => {
    switch (health) {
      case "excellent":
        return <CheckCircle2 className="w-4 h-4" />;
      case "good":
        return <TrendingUp className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      case "critical":
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/20 border border-primary/50 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <a
                href="https://arka.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group"
                data-testid="link-arka-website"
              >
                <h1 className="text-2xl font-display font-bold text-foreground tracking-wide">
                  ARKA SERVICES
                </h1>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Principle Control Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-md bg-primary/10 border border-primary/40">
              <Avatar data-testid="avatar-user">
                <AvatarFallback className="bg-primary/20 text-primary font-display">
                  {user?.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase() || "ZA"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground" data-testid="text-user-name">
                  {user?.fullName || "ZARA"}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide" data-testid="text-user-role">
                  Principle
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pb-3">
          <Button
            variant={activeTab === "projects" ? "default" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => setActiveTab("projects")}
            data-testid="button-nav-projects"
          >
            <Briefcase className="w-4 h-4" />
            Projects
          </Button>
          <Button
            variant={activeTab === "employees" ? "default" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => setActiveTab("employees")}
            data-testid="button-nav-employees"
          >
            <Users className="w-4 h-4" />
            Employees
          </Button>
          <Button
            variant={activeTab === "clients" ? "default" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => setActiveTab("clients")}
            data-testid="button-nav-clients"
          >
            <UserCheck className="w-4 h-4" />
            Clients
          </Button>
          <Button
            variant={activeTab === "procurement" ? "default" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => setActiveTab("procurement")}
            data-testid="button-nav-procurement"
          >
            <ShoppingCart className="w-4 h-4" />
            Procurement
          </Button>
          <Button
            variant={activeTab === "accounts" ? "default" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => setActiveTab("accounts")}
            data-testid="button-nav-accounts"
          >
            <DollarSign className="w-4 h-4" />
            Accounts
          </Button>
          <Link href="/budget">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              data-testid="button-nav-budget-tool"
            >
              <Calculator className="w-4 h-4" />
              Budget Tool
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {activeTab === "projects" && (
            <>
              {/* Overview Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 hover-elevate" data-testid="card-total-projects">
              <div className="flex items-center justify-between">
                <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Total Projects
                      </p>
                      <p className="text-3xl font-display font-bold text-foreground mt-1" data-testid="text-total-projects">
                        {stats.totalProjects}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-md bg-primary/20 border border-primary/50 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover-elevate" data-testid="card-active-employees">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Active Employees
                      </p>
                      <p className="text-3xl font-display font-bold text-foreground mt-1" data-testid="text-active-employees">
                        {stats.activeEmployees}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-md bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover-elevate" data-testid="card-total-clients">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Total Clients
                      </p>
                      <p className="text-3xl font-display font-bold text-foreground mt-1" data-testid="text-total-clients">
                        {stats.totalClients}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-md bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover-elevate" data-testid="card-pending-procurement">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Pending Procurement
                      </p>
                      <p className="text-3xl font-display font-bold text-foreground mt-1" data-testid="text-pending-procurement">
                        {stats.pendingProcurement}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-md bg-orange-500/20 border border-orange-500/50 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-display font-bold text-foreground">
                      Quick Actions
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 border-primary/50 hover:border-primary"
                      onClick={() => setCreateProjectOpen(true)}
                      data-testid="button-create-project"
                    >
                      <Plus className="w-4 h-4" />
                      Create Project
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 border-blue-500/50 hover:border-blue-500"
                      onClick={() => setAddEmployeeOpen(true)}
                      data-testid="button-add-employee"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Employee
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 border-purple-500/50 hover:border-purple-500"
                      onClick={() => setAssignProjectOpen(true)}
                      data-testid="button-assign-project"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Assign Project
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 border-orange-500/50 hover:border-orange-500"
                      onClick={() => toast({ title: "Reports", description: "Reports feature coming soon!" })}
                      data-testid="button-view-reports"
                    >
                      <FileText className="w-4 h-4" />
                      View Reports
                    </Button>
                  </div>
                </Card>

                {/* Recent Activity Feed */}
                <Card className="p-6 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-display font-bold text-foreground">
                      Recent Activity
                    </h2>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {recentActivity.length === 0 ? (
                        <p className="text-sm text-muted-foreground" data-testid="text-no-activity">
                          No recent activity
                        </p>
                      ) : (
                        recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-md flex items-center justify-center ${
                                activity.type === "task"
                                  ? "bg-blue-500/20 border border-blue-500/50"
                                  : "bg-purple-500/20 border border-purple-500/50"
                              }`}
                            >
                              {activity.type === "task" ? (
                                <ClipboardList className="w-4 h-4 text-blue-500" />
                              ) : (
                                <MessageSquare className="w-4 h-4 text-purple-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground" data-testid={`text-activity-${index}`}>
                                {activity.type === "task" ? (
                                  <>
                                    Task <span className="font-semibold">{activity.data.taskType}</span>{" "}
                                    updated to{" "}
                                    <Badge variant="outline" className="ml-1">
                                      {activity.data.status}
                                    </Badge>
                                  </>
                                ) : (
                                  <>New comment added</>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground" data-testid={`text-activity-time-${index}`}>
                                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </div>

              {/* Project Health Dashboard */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-display font-bold text-foreground">
                    System-Wide Project Health
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projectHealthScores.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-full" data-testid="text-no-projects">
                      No projects available
                    </p>
                  ) : (
                    projectHealthScores.map((ph) => (
                      <Card
                        key={ph.project.id}
                        className={`p-4 border ${getHealthColor(ph.health)} hover-elevate`}
                        data-testid={`card-project-health-${ph.project.id}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-foreground truncate" data-testid={`text-project-name-${ph.project.id}`}>
                            {ph.project.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {getHealthIcon(ph.health)}
                            <span className="text-xs font-mono font-bold" data-testid={`text-health-score-${ph.project.id}`}>
                              {ph.score.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <Separator className="mb-3" />
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {ph.health}
                          </Badge>
                          {ph.issues.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {ph.issues.map((issue, i) => (
                                <p
                                  key={i}
                                  className="text-xs text-muted-foreground"
                                  data-testid={`text-issue-${ph.project.id}-${i}`}
                                >
                                  • {issue}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Card>
                </>
              )}

          {activeTab === "employees" && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold text-foreground">
                  Employee Management
                </h2>
              </div>
              <div className="space-y-4">
                {users.filter((u) => u.role === "employee").map((employee) => (
                  <Card key={employee.id} className="p-4 hover-elevate" data-testid={`card-employee-${employee.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-blue-500/20 text-blue-500">
                            {employee.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{employee.fullName}</p>
                          <p className="text-xs text-muted-foreground">{employee.username}</p>
                        </div>
                      </div>
                      <Badge variant={employee.isActive === 1 ? "default" : "outline"}>
                        {employee.isActive === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </Card>
                ))}
                {users.filter((u) => u.role === "employee").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No employees found</p>
                )}
              </div>
            </Card>
          )}

          {activeTab === "clients" && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold text-foreground">
                  Client Management
                </h2>
              </div>
              <div className="space-y-4">
                {users.filter((u) => u.role === "client").map((client) => (
                  <Card key={client.id} className="p-4 hover-elevate" data-testid={`card-client-${client.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-purple-500/20 text-purple-500">
                            {client.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{client.fullName}</p>
                          <p className="text-xs text-muted-foreground">{client.username}</p>
                        </div>
                      </div>
                      <Badge variant={client.isActive === 1 ? "default" : "outline"}>
                        {client.isActive === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </Card>
                ))}
                {users.filter((u) => u.role === "client").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No clients found</p>
                )}
              </div>
            </Card>
          )}

          {activeTab === "procurement" && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold text-foreground">
                  Procurement Overview
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase">Total Items</p>
                  <p className="text-2xl font-bold text-foreground">{allProcurement.length}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase">Pending Purchase</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {allProcurement.filter((p) => p.isPurchased === 0).length}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase">Purchased</p>
                  <p className="text-2xl font-bold text-green-500">
                    {allProcurement.filter((p) => p.isPurchased === 1).length}
                  </p>
                </Card>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {allProcurement.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-md border hover-elevate"
                      data-testid={`procurement-item-${item.id}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.itemName}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × {Number(item.projectCost).toLocaleString('en-PK')} PKR
                        </p>
                      </div>
                      <Badge variant={item.isPurchased === 1 ? "default" : "outline"}>
                        {item.isPurchased === 1 ? "Purchased" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                  {allProcurement.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No procurement items found</p>
                  )}
                </div>
              </ScrollArea>
            </Card>
          )}

          {activeTab === "accounts" && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold text-foreground">
                  Accounts & Financial Overview
                </h2>
              </div>
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">Accounts Management</p>
                <p className="text-sm text-muted-foreground">
                  Financial overview and account management features coming soon
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog 
        open={createProjectOpen} 
        onOpenChange={setCreateProjectOpen}
      />

      {/* Add Employee Dialog */}
      <AddEmployeeDialog 
        open={addEmployeeOpen} 
        onOpenChange={setAddEmployeeOpen}
      />

      {/* Assign Project Dialog */}
      <AssignProjectDialog 
        open={assignProjectOpen} 
        onOpenChange={setAssignProjectOpen}
        projects={projects}
        employees={users.filter(u => u.role === "employee")}
      />
    </div>
  );
}

// Create Project Dialog Component
function CreateProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      clientName: "",
      projectTitle: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProject) => {
    createProjectMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to the system
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} data-testid="input-project-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter client name" 
                      {...field} 
                      value={field.value || ""}
                      data-testid="input-client-name" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter project title" 
                      {...field} 
                      value={field.value || ""}
                      data-testid="input-project-title" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-create-project"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProjectMutation.isPending}
                data-testid="button-submit-create-project"
              >
                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Add Employee Dialog Component
function AddEmployeeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema.extend({
      password: insertUserSchema.shape.password,
    })),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      role: "employee",
      isActive: 1,
    },
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await apiRequest("POST", "/api/users", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "Employee added successfully!",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertUser) => {
    addEmployeeMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Create a new employee account
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} data-testid="input-employee-fullname" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} data-testid="input-employee-username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter password" 
                      {...field}
                      value={field.value || ""}
                      data-testid="input-employee-password" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-add-employee"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addEmployeeMutation.isPending}
                data-testid="button-submit-add-employee"
              >
                {addEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Assign Project Dialog Component
function AssignProjectDialog({ 
  open, 
  onOpenChange,
  projects,
  employees 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  employees: User[];
}) {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  const assignProjectMutation = useMutation({
    mutationFn: async ({ projectId, employeeId }: { projectId: string; employeeId: string }) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/assign`, { employeeId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Project assigned successfully!",
      });
      setSelectedProject("");
      setSelectedEmployee("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign project",
        variant: "destructive",
      });
    },
  });

  const handleAssign = () => {
    if (!selectedProject || !selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select both a project and an employee",
        variant: "destructive",
      });
      return;
    }
    assignProjectMutation.mutate({
      projectId: selectedProject,
      employeeId: selectedEmployee,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Project to Employee</DialogTitle>
          <DialogDescription>
            Select a project and an employee to assign
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Project</label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger data-testid="select-assign-project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Employee</label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger data-testid="select-assign-employee">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-assign"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={assignProjectMutation.isPending}
              data-testid="button-submit-assign"
            >
              {assignProjectMutation.isPending ? "Assigning..." : "Assign Project"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
