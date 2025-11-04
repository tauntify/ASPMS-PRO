import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Project,
  ProjectAssignment,
  Task,
} from "@shared/schema";
import AsanaDashboardLayout from "@/components/AsanaDashboardLayout";
import AsanaCard, { AsanaStatCard } from "@/components/AsanaCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  Folder,
  CheckCircle2,
  BarChart3,
  Calendar,
  MessageSquare,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function ClientDashboardNew() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Fetch project assignments for this client
  const { data: assignments = [] } = useQuery<ProjectAssignment[]>({
    queryKey: ["/api/assignments", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/assignments?userId=${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Get assigned project IDs
  const assignedProjectIds = assignments.map(a => a.projectId);

  // Fetch all projects
  const { data: allProjects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Filter to only assigned projects
  const assignedProjects = allProjects.filter(p => assignedProjectIds.includes(p.id));

  // Fetch tasks for overview
  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Calculate stats
  const totalProjects = assignedProjects.length;
  const activeTasks = allTasks.filter(t => t.status === "In Progress").length;
  const completedTasks = allTasks.filter(t => t.status === "Done").length;
  const incompleteTasks = allTasks.filter(t => t.status === "Undone").length;

  // Sidebar configuration
  const sidebarSections = [
    {
      items: [
        {
          icon: Home,
          label: "Overview",
          active: !selectedProjectId,
          onClick: () => setSelectedProjectId(null),
        },
        {
          icon: Folder,
          label: "My Projects",
          badge: totalProjects,
          href: "#projects",
        },
        {
          icon: CheckCircle2,
          label: "Tasks",
          badge: incompleteTasks,
          href: "#tasks",
        },
        {
          icon: MessageSquare,
          label: "Messages",
          href: "#messages",
        },
        {
          icon: Calendar,
          label: "Timeline",
          href: "#timeline",
        },
        {
          icon: FileText,
          label: "Documents",
          href: "#documents",
        },
        {
          icon: BarChart3,
          label: "Reports",
          href: "#reports",
        },
      ],
    },
  ];

  // Prepare chart data
  const taskStatusData = [
    { name: 'Backlog', value: incompleteTasks, color: 'var(--chart-quaternary)' },
    { name: 'In Progress', value: activeTasks, color: 'var(--chart-secondary)' },
    { name: 'Completed', value: completedTasks, color: 'var(--chart-primary)' },
  ];

  const projectProgressData = assignedProjects.slice(0, 5).map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    progress: Math.floor(Math.random() * 100), // Replace with actual progress calculation
  }));

  const taskCompletionOverTime = [
    { week: 'Week 1', incomplete: 15, complete: 5 },
    { week: 'Week 2', incomplete: 12, complete: 18 },
    { week: 'Week 3', incomplete: 8, complete: 25 },
    { week: 'Week 4', incomplete: 5, complete: 35 },
  ];

  return (
    <AsanaDashboardLayout
      brandName="My Projects"
      sidebarSections={sidebarSections}
      sidebarFooter={
        <div className="text-sm" style={{ color: 'var(--sidebar-text)' }}>
          <div className="font-semibold mb-1" style={{ color: 'var(--sidebar-text-hover)' }}>
            {user?.username}
          </div>
          <div className="text-xs opacity-75">{user?.email}</div>
        </div>
      }
    >
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Welcome back, {user?.username}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Here's what's happening with your projects
            </p>
          </div>
          <Button
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff'
            }}
          >
            + New Request
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AsanaStatCard
            label="Total Projects"
            value={totalProjects}
            trend={{ value: 12, isPositive: true }}
          />
          <AsanaStatCard
            label="Active Tasks"
            value={activeTasks}
            trend={{ value: 8, isPositive: true }}
          />
          <AsanaStatCard
            label="Completed Tasks"
            value={completedTasks}
            trend={{ value: 15, isPositive: true }}
          />
          <AsanaStatCard
            label="Pending Items"
            value={incompleteTasks}
            trend={{ value: 5, isPositive: false }}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Breakdown Donut Chart */}
          <AsanaCard title="Task Breakdown" subtitle="Current task status distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center gap-6">
              {taskStatusData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </AsanaCard>

          {/* Project Progress Bar Chart */}
          <AsanaCard title="Project Progress" subtitle="Completion status by project">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectProgressData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="progress"
                  fill="var(--chart-primary)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </AsanaCard>

          {/* Task Completion Over Time */}
          <AsanaCard
            title="Task Completion Over Time"
            subtitle="Weekly progress tracking"
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={taskCompletionOverTime}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="complete"
                  stroke="var(--chart-primary)"
                  strokeWidth={3}
                  fill="var(--chart-primary)"
                  fillOpacity={0.2}
                />
                <Line
                  type="monotone"
                  dataKey="incomplete"
                  stroke="var(--chart-secondary)"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </AsanaCard>
        </div>

        {/* Recent Projects List */}
        <AsanaCard title="Recent Projects" subtitle="Your active projects">
          <div className="space-y-4">
            {assignedProjects.slice(0, 5).map(project => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all"
                style={{
                  borderColor: 'var(--card-border)',
                  backgroundColor: 'var(--foreground)',
                }}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'var(--primary)', color: '#ffffff' }}
                  >
                    <Folder className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {project.name}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {project.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Status: {project.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AsanaCard>
      </div>
    </AsanaDashboardLayout>
  );
}
