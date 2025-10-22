import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface TaskStats {
  month: string;
  total: number;
  done: number;
  inProgress: number;
  undone: number;
  completionRate: number;
}

interface TaskProgressGraphProps {
  employeeId?: string;
  showEmployeeFilter?: boolean;
}

export function TaskProgressGraph({ employeeId, showEmployeeFilter = false }: TaskProgressGraphProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), "yyyy-MM"));

  // Generate last 6 months for the dropdown
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, "yyyy-MM");
  });

  // Fetch task statistics for the selected month
  const { data: stats } = useQuery<TaskStats>({
    queryKey: ["/api/tasks/stats/monthly", selectedMonth, employeeId],
    queryFn: async () => {
      let url = `/api/tasks/stats/monthly?month=${selectedMonth}`;
      if (employeeId) {
        url += `&employeeId=${employeeId}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch statistics");
      return res.json();
    },
  });

  // Prepare data for the chart
  const chartData = stats ? [
    { name: "Done", value: stats.done, fill: "hsl(var(--chart-1))" },
    { name: "In Progress", value: stats.inProgress, fill: "hsl(var(--chart-2))" },
    { name: "Pending", value: stats.undone, fill: "hsl(var(--chart-3))" },
  ] : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Task Progress Analytics</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Monthly task completion tracking
            </p>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48" data-testid="select-progress-month">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {format(new Date(month + "-01"), "MMMM yyyy")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {stats ? (
          <div className="space-y-6">
            {/* Statistics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-card border border-border">
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total">
                  {stats.total}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-500" data-testid="stat-done">
                  {stats.done}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-yellow-500" data-testid="stat-inprogress">
                  {stats.inProgress}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-border">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-blue-500" data-testid="stat-completion">
                  {stats.completionRate}%
                </p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      fontSize: '12px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-semibold text-foreground">{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${stats.completionRate}%` }}
                  data-testid="progress-bar"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Loading statistics...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
