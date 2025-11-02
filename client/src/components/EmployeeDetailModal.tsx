import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Edit,
  Save,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { Employee, User as UserType, Project, Task, Attendance, Salary, SalaryAdvance } from "@shared/schema";
import { apiFetch } from "@/lib/api";

interface EmployeeDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string | null;
}

export function EmployeeDetailModal({ open, onOpenChange, employeeId }: EmployeeDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Fetch employee data
  const { data: employee, isLoading: employeeLoading } = useQuery<Employee>({
    queryKey: ["/api/employees", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("No employee ID");
      const res = await apiFetch(`/api/employees/${employeeId}`);
      if (!res.ok) throw new Error("Failed to fetch employee");
      return res.json();
    },
    enabled: !!employeeId && open,
  });

  // Fetch user data for the employee
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/users", employee?.userId],
    queryFn: async () => {
      if (!employee?.userId) throw new Error("No user ID");
      const res = await apiFetch(`/api/users/${employee.userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    enabled: !!employee?.userId && open,
  });

  // Fetch assigned projects
  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/assignments", employeeId],
    queryFn: async () => {
      const res = await apiFetch(`/api/assignments?userId=${employee?.userId}`);
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return res.json();
    },
    enabled: !!employee?.userId && open,
  });

  // Fetch projects for assignments
  const { data: allProjects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await apiFetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    enabled: open,
  });

  // Filter assigned projects
  const assignedProjects = allProjects.filter(p =>
    assignments.some((a: any) => a.projectId === p.id)
  );

  // Fetch tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks", employeeId],
    queryFn: async () => {
      const res = await apiFetch(`/api/tasks?employeeId=${employeeId}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      return data.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
    },
    enabled: !!employeeId && open,
  });

  // Fetch attendance
  const { data: attendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance", employeeId],
    queryFn: async () => {
      const res = await apiFetch(`/api/attendance?employeeId=${employeeId}`);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      const data = await res.json();
      return data.map((att: any) => ({
        ...att,
        attendanceDate: new Date(att.attendanceDate),
        createdAt: new Date(att.createdAt),
      }));
    },
    enabled: !!employeeId && open,
  });

  // Fetch salaries
  const { data: salaries = [] } = useQuery<Salary[]>({
    queryKey: ["/api/salaries", employeeId],
    queryFn: async () => {
      const res = await apiFetch(`/api/salaries?employeeId=${employeeId}`);
      if (!res.ok) throw new Error("Failed to fetch salaries");
      const data = await res.json();
      return data.map((sal: any) => ({
        ...sal,
        paidDate: sal.paidDate ? new Date(sal.paidDate) : undefined,
        createdAt: new Date(sal.createdAt),
        updatedAt: new Date(sal.updatedAt),
      }));
    },
    enabled: !!employeeId && open,
  });

  // Fetch salary advances
  const { data: advances = [] } = useQuery<SalaryAdvance[]>({
    queryKey: ["/api/salary-advances", employeeId],
    queryFn: async () => {
      const res = await apiFetch(`/api/salary-advances?employeeId=${employeeId}`);
      if (!res.ok) throw new Error("Failed to fetch advances");
      const data = await res.json();
      return data.map((adv: any) => ({
        ...adv,
        date: new Date(adv.date),
        createdAt: new Date(adv.createdAt),
      }));
    },
    enabled: !!employeeId && open,
  });

  if (!employeeId || !open) return null;

  if (employeeLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading employee details...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!employee || !user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Employee not found</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Calculate attendance stats
  const totalAttendance = attendance.length;
  const presentDays = attendance.filter(a => a.isPresent).length;
  const absentDays = totalAttendance - presentDays;
  const attendanceRate = totalAttendance > 0 ? (presentDays / totalAttendance * 100).toFixed(1) : "0";

  // Calculate task stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Done").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const undoneTasks = tasks.filter(t => t.status === "Undone").length;

  // Calculate salary stats
  const totalSalaries = salaries.length;
  const paidSalaries = salaries.filter(s => s.isPaid).length;
  const pendingSalaries = totalSalaries - paidSalaries;
  const totalAdvances = advances.reduce((sum, adv) => sum + adv.amount, 0);
  const totalPending = salaries.reduce((sum, sal) => sum + sal.remainingAmount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={employee.profilePicture} alt={user.fullName} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{user.fullName}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={user.isActive ? "default" : "destructive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {employee.designation && (
                    <Badge variant="outline">{employee.designation}</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-6 flex-shrink-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="salary">Salary</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 m-0">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attendanceRate}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {presentDays} present / {totalAttendance} total days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {completedTasks} completed / {totalTasks} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Pending Salary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">PKR {totalPending.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pendingSalaries} pending payments
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Username</p>
                        <p className="text-sm text-muted-foreground">{user.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{employee.email || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">WhatsApp</p>
                        <p className="text-sm text-muted-foreground">{employee.whatsapp || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Joining Date</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.joiningDate ? format(new Date(employee.joiningDate), "PPP") : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">ID Card</p>
                        <p className="text-sm text-muted-foreground">{employee.idCard || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">{employee.homeAddress || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Salary Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Basic Salary</p>
                      <p className="text-2xl font-bold">PKR {employee.basicSalary?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Advances Given</p>
                      <p className="text-2xl font-bold">PKR {totalAdvances.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Traveling Allowance</p>
                      <p className="text-lg">PKR {employee.travelingAllowance?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Medical Allowance</p>
                      <p className="text-lg">PKR {employee.medicalAllowance?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Projects ({assignedProjects.length})</CardTitle>
                  <CardDescription>All projects assigned to this employee</CardDescription>
                </CardHeader>
                <CardContent>
                  {assignedProjects.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No projects assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {assignedProjects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{project.name}</h4>
                              {project.clientName && (
                                <p className="text-sm text-muted-foreground">Client: {project.clientName}</p>
                              )}
                              {project.projectTitle && (
                                <p className="text-sm text-muted-foreground mt-1">{project.projectTitle}</p>
                              )}
                            </div>
                            <Badge variant="outline">Active</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="m-0">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completedTasks}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      In Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inProgressTasks}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      Undone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{undoneTasks}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Tasks ({totalTasks})</CardTitle>
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No tasks assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={
                                  task.status === "Done" ? "default" :
                                  task.status === "In Progress" ? "secondary" :
                                  "destructive"
                                }>
                                  {task.status}
                                </Badge>
                                <Badge variant="outline">{task.taskType}</Badge>
                              </div>
                              {task.description && (
                                <p className="text-sm mt-2">{task.description}</p>
                              )}
                              {task.dueDate && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Due: {format(task.dueDate, "PPP")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="m-0">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{presentDays}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{absentDays}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attendanceRate}%</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  {attendance.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No attendance records</p>
                  ) : (
                    <div className="space-y-2">
                      {attendance.slice(0, 20).map((att) => (
                        <div key={att.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-3">
                            {att.isPresent ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <div>
                              <p className="font-medium">{format(att.attendanceDate, "PPP")}</p>
                              {att.notes && (
                                <p className="text-xs text-muted-foreground">{att.notes}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant={att.isPresent ? "default" : "destructive"}>
                            {att.isPresent ? "Present" : "Absent"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Salary Tab */}
            <TabsContent value="salary" className="m-0">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      PKR {totalPending.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pendingSalaries} unpaid salaries
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Advances</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">PKR {totalAdvances.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {advances.length} advances given
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Salary History ({totalSalaries})</CardTitle>
                </CardHeader>
                <CardContent>
                  {salaries.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No salary records</p>
                  ) : (
                    <div className="space-y-3">
                      {salaries.slice(0, 12).map((salary) => (
                        <div key={salary.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{salary.month}</h4>
                                <Badge variant={salary.isPaid ? "default" : "destructive"}>
                                  {salary.isPaid ? "Paid" : "Pending"}
                                </Badge>
                                {salary.isHeld && <Badge variant="secondary">Held</Badge>}
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                                <p>Net Salary: <span className="font-medium">PKR {salary.netSalary.toLocaleString()}</span></p>
                                <p>Paid: <span className="font-medium">PKR {salary.paidAmount.toLocaleString()}</span></p>
                                <p>Deductions: <span className="font-medium">PKR {salary.totalDeductions.toLocaleString()}</span></p>
                                <p>Remaining: <span className="font-medium text-red-600">PKR {salary.remainingAmount.toLocaleString()}</span></p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Salary Advances ({advances.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {advances.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No advances given</p>
                  ) : (
                    <div className="space-y-2">
                      {advances.map((advance) => (
                        <div key={advance.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{format(advance.date, "PPP")}</p>
                            {advance.reason && (
                              <p className="text-xs text-muted-foreground">{advance.reason}</p>
                            )}
                          </div>
                          <p className="font-semibold">PKR {advance.amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Employee Details</CardTitle>
                  <CardDescription>
                    {isEditing ? "Edit mode enabled - modify fields below" : "View-only mode - click Edit to make changes"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <Input value={user.fullName} disabled={!isEditing} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Username</label>
                      <Input value={user.username} disabled={!isEditing} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input value={employee.email || ""} disabled={!isEditing} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">WhatsApp</label>
                      <Input value={employee.whatsapp || ""} disabled={!isEditing} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">ID Card</label>
                      <Input value={employee.idCard || ""} disabled={!isEditing} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Designation</label>
                      <Input value={employee.designation || ""} disabled={!isEditing} className="mt-1" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium">Home Address</label>
                      <Input value={employee.homeAddress || ""} disabled={!isEditing} className="mt-1" />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Basic Salary</label>
                      <Input
                        type="number"
                        value={employee.basicSalary || 0}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Traveling Allowance</label>
                      <Input
                        type="number"
                        value={employee.travelingAllowance || 0}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Medical Allowance</label>
                      <Input
                        type="number"
                        value={employee.medicalAllowance || 0}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Food Allowance</label>
                      <Input
                        type="number"
                        value={employee.foodAllowance || 0}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
