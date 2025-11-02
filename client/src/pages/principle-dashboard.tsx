import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, logout } from "@/lib/auth";
import { Project, User, Task, ProcurementItem, Comment, Attendance, Salary, SalaryAdvance, insertProjectSchema, insertUserSchema, InsertProject, designations } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { apiFetch } from "@/lib/api";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AssignTaskDialog, EditUserDialog } from "./principle-dashboard-dialogs";
import { TaskProgressGraph } from "@/components/TaskProgressGraph";
import { EmployeeDetailModal } from "@/components/EmployeeDetailModal";
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
  CalendarIcon,
  Receipt,
} from "lucide-react";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { Link } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

type ActiveTab = "projects" | "employees" | "clients" | "procurement" | "accounts" | "tasks" | "users" | "salary";

export default function PrincipleDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>("projects");
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [assignProjectOpen, setAssignProjectOpen] = useState(false);
  const [assignTaskOpen, setAssignTaskOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [generateSalaryOpen, setGenerateSalaryOpen] = useState(false);
  const [selectedEmployeeForSalary, setSelectedEmployeeForSalary] = useState<User | null>(null);
  const [recordAdvanceOpen, setRecordAdvanceOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [employeeDetailOpen, setEmployeeDetailOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Fetch all data
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: allEmployees = [] } = useQuery<any[]>({
    queryKey: ["/api/employees"],
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
          const res = await apiFetch(`/api/procurement?projectId=${project.id}`);
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
          const res = await apiFetch(`/api/comments?projectId=${project.id}`);
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

  const { data: allAttendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance/all"],
    queryFn: async () => {
      // Fetch attendance for all employees
      const attendanceData: Attendance[] = [];
      const employees = users.filter(u => u.role === "employee");
      for (const employee of employees) {
        try {
          const res = await apiFetch(`/api/attendance?employeeId=${employee.id}`);
          if (res.ok) {
            const data = await res.json();
            attendanceData.push(...data);
          }
        } catch (error) {
          console.error(`Failed to fetch attendance for employee ${employee.id}`, error);
        }
      }
      return attendanceData;
    },
    enabled: users.length > 0,
  });

  // Fetch all salaries
  const { data: allSalaries = [] } = useQuery<Salary[]>({
    queryKey: ["/api/salaries"],
    enabled: users.length > 0,
  });

  // Fetch all salary advances
  const { data: allAdvances = [] } = useQuery<SalaryAdvance[]>({
    queryKey: ["/api/salary-advances"],
    enabled: users.length > 0,
  });

  // Salary API handlers
  const handleGenerateSalary = async (employeeId: string, month: string) => {
    try {
      const response = await apiRequest('POST', '/api/salaries/generate', {
        employeeId,
        month
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate salary');
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/salaries"] });
      toast({
        title: "Success",
        description: "Salary generated successfully!"
      });
      setGenerateSalaryOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate salary",
        variant: "destructive"
      });
    }
  };

  const handleRecordAdvance = async (data: {
    employeeId: string;
    amount: number;
    date: string;
    reason?: string;
  }) => {
    try {
      const response = await apiRequest('POST', '/api/salary-advances', data);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to record advance');
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/salary-advances"] });
      toast({
        title: "Success",
        description: "Advance recorded successfully!"
      });
      setRecordAdvanceOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record advance",
        variant: "destructive"
      });
    }
  };

  const handleRecordPayment = async (data: {
    salaryId: string;
    amount: number;
    paymentDate: string;
    paymentMethod?: string;
    notes?: string;
  }) => {
    try {
      const response = await apiRequest('POST', '/api/salary-payments', data);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to record payment');
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/salaries"] });
      toast({
        title: "Success",
        description: "Payment recorded successfully!"
      });
      setRecordPaymentOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive"
      });
    }
  };

  const handleHoldSalary = async (salaryId: string) => {
    try {
      const response = await apiRequest('PATCH', `/api/salaries/${salaryId}/hold`, {});

      if (!response.ok) {
        throw new Error('Failed to hold salary');
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/salaries"] });
      toast({
        title: "Success",
        description: "Salary held successfully!"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to hold salary",
        variant: "destructive"
      });
    }
  };

  const handleReleaseSalary = async (salaryId: string) => {
    try {
      const response = await apiRequest('PATCH', `/api/salaries/${salaryId}/release`, {});

      if (!response.ok) {
        throw new Error('Failed to release salary');
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/salaries"] });
      toast({
        title: "Success",
        description: "Salary released successfully!"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to release salary",
        variant: "destructive"
      });
    }
  };

  // Calculate statistics
  const stats: DashboardStats = {
    totalProjects: projects.length,
    activeProjects: projects.length,
    activeEmployees: users.filter((u) => u.role === "employee" && (u.isActive === 1 || u.isActive === true)).length,
    totalClients: users.filter((u) => u.role === "client").length,
    pendingProcurement: allProcurement.filter((p) => (p.isPurchased === 0 || p.isPurchased === false)).length,
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
    const purchasedItems = projectProcurement.filter((p) => (p.isPurchased === 1 || p.isPurchased === true)).length;
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
                  {user?.fullName?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "ZA"}
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
          <Button
            variant={activeTab === "tasks" ? "default" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => setActiveTab("tasks")}
            data-testid="button-nav-tasks"
          >
            <ClipboardList className="w-4 h-4" />
            Tasks
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => setActiveTab("users")}
            data-testid="button-nav-users"
          >
            <UserPlus className="w-4 h-4" />
            Users
          </Button>
          <Button
            variant={activeTab === "salary" ? "default" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => setActiveTab("salary")}
            data-testid="button-nav-salary"
          >
            <DollarSign className="w-4 h-4" />
            Salary
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
          <Link href="/timesheet-management">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              data-testid="button-nav-timesheet"
            >
              <Clock className="w-4 h-4" />
              Timesheets
            </Button>
          </Link>
          <Link href="/billing-invoicing">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              data-testid="button-nav-billing"
            >
              <FileText className="w-4 h-4" />
              Billing
            </Button>
          </Link>
          <Link href="/expense-tracking">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              data-testid="button-nav-expenses"
            >
              <Receipt className="w-4 h-4" />
              Expenses
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-display font-bold text-foreground">
                    Employee Management
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total Employees: {users.filter((u) => u.role === "employee").length}
                </p>
              </div>
              <div className="space-y-4">
                {users.filter((u) => u.role === "employee").map((employee) => {
                  const employeeTasks = allTasks.filter(t => t.employeeId === employee.id);
                  const completedTasks = employeeTasks.filter(t => t.status === "Done").length;
                  const totalTasks = employeeTasks.length;

                  // Calculate this month's attendance
                  const now = new Date();
                  const currentMonth = now.getMonth();
                  const currentYear = now.getFullYear();
                  const employeeAttendance = allAttendance.filter(a => {
                    const attendanceDate = new Date(a.attendanceDate);
                    return a.employeeId === employee.id &&
                           attendanceDate.getMonth() === currentMonth &&
                           attendanceDate.getFullYear() === currentYear;
                  });
                  const presentDays = employeeAttendance.filter(a => a.isPresent === true).length;
                  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

                  const employeeData = allEmployees.find(e => e.userId === employee.id);

                  return (
                    <Card
                      key={employee.id}
                      className="p-4 hover-elevate cursor-pointer transition-all hover:shadow-lg"
                      data-testid={`card-employee-${employee.id}`}
                      onClick={() => {
                        if (employeeData?.id) {
                          setSelectedEmployeeId(employeeData.id);
                          setEmployeeDetailOpen(true);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar>
                            <AvatarFallback className="bg-blue-500/20 text-blue-500">
                              {employee.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{employee.fullName}</p>
                            <p className="text-xs text-muted-foreground">{employee.username}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground">
                                Tasks: {completedTasks}/{totalTasks} completed
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Attendance: {presentDays}/{totalDays} days
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Badge variant={(employee.isActive === 1 || employee.isActive === true) ? "default" : "outline"}>
                            {(employee.isActive === 1 || employee.isActive === true) ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(employee);
                              setEditUserOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
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
                      <Badge variant={(client.isActive === 1 || client.isActive === true) ? "default" : "outline"}>
                        {(client.isActive === 1 || client.isActive === true) ? "Active" : "Inactive"}
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
                    {allProcurement.filter((p) => (p.isPurchased === 0 || p.isPurchased === false)).length}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground uppercase">Purchased</p>
                  <p className="text-2xl font-bold text-green-500">
                    {allProcurement.filter((p) => (p.isPurchased === 1 || p.isPurchased === true)).length}
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
                      <Badge variant={(item.isPurchased === 1 || item.isPurchased === true) ? "default" : "outline"}>
                        {(item.isPurchased === 1 || item.isPurchased === true) ? "Purchased" : "Pending"}
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

          {activeTab === "tasks" && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-display font-bold text-foreground">
                    Task Management
                  </h2>
                </div>
                <Button onClick={() => setAssignTaskOpen(true)} data-testid="button-assign-task">
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Task
                </Button>
              </div>
              
              {/* Task Progress Graph */}
              <TaskProgressGraph />
              
              <div className="space-y-4 mt-6">
                {allTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold text-foreground mb-2">No Tasks Yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start by assigning tasks to your employees
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allTasks.map((task: any) => {
                      const employee = users.find(u => u.id === task.employeeId);
                      const project = projects.find(p => p.id === task.projectId);
                      return (
                        <Card key={task.id} className="p-4 hover-elevate" data-testid={`card-task-${task.id}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={
                                  task.status === "Done" ? "default" : 
                                  task.status === "In Progress" ? "secondary" : "outline"
                                }>
                                  {task.status}
                                </Badge>
                                <Badge variant="outline">{task.taskType}</Badge>
                              </div>
                              <p className="font-semibold text-foreground">{task.description || task.taskType}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>Assigned to: {employee?.fullName || "Unknown"}</span>
                                <span>Project: {project?.name || "Unknown"}</span>
                                {task.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(task.dueDate), "MMM dd, yyyy")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === "users" && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-display font-bold text-foreground">
                    User Management
                  </h2>
                </div>
              </div>
              <div className="space-y-3">
                {users.map((u: User) => (
                  <Card key={u.id} className="p-4 hover-elevate" data-testid={`card-user-${u.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                            {u.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{u.fullName}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{u.username}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {u.role}
                            </Badge>
                            <span>•</span>
                            {(u.isActive === 1 || u.isActive === true) ? (
                              <span className="text-green-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <span className="text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(u);
                          setEditUserOpen(true);
                        }}
                        data-testid={`button-edit-user-${u.id}`}
                      >
                        Edit
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {activeTab === "salary" && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold text-foreground">
                  Employee Salary Management
                </h2>
              </div>

              <div className="space-y-4">
                {users.filter((u) => u.role === "employee").map((user) => {
                  // Find employee data for this user
                  const employeeData = allEmployees.find(e => e.userId === user.id);

                  const employeeTasks = allTasks.filter(t => t.employeeId === user.id);
                  const pendingTasks = employeeTasks.filter(t => t.status !== "Done").length;

                  // Calculate this month's attendance
                  const now = new Date();
                  const currentMonth = now.getMonth();
                  const currentYear = now.getFullYear();
                  const currentMonthStr = format(now, 'yyyy-MM');
                  const employeeAttendance = allAttendance.filter(a => {
                    const attendanceDate = new Date(a.attendanceDate);
                    return a.employeeId === user.id &&
                           attendanceDate.getMonth() === currentMonth &&
                           attendanceDate.getFullYear() === currentYear;
                  });
                  const presentDays = employeeAttendance.filter(a => a.isPresent === true).length;

                  // Get current month's salary
                  const currentSalary = allSalaries.find(s =>
                    s.employeeId === user.id && s.month === currentMonthStr
                  );

                  // Get employee advances for current month
                  const employeeAdvances = allAdvances.filter(a =>
                    a.employeeId === user.id
                  );
                  const currentMonthAdvances = employeeAdvances.filter(a => {
                    const advDate = new Date(a.date);
                    return advDate.getMonth() === currentMonth &&
                           advDate.getFullYear() === currentYear;
                  });
                  const totalAdvances = currentMonthAdvances.reduce((sum, a) => sum + a.amount, 0);

                  return (
                    <Card key={user.id} className="p-5 hover-elevate border-primary/20" data-testid={`card-salary-${user.id}`}>
                      <div className="space-y-4">
                        {/* Employee Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                {user.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-lg text-foreground">{user.fullName}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{user.username}</span>
                                {pendingTasks > 0 && (
                                  <>
                                    <span>•</span>
                                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                                      {pendingTasks} Pending Task{pendingTasks > 1 ? 's' : ''}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {currentSalary ? (
                              <div className="text-sm">
                                <Badge variant={currentSalary.isPaid ? "default" : currentSalary.isHeld ? "destructive" : "secondary"}>
                                  {currentSalary.isHeld ? 'Salary Held' : currentSalary.isPaid ? 'Fully Paid' : `Pending: PKR ${currentSalary.remainingAmount.toLocaleString()}`}
                                </Badge>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedEmployeeForSalary(user);
                                  setGenerateSalaryOpen(true);
                                }}
                                data-testid={`button-view-salary-${user.id}`}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Generate Salary
                              </Button>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Salary Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-xs text-muted-foreground mb-1">Monthly Package</p>
                            <p className="text-sm font-bold text-foreground">
                              PKR {(employeeData?.basicSalary || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Basic Salary
                            </p>
                          </div>
                          <div className="bg-green-500/10 p-3 rounded-md border border-green-500/20">
                            <p className="text-xs text-muted-foreground mb-1">Attendance (This Month)</p>
                            <p className="text-sm font-bold text-green-600">
                              {presentDays} Days Present
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Out of {new Date(currentYear, currentMonth + 1, 0).getDate()} days
                            </p>
                          </div>
                          <div className="bg-blue-500/10 p-3 rounded-md border border-blue-500/20">
                            <p className="text-xs text-muted-foreground mb-1">Salary Status</p>
                            {currentSalary ? (
                              <>
                                <Badge variant={currentSalary.isPaid ? "default" : "secondary"} className="text-xs">
                                  {currentSalary.isHeld ? 'Held' : currentSalary.isPaid ? 'Paid' : 'Pending Payment'}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  PKR {currentSalary.netSalary.toLocaleString()}
                                </p>
                              </>
                            ) : (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  Not Generated
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(now, "MMMM yyyy")}
                                </p>
                              </>
                            )}
                          </div>
                          <div className={`p-3 rounded-md border ${
                            pendingTasks > 0
                              ? 'bg-orange-500/10 border-orange-500/20'
                              : 'bg-green-500/10 border-green-500/20'
                          }`}>
                            <p className="text-xs text-muted-foreground mb-1">Task Status</p>
                            <p className={`text-sm font-bold ${
                              pendingTasks > 0 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {pendingTasks > 0 ? `${pendingTasks} Pending` : 'All Clear'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {employeeTasks.length} total tasks
                            </p>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployeeForSalary(user);
                              setGenerateSalaryOpen(true);
                            }}
                            disabled={!!currentSalary}
                          >
                            Generate Salary
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployeeForSalary(user);
                              setRecordAdvanceOpen(true);
                            }}
                          >
                            Record Advance
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSalary(currentSalary || null);
                              setRecordPaymentOpen(true);
                            }}
                            disabled={!currentSalary || currentSalary.isPaid}
                          >
                            Record Payment
                          </Button>
                          {currentSalary && currentSalary.isHeld ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-500/50 text-green-600"
                              onClick={() => handleReleaseSalary(currentSalary.id)}
                            >
                              Release Salary
                            </Button>
                          ) : currentSalary && !currentSalary.isHeld && pendingTasks > 0 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-orange-500/50 text-orange-600"
                              onClick={() => handleHoldSalary(currentSalary.id)}
                            >
                              Hold Salary
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {users.filter((u) => u.role === "employee").length === 0 && (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold text-foreground mb-2">No Employees Found</p>
                    <p className="text-sm text-muted-foreground">
                      Add employees to start managing salaries
                    </p>
                  </div>
                )}
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

      {/* Assign Task Dialog */}
      <AssignTaskDialog 
        open={assignTaskOpen} 
        onOpenChange={setAssignTaskOpen}
        projects={projects}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editUserOpen}
        onOpenChange={setEditUserOpen}
        user={selectedUser}
      />

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        open={employeeDetailOpen}
        onOpenChange={setEmployeeDetailOpen}
        employeeId={selectedEmployeeId}
      />

      {/* Generate Salary Dialog */}
      <GenerateSalaryDialog
        open={generateSalaryOpen}
        onOpenChange={setGenerateSalaryOpen}
        employee={selectedEmployeeForSalary}
        onGenerate={handleGenerateSalary}
      />

      {/* Record Advance Dialog */}
      <RecordAdvanceDialog
        open={recordAdvanceOpen}
        onOpenChange={setRecordAdvanceOpen}
        employee={selectedEmployeeForSalary}
        onRecord={handleRecordAdvance}
      />

      {/* Record Payment Dialog */}
      <RecordPaymentDialog
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        salary={selectedSalary}
        onRecord={handleRecordPayment}
      />
    </div>
  );
}

// Create Project Dialog Component with Client Creation
function CreateProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");

  const projectClientSchema = z.object({
    // Project fields
    projectName: z.string().min(1, "Project name is required"),
    projectTitle: z.string().optional(),
    startDate: z.date().optional(),
    deliveryDate: z.date().optional(),
    // Client user fields
    fullName: z.string().min(1, "Client full name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    // Client detail fields
    company: z.string().optional(),
    profession: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(projectClientSchema),
    defaultValues: {
      projectName: "",
      projectTitle: "",
      fullName: "",
      username: "",
      password: "",
      company: "",
      profession: "",
      email: "",
      contactNumber: "",
      address: "",
    },
  });

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      let profilePictureUrl = "";

      // Upload profile picture if provided
      if (profilePictureFile) {
        const formData = new FormData();
        formData.append("file", profilePictureFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!uploadRes.ok) throw new Error("Failed to upload profile picture");
        const uploadData = await uploadRes.json();
        profilePictureUrl = uploadData.url;
      }

      // 1. Create client user account
      const userRes = await apiRequest("POST", "/api/users", {
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        role: "client",
      });
      const user = await userRes.json();

      // 2. Create client details
      await apiRequest("POST", "/api/clients", {
        userId: user.id,
        company: data.company || "",
        profession: data.profession || "",
        email: data.email || "",
        contactNumber: data.contactNumber || "",
        address: data.address || "",
        profilePicture: profilePictureUrl,
      });

      // 3. Create project
      const projectRes = await apiRequest("POST", "/api/projects", {
        name: data.projectName,
        clientName: data.fullName,
        projectTitle: data.projectTitle,
        startDate: data.startDate,
        deliveryDate: data.deliveryDate,
      });
      const project = await projectRes.json();

      // 4. Assign client to project
      await apiRequest("POST", "/api/assignments", {
        projectId: project.id,
        userId: user.id,
        assignedBy: "", // Will be set by backend from req.user
      });

      return { user, project };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Project and client account created successfully!",
      });
      form.reset();
      setProfilePictureFile(null);
      setProfilePicturePreview("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project and client",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createProjectMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project with Client</DialogTitle>
          <DialogDescription>
            Add a new project and create a client account
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} />
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
                        <Input placeholder="Enter project title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Client Account Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Client Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client full name" {...field} />
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
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username for login" {...field} />
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
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profession</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter profession" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Profile Picture Upload */}
              <div className="space-y-2">
                <FormLabel>Client Profile Picture</FormLabel>
                <div className="flex items-center gap-4">
                  {profilePicturePreview && (
                    <img
                      src={profilePicturePreview}
                      alt="Profile Preview"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setProfilePictureFile(null);
                  setProfilePicturePreview("");
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? "Creating..." : "Create Project & Client"}
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
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
  
  const form = useForm({
    resolver: zodResolver(insertUserSchema.extend({
      idCard: z.string().min(1, "ID Card is required"),
      email: z.string().email("Invalid email address").optional().or(z.literal("")),
      whatsapp: z.string().min(1, "WhatsApp number is required"),
      homeAddress: z.string().min(1, "Home address is required"),
      joiningDate: z.date({ required_error: "Joining date is required" }),
      designation: z.string().min(1, "Designation is required"),
      basicSalary: z.number().min(0, "Basic salary must be positive").optional(),
      travelingAllowance: z.number().min(0).optional(),
      medicalAllowance: z.number().min(0).optional(),
      foodAllowance: z.number().min(0).optional(),
      salaryDate: z.number().min(1).max(31).optional(),
    })),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      role: "employee" as const,
      isActive: 1,
      idCard: "",
      email: "",
      whatsapp: "",
      homeAddress: "",
      joiningDate: new Date(),
      designation: "",
      basicSalary: 0,
      travelingAllowance: 0,
      medicalAllowance: 0,
      foodAllowance: 0,
      salaryDate: 1,
    },
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert profile picture to base64 if exists
      let profilePictureBase64 = "";
      if (profilePictureFile) {
        const reader = new FileReader();
        profilePictureBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(profilePictureFile);
        });
      }

      // Create employee with user account in a single atomic operation
      const res = await apiRequest("POST", "/api/employees/create", {
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        role: data.role,
        isActive: data.isActive,
        idCard: data.idCard,
        email: data.email || "",
        whatsapp: data.whatsapp,
        homeAddress: data.homeAddress,
        joiningDate: data.joiningDate.toISOString(),
        profilePicture: profilePictureBase64 || undefined,
        designation: data.designation,
        basicSalary: data.basicSalary || 0,
        travelingAllowance: data.travelingAllowance || 0,
        medicalAllowance: data.medicalAllowance || 0,
        foodAllowance: data.foodAllowance || 0,
        salaryDate: data.salaryDate || 1,
      });
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: "Employee added successfully!",
      });
      form.reset();
      setProfilePictureFile(null);
      setProfilePicturePreview("");
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

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: any) => {
    addEmployeeMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Create a new employee account with profile details
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
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
                    <FormLabel>Username *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} data-testid="input-employee-username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
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
              <FormField
                control={form.control}
                name="idCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Card Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ID card number" {...field} data-testid="input-employee-idcard" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} data-testid="input-employee-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="+92 xxx xxxxxxx" {...field} data-testid="input-employee-whatsapp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="joiningDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Joining Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                            data-testid="button-joining-date"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="homeAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Address *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter complete home address"
                      className="resize-none"
                      {...field}
                      data-testid="input-employee-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-designation">
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {designations.map((designation) => (
                        <SelectItem key={designation} value={designation}>
                          {designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />
            <h3 className="text-lg font-semibold mb-4">Salary Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="basicSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Basic Salary (PKR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-basic-salary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="travelingAllowance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Traveling Allowance (PKR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-traveling-allowance"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="medicalAllowance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Allowance (PKR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="3000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-medical-allowance"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="foodAllowance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Allowance (PKR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-food-allowance"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="salaryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Payment Date (Day of Month)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      data-testid="input-salary-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Profile Picture</FormLabel>
              <div className="mt-2 flex items-center gap-4">
                {profilePicturePreview && (
                  <div className="w-24 h-24 rounded-md border-2 border-primary/50 overflow-hidden">
                    <img src={profilePicturePreview} alt="Profile preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="cursor-pointer"
                    data-testid="input-employee-photo"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a profile picture (JPG, PNG, max 5MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setProfilePictureFile(null);
                  setProfilePicturePreview("");
                  onOpenChange(false);
                }}
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

// Generate Salary Dialog Component
function GenerateSalaryDialog({
  open,
  onOpenChange,
  employee,
  onGenerate
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: User | null;
  onGenerate: (employeeId: string, month: string) => Promise<void>;
}) {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    setIsLoading(true);
    try {
      await onGenerate(employee.id, selectedMonth);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Salary</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Employee: <span className="font-semibold text-foreground">{employee?.fullName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Basic Salary: <span className="font-semibold text-foreground">PKR {((employee as any)?.basicSalary || 0).toLocaleString()}</span>
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Month</label>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              max={format(new Date(), 'yyyy-MM')}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate Salary"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Record Advance Dialog Component
function RecordAdvanceDialog({
  open,
  onOpenChange,
  employee,
  onRecord
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: User | null;
  onRecord: (data: { employeeId: string; amount: number; date: string; reason?: string }) => Promise<void>;
}) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    setIsLoading(true);
    try {
      await onRecord({
        employeeId: employee.id,
        amount: parseFloat(amount),
        date,
        reason: reason || undefined
      });
      setAmount('');
      setReason('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Salary Advance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Employee: <span className="font-semibold text-foreground">{employee?.fullName}</span>
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (PKR) *</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date *</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason (Optional)</label>
            <Input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Medical emergency"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Recording..." : "Record Advance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Record Payment Dialog Component
function RecordPaymentDialog({
  open,
  onOpenChange,
  salary,
  onRecord
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salary: Salary | null;
  onRecord: (data: { salaryId: string; amount: number; paymentDate: string; paymentMethod?: string; notes?: string }) => Promise<void>;
}) {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salary) return;

    setIsLoading(true);
    try {
      await onRecord({
        salaryId: salary.id,
        amount: parseFloat(amount),
        paymentDate,
        paymentMethod: paymentMethod || undefined,
        notes: notes || undefined
      });
      setAmount('');
      setPaymentMethod('');
      setNotes('');
      setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Salary Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {salary && (
            <div className="space-y-2 bg-muted/50 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                Month: <span className="font-semibold text-foreground">{format(parseISO(salary.month + '-01'), 'MMMM yyyy')}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Net Salary: <span className="font-semibold text-foreground">PKR {salary.netSalary.toLocaleString()}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Remaining: <span className="font-semibold text-orange-600">PKR {salary.remainingAmount.toLocaleString()}</span>
              </p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (PKR) *</label>
            <Input
              type="number"
              min="0"
              max={salary?.remainingAmount || 0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Date *</label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method (Optional)</label>
            <Input
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="e.g., Bank Transfer, Cash"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., First installment"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
