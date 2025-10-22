import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { useAuth, logout } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Task, Attendance, Salary, Project, Employee } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  Download,
  User,
  BarChart3,
  CheckCheck,
} from "lucide-react";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), "yyyy-MM"));

  // Fetch employee details
  const { data: employee } = useQuery<Employee>({
    queryKey: ["/api/employees", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/employees/${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch employee");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks?employeeId=${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch attendance for selected month
  const { data: attendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance", user?.id, selectedMonth],
    queryFn: async () => {
      const res = await fetch(`/api/attendance?employeeId=${user?.id}&month=${selectedMonth}`);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch salaries
  const { data: salaries = [] } = useQuery<Salary[]>({
    queryKey: ["/api/salaries", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/salaries?employeeId=${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch salaries");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", user?.id] });
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    },
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/attendance", {
        employeeId: user?.id,
        attendanceDate: new Date().toISOString(),
        isPresent: 1,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance", user?.id, selectedMonth] });
      toast({
        title: "Attendance marked",
        description: "Your attendance has been marked for today.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark attendance.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout.",
        variant: "destructive",
      });
    }
  };

  // Filter tasks by project
  const filteredTasks = selectedProjectId === "all" 
    ? tasks 
    : tasks.filter(task => task.projectId === selectedProjectId);

  // Get current month salary
  const currentMonth = format(new Date(), "yyyy-MM");
  const currentSalary = salaries.find(s => s.month === currentMonth);

  // Check if attendance is already marked today
  const today = new Date();
  const isAttendanceMarkedToday = attendance.some(a => 
    isSameDay(parseISO(a.attendanceDate as any), today) && a.isPresent === 1
  );

  // Generate calendar days for selected month
  const monthStart = startOfMonth(parseISO(`${selectedMonth}-01`));
  const monthEnd = endOfMonth(parseISO(`${selectedMonth}-01`));
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Task status statistics
  const taskStats = {
    total: filteredTasks.length,
    done: filteredTasks.filter(t => t.status === "Done").length,
    inProgress: filteredTasks.filter(t => t.status === "In Progress").length,
    undone: filteredTasks.filter(t => t.status === "Undone").length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Done":
        return <CheckCircle2 className="w-4 h-4 text-green-500" data-testid="icon-status-done" />;
      case "In Progress":
        return <Clock className="w-4 h-4 text-yellow-500" data-testid="icon-status-inprogress" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" data-testid="icon-status-undone" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Done":
        return "default";
      case "In Progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  const downloadSalarySlip = () => {
    if (!currentSalary) {
      toast({
        title: "No salary data",
        description: "No salary data available for the current month.",
        variant: "destructive",
      });
      return;
    }

    // Create a simple text-based salary slip
    const slipContent = `
ARKA SERVICES - SALARY SLIP
============================
Employee: ${user?.fullName}
Month: ${currentSalary.month}

EARNINGS:
Basic Salary:    PKR ${Number(currentSalary.basicSalary).toLocaleString()}
Incentives:      PKR ${Number(currentSalary.incentives).toLocaleString()}
Medical:         PKR ${Number(currentSalary.medical).toLocaleString()}

DEDUCTIONS:
Tax:             PKR ${Number(currentSalary.tax).toLocaleString()}
Deductions:      PKR ${Number(currentSalary.deductions).toLocaleString()}

NET SALARY:      PKR ${Number(currentSalary.netSalary).toLocaleString()}

Payment Status: ${currentSalary.isPaid ? 'PAID' : 'NOT PAID'}
${currentSalary.paidDate ? `Payment Date: ${format(parseISO(currentSalary.paidDate as any), 'dd MMM yyyy')}` : ''}
    `.trim();

    const blob = new Blob([slipContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salary-slip-${currentSalary.month}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Salary slip has been downloaded.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md bg-primary/20 border border-primary/50 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground tracking-wide">
                ARKA SERVICES
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Employee Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-md bg-card border border-border">
              <Avatar className="w-10 h-10" data-testid="avatar-employee">
                <AvatarImage src={employee?.profilePicture || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground" data-testid="text-employee-name">
                  {user?.fullName}
                </p>
                <p className="text-xs text-muted-foreground">Employee</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
              className="border-destructive/50 hover:border-destructive text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6 max-w-7xl">
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl" data-testid="tabs-dashboard">
            <TabsTrigger value="tasks" data-testid="tab-tasks">
              <CheckCheck className="w-4 h-4 mr-2" />
              My Tasks
            </TabsTrigger>
            <TabsTrigger value="attendance" data-testid="tab-attendance">
              <Calendar className="w-4 h-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="salary" data-testid="tab-salary">
              <DollarSign className="w-4 h-4 mr-2" />
              Salary
            </TabsTrigger>
            <TabsTrigger value="documents" data-testid="tab-documents">
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
          </TabsList>

          {/* My Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-total-tasks">
                    {taskStats.total}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-500" data-testid="text-done-tasks">
                    {taskStats.done}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-500" data-testid="text-inprogress-tasks">
                    {taskStats.inProgress}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-muted-foreground" data-testid="text-undone-tasks">
                    {taskStats.undone}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>Task List</CardTitle>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger className="w-64" data-testid="select-project-filter">
                      <SelectValue placeholder="Filter by project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {filteredTasks.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8" data-testid="text-no-tasks">
                        No tasks assigned yet.
                      </p>
                    ) : (
                      filteredTasks.map(task => {
                        const project = projects.find(p => p.id === task.projectId);
                        return (
                          <Card key={task.id} className="p-4" data-testid={`card-task-${task.id}`}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(task.status)}
                                  <h4 className="font-semibold text-foreground" data-testid={`text-task-type-${task.id}`}>
                                    {task.taskType}
                                  </h4>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground" data-testid={`text-task-description-${task.id}`}>
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" data-testid={`badge-project-${task.id}`}>
                                    {project?.name || "Unknown Project"}
                                  </Badge>
                                  {task.dueDate && (
                                    <Badge variant="secondary" data-testid={`badge-duedate-${task.id}`}>
                                      Due: {format(parseISO(task.dueDate as any), "dd MMM yyyy")}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Select
                                  value={task.status}
                                  onValueChange={(value) => updateTaskMutation.mutate({ id: task.id, status: value })}
                                  disabled={updateTaskMutation.isPending}
                                >
                                  <SelectTrigger className="w-40" data-testid={`select-status-${task.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Undone">Undone</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Done">Done</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>Mark Attendance</CardTitle>
                  <Button
                    onClick={() => markAttendanceMutation.mutate()}
                    disabled={isAttendanceMarkedToday || markAttendanceMutation.isPending}
                    data-testid="button-mark-attendance"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {isAttendanceMarkedToday ? "Already Marked" : "Mark Today's Attendance"}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>Attendance Calendar</CardTitle>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-48" data-testid="select-month">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const date = new Date();
                        date.setMonth(date.getMonth() - i);
                        const monthValue = format(date, "yyyy-MM");
                        return (
                          <SelectItem key={monthValue} value={monthValue}>
                            {format(date, "MMMM yyyy")}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                  {daysInMonth.map(day => {
                    const attendanceRecord = attendance.find(a => 
                      isSameDay(parseISO(a.attendanceDate as any), day)
                    );
                    const isPresent = attendanceRecord?.isPresent === 1;
                    const isToday = isSameDay(day, today);

                    return (
                      <div
                        key={day.toISOString()}
                        className={`
                          aspect-square flex items-center justify-center rounded-md text-sm
                          ${isToday ? "border-2 border-primary" : "border border-border"}
                          ${isPresent ? "bg-green-500/20 text-green-500 font-semibold" : "bg-card"}
                          ${!attendanceRecord && !isToday ? "text-muted-foreground" : ""}
                        `}
                        data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                      >
                        {format(day, "d")}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500" />
                    <span className="text-sm text-muted-foreground">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-card border border-border" />
                    <span className="text-sm text-muted-foreground">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-primary" />
                    <span className="text-sm text-muted-foreground">Today</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-md bg-card border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Total Days</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-total-days">
                      {daysInMonth.length}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-md bg-green-500/10 border border-green-500/30">
                    <p className="text-sm text-muted-foreground mb-2">Present</p>
                    <p className="text-3xl font-bold text-green-500" data-testid="text-present-days">
                      {attendance.filter(a => a.isPresent === 1).length}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-md bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-muted-foreground mb-2">Absent</p>
                    <p className="text-3xl font-bold text-red-500" data-testid="text-absent-days">
                      {daysInMonth.length - attendance.filter(a => a.isPresent === 1).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Salary Tab */}
          <TabsContent value="salary" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>Current Month Salary</CardTitle>
                  {currentSalary && (
                    <Badge variant={currentSalary.isPaid ? "default" : "secondary"} data-testid="badge-payment-status">
                      {currentSalary.isPaid ? "PAID" : "NOT PAID"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!currentSalary ? (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-salary">
                    No salary data available for the current month.
                  </p>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase">Earnings</h4>
                        <Separator />
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Basic Salary</span>
                          <span className="text-sm font-semibold text-foreground" data-testid="text-basic-salary">
                            PKR {Number(currentSalary.basicSalary).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Incentives</span>
                          <span className="text-sm font-semibold text-foreground" data-testid="text-incentives">
                            PKR {Number(currentSalary.incentives).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Medical</span>
                          <span className="text-sm font-semibold text-foreground" data-testid="text-medical">
                            PKR {Number(currentSalary.medical).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase">Deductions</h4>
                        <Separator />
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Tax</span>
                          <span className="text-sm font-semibold text-destructive" data-testid="text-tax">
                            PKR {Number(currentSalary.tax).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Other Deductions</span>
                          <span className="text-sm font-semibold text-destructive" data-testid="text-deductions">
                            PKR {Number(currentSalary.deductions).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center p-4 rounded-md bg-primary/10 border border-primary/40">
                      <span className="text-lg font-semibold text-foreground">Net Salary</span>
                      <span className="text-2xl font-bold text-primary" data-testid="text-net-salary">
                        PKR {Number(currentSalary.netSalary).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={downloadSalarySlip} data-testid="button-download-slip">
                        <Download className="w-4 h-4 mr-2" />
                        Download Salary Slip
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {salaries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Salary History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {salaries.map(salary => (
                        <div
                          key={salary.id}
                          className="flex items-center justify-between p-3 rounded-md bg-card border border-border hover-elevate"
                          data-testid={`card-salary-${salary.id}`}
                        >
                          <div>
                            <p className="font-semibold text-foreground" data-testid={`text-salary-month-${salary.id}`}>
                              {format(parseISO(`${salary.month}-01`), "MMMM yyyy")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Net: PKR {Number(salary.netSalary).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={salary.isPaid ? "default" : "secondary"}>
                            {salary.isPaid ? "PAID" : "NOT PAID"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20" data-testid="avatar-profile">
                      <AvatarImage src={employee?.profilePicture || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold text-2xl">
                        {user?.fullName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-foreground" data-testid="text-profile-name">
                        {user?.fullName}
                      </h3>
                      <p className="text-sm text-muted-foreground">Employee ID: {user?.username}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee?.idCard && (
                      <div>
                        <p className="text-sm text-muted-foreground">ID Card</p>
                        <p className="text-sm font-semibold text-foreground" data-testid="text-id-card">
                          {employee.idCard}
                        </p>
                      </div>
                    )}
                    {employee?.whatsapp && (
                      <div>
                        <p className="text-sm text-muted-foreground">WhatsApp</p>
                        <p className="text-sm font-semibold text-foreground" data-testid="text-whatsapp">
                          {employee.whatsapp}
                        </p>
                      </div>
                    )}
                    {employee?.homeAddress && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">Home Address</p>
                        <p className="text-sm font-semibold text-foreground" data-testid="text-address">
                          {employee.homeAddress}
                        </p>
                      </div>
                    )}
                    {employee?.joiningDate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Joining Date</p>
                        <p className="text-sm font-semibold text-foreground" data-testid="text-joining-date">
                          {format(parseISO(employee.joiningDate as any), "dd MMM yyyy")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-md bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">Appointment Letter</p>
                        <p className="text-xs text-muted-foreground">Official appointment document</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled data-testid="button-download-appointment">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-md bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">Joining Letter</p>
                        <p className="text-xs text-muted-foreground">Joining confirmation document</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled data-testid="button-download-joining">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-md bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">Resignation Letter</p>
                        <p className="text-xs text-muted-foreground">Resignation document (if applicable)</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled data-testid="button-download-resignation">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground text-center pt-4">
                    Contact HR to access your documents
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
