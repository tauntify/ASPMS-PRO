import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Activity,
  DollarSign,
  ClipboardList,
  UserCheck,
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Project, User, Task } from "@shared/schema";
import { OverviewLeftSidebar } from "@/components/OverviewLeftSidebar";
import { OverviewRightSidebar } from "@/components/OverviewRightSidebar";

interface Props {
  projects: Project[];
  users: User[];
  tasks: Task[];
}

export function ComprehensiveOverview({ projects, users, tasks }: Props) {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [rightSidebarSection, setRightSidebarSection] = useState<string | null>(null);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setRightSidebarSection(section);
  };

  // Calculate statistics
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const employees = users.filter((u) => u.role === "employee");
  const todayTasks = tasks.filter((t) => {
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  });
  const pendingApprovals = 4; // Mock data
  const pendingAccounts = 6; // Mock data
  const attendanceRate = 92; // Mock data

  // Summary boxes data
  const summaryBoxes = [
    {
      id: "projects",
      title: "Complete Project Summary",
      icon: Briefcase,
      color: "from-blue-500 to-blue-600",
      stats: [
        { label: "Active", value: activeProjects },
        { label: "Completed", value: completedProjects },
        { label: "Total", value: projects.length },
      ],
      items: projects.slice(0, 3),
      chartData: { active: activeProjects, completed: completedProjects, total: projects.length },
    },
    {
      id: "employees",
      title: "Employees Summary",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      stats: [
        { label: "Total", value: employees.length },
        { label: "Active", value: employees.filter((e) => e.status === "active").length },
        { label: "On Leave", value: employees.filter((e) => e.status === "inactive").length },
      ],
      items: employees.slice(0, 3),
      chartData: { total: employees.length, active: employees.filter((e) => e.status === "active").length },
    },
    {
      id: "tasks",
      title: "Tasks Summary",
      icon: CheckCircle2,
      color: "from-green-500 to-green-600",
      stats: [
        { label: "Total", value: tasks.length },
        { label: "Due Today", value: todayTasks.length },
        { label: "Completed", value: tasks.filter((t) => t.status === "completed").length },
      ],
      items: tasks.slice(0, 3),
      chartData: { total: tasks.length, completed: tasks.filter((t) => t.status === "completed").length },
    },
    {
      id: "attendance",
      title: "Employee Attendance",
      icon: UserCheck,
      color: "from-amber-500 to-amber-600",
      stats: [
        { label: "Today", value: `${attendanceRate}%` },
        { label: "Present", value: Math.floor(employees.length * (attendanceRate / 100)) },
        { label: "Absent", value: employees.length - Math.floor(employees.length * (attendanceRate / 100)) },
      ],
      items: employees.slice(0, 3).map((e) => ({ ...e, attendance: "Present" })),
      chartData: { present: attendanceRate, absent: 100 - attendanceRate },
    },
    {
      id: "meetings",
      title: "Meeting Schedule",
      icon: Calendar,
      color: "from-indigo-500 to-indigo-600",
      stats: [
        { label: "Today", value: 2 },
        { label: "This Week", value: 8 },
        { label: "Upcoming", value: 12 },
      ],
      items: [
        { id: 1, title: "Site Walk - DHA Villa", time: "10:00 AM", location: "On-site" },
        { id: 2, title: "Client Approval Meeting", time: "2:00 PM", location: "Office" },
        { id: 3, title: "Team Standup", time: "5:00 PM", location: "Virtual" },
      ],
      chartData: { today: 2, week: 8, upcoming: 12 },
    },
    {
      id: "activities",
      title: "Recent Activities",
      icon: Activity,
      color: "from-pink-500 to-pink-600",
      stats: [
        { label: "Today", value: 24 },
        { label: "This Week", value: 156 },
        { label: "This Month", value: 642 },
      ],
      items: [
        { id: 1, user: "Ahmed", action: "completed task", target: "DHA Project", time: "10 mins ago" },
        { id: 2, user: "Ayesha", action: "commented on", target: "Mall Fitout", time: "25 mins ago" },
        { id: 3, user: "Client", action: "approved", target: "BOQ Item #23", time: "1 hour ago" },
      ],
      chartData: { today: 24, week: 156, month: 642 },
    },
    {
      id: "accounts",
      title: "Pending Accounts",
      icon: DollarSign,
      color: "from-red-500 to-red-600",
      stats: [
        { label: "Pending", value: pendingAccounts },
        { label: "Amount", value: "PKR 2.4M" },
        { label: "Overdue", value: 2 },
      ],
      items: [
        { id: 1, invoice: "#INV-2401", client: "DHA Tower", amount: "PKR 850K", status: "Pending" },
        { id: 2, invoice: "#INV-2402", client: "Mall Fitout", amount: "PKR 1.2M", status: "Overdue" },
        { id: 3, invoice: "#INV-2403", client: "Corporate HQ", amount: "PKR 350K", status: "Pending" },
      ],
      chartData: { pending: pendingAccounts, paid: 8, overdue: 2 },
    },
    {
      id: "approvals",
      title: "Pending Client Approvals",
      icon: ClipboardList,
      color: "from-cyan-500 to-cyan-600",
      stats: [
        { label: "Pending", value: pendingApprovals },
        { label: "Approved Today", value: 3 },
        { label: "Awaiting", value: 7 },
      ],
      items: [
        { id: 1, item: "MEP Drawing Level 2", project: "DHA Tower", client: "Imran", days: 3 },
        { id: 2, item: "BOQ Revision #4", project: "Mall Fitout", client: "RetailX", days: 5 },
        { id: 3, item: "Design Concept v3", project: "Villa Project", client: "Sara", days: 2 },
      ],
      chartData: { pending: pendingApprovals, approved: 12, rejected: 1 },
    },
    {
      id: "approval-board",
      title: "Approval Board",
      icon: BarChart3,
      color: "from-teal-500 to-teal-600",
      stats: [
        { label: "Total", value: 24 },
        { label: "Approved", value: 17 },
        { label: "Pending", value: 7 },
      ],
      items: [
        { id: 1, stage: "Design Phase", approved: 12, pending: 2, total: 14 },
        { id: 2, stage: "Procurement", approved: 5, pending: 3, total: 8 },
        { id: 3, stage: "Construction", approved: 0, pending: 2, total: 2 },
      ],
      chartData: { approved: 17, pending: 7, rejected: 0 },
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left Sidebar */}
      <OverviewLeftSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content Area - Full Width */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6 animate-fade-in">
          {/* Hero Section */}
          <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Studio Control Center</h2>
                <p className="text-blue-100">Comprehensive overview of all operations</p>
              </div>
              <div className="flex gap-3">
                <div className="text-center px-6 py-3 bg-white/20 rounded-lg backdrop-blur">
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <div className="text-xs">Projects</div>
                </div>
                <div className="text-center px-6 py-3 bg-white/20 rounded-lg backdrop-blur">
                  <div className="text-2xl font-bold">{employees.length}</div>
                  <div className="text-xs">Employees</div>
                </div>
                <div className="text-center px-6 py-3 bg-white/20 rounded-lg backdrop-blur">
                  <div className="text-2xl font-bold">{tasks.length}</div>
                  <div className="text-xs">Tasks</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Summary Grid */}
          <div className="grid grid-cols-3 gap-6">
            {summaryBoxes.map((box) => {
              const Icon = box.icon;
              return (
                <Card
                  key={box.id}
                  className="p-5 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 animate-scale-in"
                  onClick={() => handleSectionChange(box.id)}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${box.color} flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{box.title}</h3>
                        <p className="text-xs text-gray-500">Click for details</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {box.stats.map((stat, idx) => (
                      <div key={idx} className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mini Chart Visualization */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2">
                      <PieChart className="w-8 h-8 text-blue-600" />
                      <div className="text-xs text-gray-600">
                        Visual analytics available
                      </div>
                    </div>
                  </div>

                  {/* Latest 3 Items */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-600 mb-2">Latest Items:</div>
                    {box.items.slice(0, 3).map((item: any, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2 bg-white border border-gray-100 rounded flex items-center justify-between hover:bg-blue-50 transition-colors"
                      >
                        <span className="truncate font-medium text-gray-700">
                          {item.name || item.title || item.username || item.invoice || item.stage || `Item ${idx + 1}`}
                        </span>
                        <Clock className="w-3 h-3 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>

                  {/* View All Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSectionChange(box.id);
                    }}
                  >
                    View All Details
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

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
