import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, getDay } from "date-fns";
import { useAuth, logout } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Task, Attendance, Salary, Project, Employee, EmployeeDocument, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { TaskProgressGraph } from "@/components/TaskProgressGraph";
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
  User as UserIcon,
  BarChart3,
  CheckCheck,
  AlertCircle,
} from "lucide-react";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [updateTaskOpen, setUpdateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  // Fetch employee documents
  const { data: documents = [] } = useQuery<EmployeeDocument[]>({
    queryKey: ["/api/documents", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/documents?employeeId=${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status, remarks }: { id: string; status: string; remarks?: string }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, { status, remarks });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", user?.id] });
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      });
      setUpdateTaskOpen(false);
      setSelectedTask(null);
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
        isPresent: true,
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
    isSameDay(parseISO(a.attendanceDate as any), today) && a.isPresent === true
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

  const downloadSalarySlip = async () => {
    if (!currentSalary) {
      toast({
        title: "No salary data",
        description: "No salary data available for the current month.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Calculate attendance summary for the salary month
      const monthStart = startOfMonth(parseISO(`${currentSalary.month}-01`));
      const monthEnd = endOfMonth(parseISO(`${currentSalary.month}-01`));
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

      // Count Sundays (holidays)
      const sundays = daysInMonth.filter(day => getDay(day) === 0).length;
      const totalWorkingDays = currentSalary.totalWorkingDays || (daysInMonth.length - sundays);
      const presentDays = currentSalary.attendanceDays || 0;
      const absentDays = totalWorkingDays - presentDays;

      // Calculate per-day salary
      const totalEarnings = currentSalary.totalEarnings || (
        Number(currentSalary.basicSalary || 0) +
        Number(currentSalary.travelingAllowance || 0) +
        Number(currentSalary.medicalAllowance || 0) +
        Number(currentSalary.foodAllowance || 0)
      );
      const perDaySalary = totalWorkingDays > 0 ? totalEarnings / totalWorkingDays : 0;

      // Set colors
      const primaryColor = [0, 188, 212]; // Cyan
      const accentColor = [99, 102, 241]; // Indigo
      const lightGray = [249, 250, 251];

      // Header - ARKA Services branding
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 45, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text("ARKA SERVICES", 105, 22, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("www.arka.pk | Architecture & Interior Design", 105, 31, { align: "center" });
      doc.text("Professional Salary Statement", 105, 38, { align: "center" });

      // Salary Slip Title
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("SALARY SLIP", 105, 58, { align: "center" });

      // Employee Details Section
      let yPos = 72;
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(15, yPos - 5, 180, 28, 'F');

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Employee Information", 20, yPos);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      yPos += 7;
      doc.text(`Name: ${user?.fullName || 'N/A'}`, 20, yPos);
      doc.text(`Employee ID: ${user?.username || 'N/A'}`, 120, yPos);

      yPos += 6;
      if (employee?.designation) {
        doc.text(`Designation: ${employee.designation}`, 20, yPos);
      }
      doc.text(`Period: ${format(parseISO(`${currentSalary.month}-01`), "MMMM yyyy")}`, 120, yPos);

      yPos += 6;
      doc.text(`Salary Date: ${currentSalary.salaryDate || 1}th of each month`, 20, yPos);

      // Main Salary Details - Two Column Layout
      yPos += 15;

      // LEFT COLUMN - EARNINGS
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("EARNINGS", 20, yPos);

      // Draw separator line
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(20, yPos + 2, 95, yPos + 2);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      yPos += 10;

      const leftColX = 25;
      const rightColX = 110;

      doc.text("Basic Salary", leftColX, yPos);
      doc.text(`PKR ${Number(currentSalary.basicSalary || 0).toLocaleString()}`, 90, yPos, { align: "right" });

      yPos += 7;
      doc.text("Traveling Allowance", leftColX, yPos);
      doc.text(`PKR ${Number(currentSalary.travelingAllowance || 0).toLocaleString()}`, 90, yPos, { align: "right" });

      yPos += 7;
      doc.text("Medical Allowance", leftColX, yPos);
      doc.text(`PKR ${Number(currentSalary.medicalAllowance || 0).toLocaleString()}`, 90, yPos, { align: "right" });

      yPos += 7;
      doc.text("Food Allowance", leftColX, yPos);
      doc.text(`PKR ${Number(currentSalary.foodAllowance || 0).toLocaleString()}`, 90, yPos, { align: "right" });

      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(leftColX - 5, yPos - 5, 75, 8, 'F');
      doc.text("GROSS EARNINGS", leftColX, yPos);
      doc.text(`PKR ${totalEarnings.toLocaleString()}`, 90, yPos, { align: "right" });

      // RIGHT COLUMN - DEDUCTIONS (start from same top position)
      let deductionYPos = yPos - 40; // Reset to earnings start position

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("DEDUCTIONS", rightColX, deductionYPos);

      // Draw separator line
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.line(rightColX, deductionYPos + 2, 185, deductionYPos + 2);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      deductionYPos += 10;

      doc.text("Advance Payments", rightColX + 5, deductionYPos);
      doc.text(`PKR ${Number(currentSalary.advancePaid || 0).toLocaleString()}`, 185, deductionYPos, { align: "right" });

      deductionYPos += 7;
      doc.text("Absent Deductions", rightColX + 5, deductionYPos);
      doc.text(`PKR ${Number(currentSalary.absentDeductions || 0).toLocaleString()}`, 185, deductionYPos, { align: "right" });

      deductionYPos += 7;
      doc.text("Other Deductions", rightColX + 5, deductionYPos);
      doc.text(`PKR ${Number(currentSalary.otherDeductions || 0).toLocaleString()}`, 185, deductionYPos, { align: "right" });

      deductionYPos += 10;
      doc.setFont("helvetica", "bold");
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(rightColX, deductionYPos - 5, 80, 8, 'F');
      doc.text("TOTAL DEDUCTIONS", rightColX + 5, deductionYPos);
      const totalDeductions = currentSalary.totalDeductions ||
        (Number(currentSalary.advancePaid || 0) +
         Number(currentSalary.absentDeductions || 0) +
         Number(currentSalary.otherDeductions || 0));
      doc.text(`PKR ${totalDeductions.toLocaleString()}`, 185, deductionYPos, { align: "right" });

      // Attendance Summary Section
      yPos += 20;
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.rect(15, yPos - 5, 180, 28, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("ATTENDANCE SUMMARY", 20, yPos);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      yPos += 7;
      doc.text(`Total Days in Month: ${daysInMonth.length}`, 20, yPos);
      doc.text(`Working Days: ${totalWorkingDays}`, 90, yPos);
      doc.text(`Sundays (Holidays): ${sundays}`, 140, yPos);

      yPos += 6;
      doc.text(`Present Days: ${presentDays}`, 20, yPos);
      doc.text(`Absent Days: ${absentDays}`, 90, yPos);
      doc.text(`Per Day Salary: PKR ${perDaySalary.toFixed(2)}`, 140, yPos);

      yPos += 6;
      if (absentDays > 0) {
        doc.setTextColor(220, 38, 38); // Red for deductions
        doc.text(`Deduction for ${absentDays} absent day(s): PKR ${(absentDays * perDaySalary).toLocaleString()}`, 20, yPos);
        doc.setTextColor(0, 0, 0);
      }

      // NET SALARY - Highlighted Box
      yPos += 18;
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.roundedRect(15, yPos - 10, 180, 18, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("NET SALARY", 25, yPos);
      const netSalary = currentSalary.netSalary || (totalEarnings - totalDeductions);
      doc.text(`PKR ${Number(netSalary).toLocaleString()}`, 185, yPos, { align: "right" });

      // Payment Details Section
      yPos += 18;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT DETAILS", 20, yPos);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      yPos += 7;

      doc.text(`Amount Paid: PKR ${Number(currentSalary.paidAmount || 0).toLocaleString()}`, 20, yPos);
      const remainingAmount = currentSalary.remainingAmount || (netSalary - Number(currentSalary.paidAmount || 0));
      doc.text(`Remaining Amount: PKR ${remainingAmount.toLocaleString()}`, 120, yPos);

      yPos += 6;
      doc.text(`Payment Status: ${currentSalary.isPaid ? 'PAID' : 'PENDING'}`, 20, yPos);
      if (currentSalary.isPaid && currentSalary.paidDate) {
        doc.text(`Payment Date: ${format(parseISO(currentSalary.paidDate as any), 'dd MMM yyyy')}`, 120, yPos);
      }

      if (currentSalary.isHeld) {
        yPos += 6;
        doc.setTextColor(220, 38, 38);
        doc.setFont("helvetica", "bold");
        doc.text("⚠ SALARY ON HOLD - Pending Tasks", 20, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
      }

      // Footer Section
      yPos = 270;
      doc.setDrawColor(200, 200, 200);
      doc.line(15, yPos, 195, yPos);

      yPos += 5;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "italic");
      doc.text("This is a computer-generated salary slip and does not require a signature.", 105, yPos, { align: "center" });

      yPos += 4;
      doc.text("For any queries regarding your salary, please contact HR at ARKA Services", 105, yPos, { align: "center" });

      yPos += 4;
      doc.setFont("helvetica", "bold");
      doc.text("www.arka.pk | contact@arka.pk", 105, yPos, { align: "center" });

      // Save PDF
      const fileName = `ARKA-Salary-Slip-${(user?.fullName || 'Employee')?.replace(/\s+/g, '-')}-${currentSalary.month}.pdf`;
      doc.save(fileName);

      toast({
        title: "Downloaded Successfully",
        description: "Professional salary slip PDF has been downloaded.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
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
                  {user?.fullName || 'Employee'}
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

            {/* Task Progress Graph */}
            <TaskProgressGraph />

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
                                {task.remarks && (
                                  <p className="text-sm text-blue-500 italic" data-testid={`text-task-remarks-${task.id}`}>
                                    Remarks: {task.remarks}
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
                                <Badge 
                                  variant={task.status === "Done" ? "default" : task.status === "In Progress" ? "secondary" : "outline"}
                                  data-testid={`badge-status-${task.id}`}
                                >
                                  {task.status}
                                </Badge>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setUpdateTaskOpen(true);
                                  }}
                                  data-testid={`button-update-task-${task.id}`}
                                >
                                  Update
                                </Button>
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
                    const isPresent = attendanceRecord?.isPresent === true;
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
                      {attendance.filter(a => a.isPresent === true).length}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-md bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-muted-foreground mb-2">Absent</p>
                    <p className="text-3xl font-bold text-red-500" data-testid="text-absent-days">
                      {daysInMonth.length - attendance.filter(a => a.isPresent === true).length}
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
                            PKR {Number(currentSalary.basicSalary || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Traveling Allowance</span>
                          <span className="text-sm font-semibold text-foreground" data-testid="text-traveling">
                            PKR {Number(currentSalary.travelingAllowance || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Medical Allowance</span>
                          <span className="text-sm font-semibold text-foreground" data-testid="text-medical">
                            PKR {Number(currentSalary.medicalAllowance || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Food Allowance</span>
                          <span className="text-sm font-semibold text-foreground" data-testid="text-food">
                            PKR {Number(currentSalary.foodAllowance || 0).toLocaleString()}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm font-bold text-foreground">Total Earnings</span>
                          <span className="text-sm font-bold text-green-600" data-testid="text-total-earnings">
                            PKR {Number(currentSalary.totalEarnings ||
                              (Number(currentSalary.basicSalary || 0) +
                               Number(currentSalary.travelingAllowance || 0) +
                               Number(currentSalary.medicalAllowance || 0) +
                               Number(currentSalary.foodAllowance || 0))
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase">Deductions</h4>
                        <Separator />
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Advance Paid</span>
                          <span className="text-sm font-semibold text-destructive" data-testid="text-advance">
                            PKR {Number(currentSalary.advancePaid || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Absent Deductions</span>
                          <span className="text-sm font-semibold text-destructive" data-testid="text-absent">
                            PKR {Number(currentSalary.absentDeductions || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-muted-foreground">Other Deductions</span>
                          <span className="text-sm font-semibold text-destructive" data-testid="text-deductions">
                            PKR {Number(currentSalary.otherDeductions || 0).toLocaleString()}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm font-bold text-foreground">Total Deductions</span>
                          <span className="text-sm font-bold text-red-600" data-testid="text-total-deductions">
                            PKR {Number(currentSalary.totalDeductions ||
                              (Number(currentSalary.advancePaid || 0) +
                               Number(currentSalary.absentDeductions || 0) +
                               Number(currentSalary.otherDeductions || 0))
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Attendance Summary */}
                    {currentSalary.attendanceDays !== undefined && currentSalary.totalWorkingDays !== undefined && (
                      <div className="bg-muted/50 p-4 rounded-md">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Attendance Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Working Days</p>
                            <p className="text-lg font-bold text-foreground">{currentSalary.totalWorkingDays}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Present</p>
                            <p className="text-lg font-bold text-green-600">{currentSalary.attendanceDays}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Absent</p>
                            <p className="text-lg font-bold text-red-600">
                              {currentSalary.totalWorkingDays - currentSalary.attendanceDays}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Per Day Salary</p>
                            <p className="text-lg font-bold text-foreground">
                              PKR {currentSalary.totalWorkingDays > 0
                                ? ((currentSalary.totalEarnings || 0) / currentSalary.totalWorkingDays).toFixed(0)
                                : 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between items-center p-4 rounded-md bg-primary/10 border border-primary/40">
                      <span className="text-lg font-semibold text-foreground">Net Salary</span>
                      <span className="text-2xl font-bold text-primary" data-testid="text-net-salary">
                        PKR {Number(currentSalary.netSalary || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Payment Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-md bg-green-500/10 border border-green-500/30">
                        <p className="text-xs text-muted-foreground mb-1">Amount Paid</p>
                        <p className="text-lg font-bold text-green-600" data-testid="text-paid-amount">
                          PKR {Number(currentSalary.paidAmount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-md bg-orange-500/10 border border-orange-500/30">
                        <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                        <p className="text-lg font-bold text-orange-600" data-testid="text-remaining-amount">
                          PKR {Number(currentSalary.remainingAmount ||
                            (Number(currentSalary.netSalary || 0) - Number(currentSalary.paidAmount || 0))
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-md bg-blue-500/10 border border-blue-500/30">
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <Badge variant={currentSalary.isPaid ? "default" : "secondary"} className="text-sm">
                          {currentSalary.isHeld ? "ON HOLD" : currentSalary.isPaid ? "PAID" : "PENDING"}
                        </Badge>
                      </div>
                    </div>

                    {currentSalary.isHeld && (
                      <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                          <p className="font-semibold text-destructive">Salary On Hold</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Your salary has been held. Please complete all pending tasks or contact your supervisor.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <Button onClick={downloadSalarySlip} size="lg" data-testid="button-download-slip">
                        <Download className="w-4 h-4 mr-2" />
                        Download Professional Salary Slip
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
                        {user?.fullName || 'Employee'}
                      </h3>
                      <p className="text-sm text-muted-foreground">Employee ID: {user?.username || 'N/A'}</p>
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
                {documents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-documents">
                    No documents available yet. Contact HR to generate your documents.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {documents.map(doc => {
                      const downloadDocument = () => {
                        if (doc.generatedDocument) {
                          const blob = new Blob([doc.generatedDocument], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${doc.documentType.replace(/ /g, "-")}-${user?.fullName || 'Employee'}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);

                          toast({
                            title: "Downloaded",
                            description: `${doc.documentType} has been downloaded.`,
                          });
                        }
                      };

                      return (
                        <div key={doc.id} className="flex items-center justify-between p-4 rounded-md bg-card border border-border" data-testid={`card-document-${doc.id}`}>
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-semibold text-foreground" data-testid={`text-document-type-${doc.id}`}>
                                {doc.documentType}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Generated on {format(parseISO(doc.createdAt as any), "dd MMM yyyy")}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={downloadDocument}
                            disabled={!doc.generatedDocument}
                            data-testid={`button-download-${doc.documentType.replace(/ /g, "-").toLowerCase()}`}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Update Task Dialog */}
      <UpdateTaskDialog 
        open={updateTaskOpen}
        onOpenChange={setUpdateTaskOpen}
        task={selectedTask}
        onUpdate={(status, remarks) => {
          if (selectedTask) {
            updateTaskMutation.mutate({ id: selectedTask.id, status, remarks });
          }
        }}
        isUpdating={updateTaskMutation.isPending}
      />
    </div>
  );
}

// Update Task Dialog Component
function UpdateTaskDialog({
  open,
  onOpenChange,
  task,
  onUpdate,
  isUpdating
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onUpdate: (status: string, remarks?: string) => void;
  isUpdating: boolean;
}) {
  const [status, setStatus] = useState<string>(task?.status || "Undone");
  const [remarks, setRemarks] = useState<string>(task?.remarks || "");

  // Update local state when task changes
  useEffect(() => {
    if (task) {
      setStatus(task.status);
      setRemarks(task.remarks || "");
    }
  }, [task]);

  const handleUpdate = () => {
    onUpdate(status, remarks);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Task</DialogTitle>
          <DialogDescription>
            Update the status and add remarks for {task.taskType}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Status *</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="select-update-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Undone">Undone</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Remarks / Comments</label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add remarks or comments about the task progress..."
              className="resize-none h-32"
              data-testid="input-task-remarks"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
              data-testid="button-cancel-update"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              data-testid="button-confirm-update"
            >
              {isUpdating ? "Updating..." : "Update Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
