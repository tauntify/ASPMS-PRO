import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth, logout } from "@/lib/auth";
import { Project, User, Task } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Users,
  CheckCircle2,
  DollarSign,
  Plus,
  Search,
  Bell,
  Settings,
  LogOut,
  Clock,
  TrendingUp,
  Activity,
  Calendar,
  FileText,
  ChevronRight,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ActiveView = "dashboard" | "projects" | "clients" | "employees" | "procurement" | "billing" | "meetings" | "tasks" | "reports" | "admin";

export default function PrincipleDashboardV2() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserRole, setNewUserRole] = useState<"client" | "employee" | "procurement" | "accountant" | "hr">("employee");
  const [newUserData, setNewUserData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
  });

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

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: typeof newUserData & { role: string }) => {
      const response = await apiRequest("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          organizationId: user?.organizationId,
        }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowCreateUser(false);
      setNewUserData({ username: "", password: "", email: "", fullName: "" });
      toast({
        title: "Success",
        description: `${newUserRole} account created successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user account",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = () => {
    if (!newUserData.username || !newUserData.password || !newUserData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate({ ...newUserData, role: newUserRole });
  };

  // Filter projects by search
  const filteredProjects = projects.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const activeProjects = projects.filter(p => p.projectStatus !== "completed" && p.projectStatus !== "archived").length;
  const pendingApprovals = 7; // TODO: Get from approvals API
  const tasksDueToday = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length;
  const monthlyRevenue = 12300000; // TODO: Calculate from financials

  // Recent activities (mock data for now)
  const recentActivities = [
    { id: 1, user: "Ayesha Khan", action: "commented on", target: "DHA Villa Project", time: "2 hours ago", type: "comment" },
    { id: 2, user: "Client: Ahmed", action: "approved", target: "BOQ Item #B-33", time: "4 hours ago", type: "approval" },
    { id: 3, user: "Procurement Team", action: "marked orders received for", target: "Mall Retail Fitout", time: "5 hours ago", type: "procurement" },
    { id: 4, user: "Sara Ali", action: "submitted", target: "MEP Drawings - Level 2", time: "1 day ago", type: "submission" },
  ];

  // Upcoming meetings (mock data)
  const upcomingMeetings = [
    { id: 1, title: "Site Walk — DHA Villa", date: "Apr 14", location: "On-site", attendees: 5 },
    { id: 2, title: "Approval Call — MEP", date: "Apr 16", location: "ARKA Office", attendees: 3 },
    { id: 3, title: "Client Review", date: "Apr 18", location: "Virtual", attendees: 8 },
  ];

  // Notifications (mock data)
  const notifications = [
    { id: 1, title: "New approval request", message: "Client awaiting approval for MEP drawings", time: "1 hour ago", read: false },
    { id: 2, title: "Task overdue", message: "5 tasks are past their due date", time: "3 hours ago", read: false },
    { id: 3, title: "Payment received", message: "PKR 2.5M received from DHA Villa", time: "1 day ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header is now managed by HeaderSleek component in App.tsx */}

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4">
          <nav className="space-y-1">
            {[
              { id: "dashboard", icon: Activity, label: "Dashboard" },
              { id: "projects", icon: Briefcase, label: "Projects" },
              { id: "clients", icon: Users, label: "Clients" },
              { id: "employees", icon: Users, label: "Employees" },
              { id: "procurement", icon: FileText, label: "Procurement" },
              { id: "billing", icon: DollarSign, label: "Billing" },
              { id: "meetings", icon: Calendar, label: "Meetings" },
              { id: "tasks", icon: CheckCircle2, label: "Tasks" },
              { id: "reports", icon: TrendingUp, label: "Reports" },
              { id: "admin", icon: Settings, label: "Admin" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ActiveView)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  activeView === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeView === "dashboard" && (
            <>
              {/* Page Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Studio Control — Overview</h1>
                <p className="text-sm text-gray-500 mt-1">All projects & live pipelines</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="p-5 bg-gradient-to-br from-white to-blue-50/30 border-blue-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Active Projects</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{activeProjects}</p>
                      <p className="text-xs text-gray-500 mt-1">3 new this week</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-white to-amber-50/30 border-amber-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Pending Approvals</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{pendingApprovals}</p>
                      <p className="text-xs text-gray-500 mt-1">Awaiting client responses</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-white to-green-50/30 border-green-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Tasks Due Today</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{tasksDueToday}</p>
                      <p className="text-xs text-gray-500 mt-1">Critical: 5</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-white to-purple-50/30 border-purple-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Monthly Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">PKR {(monthlyRevenue / 1000000).toFixed(1)}M</p>
                      <p className="text-xs text-gray-500 mt-1">Invoice due: PKR 2.1M</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Projects Section */}
                <div className="col-span-2 space-y-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Projects</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {filteredProjects.slice(0, 6).map((project) => (
                        <Card
                          key={project.id}
                          className="p-4 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50/50 border-gray-200"
                          onClick={() => setSelectedProject(project)}
                        >
                          <div className="h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mb-3">
                            <span className="text-sm font-semibold text-blue-700">{project.projectType || 'Project'}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-sm">{project.name}</h4>
                                <p className="text-xs text-gray-500">{project.clientName} • {project.area} {project.areaUnit}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {project.projectStatus || 'Active'}
                              </Badge>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full"
                                style={{ width: `${Math.random() * 100}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Tasks: 32</span>
                              <Button size="sm" variant="ghost" className="h-7 text-xs">
                                Open <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Upcoming Meetings */}
                  <Card className="p-5">
                    <h4 className="font-bold text-sm mb-4">Upcoming Meetings</h4>
                    <div className="space-y-3">
                      {upcomingMeetings.map((meeting) => (
                        <div key={meeting.id} className="flex gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{meeting.title}</p>
                            <p className="text-xs text-gray-500">{meeting.date} • {meeting.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="p-5">
                    <h4 className="font-bold text-sm mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-100 text-gray-700 text-xs">
                              {activity.user.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-semibold">{activity.user}</span>{' '}
                              <span className="text-gray-600">{activity.action}</span>{' '}
                              <span className="font-medium">{activity.target}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="p-5">
                    <h4 className="font-bold text-sm mb-4">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-blue-700">
                        <Plus className="w-4 h-4" />
                        Create Project
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => {
                          setNewUserRole("client");
                          setShowCreateUser(true);
                        }}
                      >
                        <Users className="w-4 h-4" />
                        Add Client
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => {
                          setNewUserRole("employee");
                          setShowCreateUser(true);
                        }}
                      >
                        <Users className="w-4 h-4" />
                        Add Employee
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}

          {activeView === "billing" && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Billing & Invoicing</h1>
                <p className="text-sm text-gray-500 mt-1">Comprehensive financial tracking and invoice management</p>
              </div>

              {/* Billing Summary Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="p-5 bg-gradient-to-br from-white to-green-50/30 border-green-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Revenue (YTD)</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">PKR 45.2M</p>
                      <p className="text-xs text-green-600 mt-1">+23.4% from last year</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-white to-blue-50/30 border-blue-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Invoiced</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">PKR 8.9M</p>
                      <p className="text-xs text-gray-500 mt-1">42 invoices this month</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-white to-purple-50/30 border-purple-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Collected</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">PKR 6.2M</p>
                      <p className="text-xs text-gray-500 mt-1">70% collection rate</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-white to-amber-50/30 border-amber-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Outstanding</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">PKR 2.7M</p>
                      <p className="text-xs text-amber-600 mt-1">7 invoices overdue</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Recent Invoices */}
                <div className="col-span-2">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Recent Invoices</h3>
                      <Button size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Invoice
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { id: "INV-2025-042", project: "DHA Villa Renovation", client: "Ahmed Malik", amount: 850000, status: "Paid", date: "Apr 10, 2025" },
                        { id: "INV-2025-041", project: "Mall Retail Fitout", client: "Retail Corp", amount: 1200000, status: "Sent", date: "Apr 8, 2025" },
                        { id: "INV-2025-040", project: "Office Interior - Phase 2", client: "TechHub Ltd", amount: 450000, status: "Overdue", date: "Mar 28, 2025" },
                        { id: "INV-2025-039", project: "Residence New Build", client: "Sara Khan", amount: 2100000, status: "Paid", date: "Apr 5, 2025" },
                        { id: "INV-2025-038", project: "Hospital MEP Design", client: "HealthCare Pvt", amount: 750000, status: "Draft", date: "Apr 12, 2025" },
                      ].map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer bg-white">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{invoice.id}</p>
                                <p className="text-xs text-gray-500">{invoice.project}</p>
                                <p className="text-xs text-gray-400">{invoice.client} • {invoice.date}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">PKR {(invoice.amount / 1000).toFixed(0)}K</p>
                            <Badge
                              variant={invoice.status === "Paid" ? "outline" : invoice.status === "Overdue" ? "destructive" : "secondary"}
                              className={invoice.status === "Paid" ? "bg-green-50 text-green-700 border-green-200" : ""}
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Revenue by Project Type */}
                  <Card className="p-5">
                    <h4 className="font-bold text-sm mb-4">Revenue by Project Type</h4>
                    <div className="space-y-3">
                      {[
                        { type: "Design & Consultancy", amount: 18500000, percentage: 41, color: "bg-blue-600" },
                        { type: "Renovation", amount: 12300000, percentage: 27, color: "bg-purple-600" },
                        { type: "New Build", amount: 9800000, percentage: 22, color: "bg-green-600" },
                        { type: "Supervision", amount: 4600000, percentage: 10, color: "bg-amber-600" },
                      ].map((item) => (
                        <div key={item.type}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">{item.type}</span>
                            <span className="text-xs font-bold text-gray-900">PKR {(item.amount / 1000000).toFixed(1)}M</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Payment Milestones */}
                  <Card className="p-5">
                    <h4 className="font-bold text-sm mb-4">Upcoming Payment Milestones</h4>
                    <div className="space-y-3">
                      {[
                        { project: "DHA Villa", milestone: "MEP Approval", amount: 450000, due: "Apr 18" },
                        { project: "Mall Fitout", milestone: "Construction - 50%", amount: 1200000, due: "Apr 22" },
                        { project: "Office Interior", milestone: "Final Handover", amount: 320000, due: "Apr 28" },
                      ].map((milestone, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{milestone.project}</p>
                            <p className="text-xs text-gray-500">{milestone.milestone}</p>
                            <p className="text-xs text-gray-900 font-bold mt-1">PKR {(milestone.amount / 1000).toFixed(0)}K • {milestone.due}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="p-5">
                    <h4 className="font-bold text-sm mb-4">Billing Actions</h4>
                    <div className="space-y-2">
                      <Button className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-blue-700">
                        <Plus className="w-4 h-4" />
                        Create Invoice
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <FileText className="w-4 h-4" />
                        View All Invoices
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <DollarSign className="w-4 h-4" />
                        Record Payment
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeView === "projects" && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">All Projects</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and track all projects</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="p-5 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50/50 border-gray-200"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-lg font-semibold text-blue-700">{project.projectType || 'Project'}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-base">{project.name}</h4>
                          <p className="text-sm text-gray-500">{project.clientName}</p>
                          <p className="text-xs text-gray-400 mt-1">{project.area} {project.areaUnit} • {project.subType}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {project.projectStatus || 'Active'}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.random() * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Tasks: 32 • Team: 8</span>
                        <Button size="sm" variant="ghost" className="h-7 text-xs">
                          Details <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeView === "clients" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage client relationships and projects</p>
                </div>
                <Button
                  className="gap-2"
                  onClick={() => {
                    setNewUserRole("client");
                    setShowCreateUser(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Client
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {users.filter(u => u.role === "client").slice(0, 8).map((client) => (
                  <Card key={client.id} className="p-5 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg">
                          {client.fullName?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-bold text-base">{client.fullName}</h4>
                        <p className="text-sm text-gray-500">{client.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {projects.filter(p => p.clientId === client.id).length} Projects
                          </Badge>
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeView === "employees" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage employees and assignments</p>
                </div>
                <Button
                  className="gap-2"
                  onClick={() => {
                    setNewUserRole("employee");
                    setShowCreateUser(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Employee
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {users.filter(u => u.role === "employee" || u.role === "admin").map((employee) => (
                  <Card key={employee.id} className="p-5 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="w-16 h-16 mb-3">
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white font-bold text-xl">
                          {employee.fullName?.charAt(0) || 'E'}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="font-bold text-base">{employee.fullName}</h4>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant={employee.role === "admin" ? "default" : "secondary"} className="text-xs">
                          {employee.role}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-4 w-full">
                        <Button size="sm" variant="outline" className="flex-1 text-xs">
                          View Tasks
                        </Button>
                        <Button size="sm" variant="ghost" className="flex-1 text-xs">
                          Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeView === "meetings" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
                  <p className="text-sm text-gray-500 mt-1">Schedule and manage project meetings</p>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Schedule Meeting
                </Button>
              </div>

              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <Card key={meeting.id} className="p-5 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                          <span className="text-xs text-blue-600 font-medium">APR</span>
                          <span className="text-2xl font-bold text-blue-700">{meeting.date.split(' ')[1]}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base">{meeting.title}</h4>
                          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" />
                            {meeting.date} • {meeting.location}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{meeting.attendees} attendees</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Join</Button>
                        <Button size="sm" variant="ghost">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeView === "tasks" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                  <p className="text-sm text-gray-500 mt-1">Track and manage all tasks</p>
                </div>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Task
                </Button>
              </div>

              <div className="space-y-4">
                {tasks.slice(0, 10).map((task) => (
                  <Card key={task.id} className="p-4 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          task.status === "completed" ? "bg-green-100" :
                          task.status === "in_progress" ? "bg-blue-100" : "bg-gray-100"
                        }`}>
                          <CheckCircle2 className={`w-5 h-5 ${
                            task.status === "completed" ? "text-green-600" :
                            task.status === "in_progress" ? "text-blue-600" : "text-gray-400"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{task.taskType}</h4>
                          <p className="text-xs text-gray-500">Assigned to: {task.assignedTo}</p>
                          <p className="text-xs text-gray-400">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</p>
                        </div>
                      </div>
                      <Badge variant={
                        task.status === "completed" ? "outline" :
                        task.status === "in_progress" ? "default" : "secondary"
                      } className={task.status === "completed" ? "bg-green-50 text-green-700 border-green-200" : ""}>
                        {task.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Project Drawer */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end" onClick={() => setSelectedProject(null)}>
          <div
            className="w-[520px] h-full bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                  <p className="text-sm text-gray-500">{selectedProject.clientName} • {selectedProject.projectType} • {selectedProject.area} {selectedProject.areaUnit}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedProject(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-bold mb-2">Project Details</h3>
                  <p className="text-sm text-gray-600">Detailed project information will appear here</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create {newUserRole.charAt(0).toUpperCase() + newUserRole.slice(1)} Account</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new {newUserRole} account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUserRole} onValueChange={(val) => setNewUserRole(val as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="procurement">Procurement</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={newUserData.username}
                onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={newUserData.fullName}
                onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateUser}
                className="flex-1"
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? "Creating..." : "Create Account"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateUser(false)}
                disabled={createUserMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
