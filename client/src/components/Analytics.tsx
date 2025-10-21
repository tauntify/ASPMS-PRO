import { Division, Item, ProjectSummary, Priority } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { TrendingUp, Package, Layers, DollarSign } from "lucide-react";

interface AnalyticsProps {
  summary: ProjectSummary | undefined;
  divisions: Division[];
  items: Item[];
}

const priorityColors = {
  High: "hsl(var(--destructive))",
  Mid: "hsl(var(--chart-4))",
  Low: "hsl(var(--chart-5))",
};

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function Analytics({ summary, divisions, items }: AnalyticsProps) {
  if (!summary) {
    return (
      <div className="w-96 border-l border-border bg-card/30 backdrop-blur-sm p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const priorityChartData = summary.priorityBreakdown.map((item) => ({
    name: item.priority,
    value: item.cost,
    itemCount: item.itemCount,
  }));

  const divisionChartData = summary.divisionBreakdown.slice(0, 5).map((item, idx) => ({
    name: item.divisionName.length > 15 
      ? item.divisionName.substring(0, 15) + '...' 
      : item.divisionName,
    value: item.totalCost,
    fill: chartColors[idx % chartColors.length],
  }));

  return (
    <div className="w-96 border-l border-border bg-card/30 backdrop-blur-sm flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-sm font-display font-semibold text-foreground uppercase tracking-wider">
          Analytics Dashboard
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/20 border border-primary/50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Total Cost
                </p>
                <p className="text-lg font-mono font-bold text-primary truncate" data-testid="text-total-cost">
                  {summary.totalCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">PKR</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-chart-4/30 bg-gradient-to-br from-chart-4/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-chart-4/20 border border-chart-4/50 flex items-center justify-center">
                <Package className="w-5 h-5 text-chart-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Total Items
                </p>
                <p className="text-lg font-mono font-bold text-foreground" data-testid="text-total-items">
                  {summary.totalItems}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-chart-2/30 bg-gradient-to-br from-chart-2/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-chart-2/20 border border-chart-2/50 flex items-center justify-center">
                <Layers className="w-5 h-5 text-chart-2" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Divisions
                </p>
                <p className="text-lg font-mono font-bold text-foreground" data-testid="text-total-divisions">
                  {summary.totalDivisions}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-destructive/20 border border-destructive/50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  High Priority
                </p>
                <p className="text-sm font-mono font-bold text-destructive truncate" data-testid="text-high-priority-cost">
                  {summary.highPriorityCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">PKR</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Priority Breakdown Chart */}
        <Card className="p-4 border-border" data-testid="card-priority-chart">
          <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Budget by Priority
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={priorityColors[entry.name as Priority]}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <Card className="p-3 border-primary/30 bg-card/95 backdrop-blur-sm">
                          <p className="text-xs font-display font-semibold uppercase tracking-wider mb-1">
                            {data.name} Priority
                          </p>
                          <p className="text-sm font-mono font-bold text-primary">
                            {data.value.toLocaleString('en-PK')} PKR
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {data.itemCount} items
                          </p>
                        </Card>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {summary.priorityBreakdown.map((item) => (
              <div key={item.priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: priorityColors[item.priority] }}
                  />
                  <span className="text-sm text-foreground">{item.priority}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-semibold text-foreground">
                    {item.cost.toLocaleString('en-PK', { maximumFractionDigits: 0 })} PKR
                  </p>
                  <p className="text-xs text-muted-foreground">{item.itemCount} items</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Division Breakdown Chart */}
        {divisionChartData.length > 0 && (
          <Card className="p-4 border-border" data-testid="card-division-chart">
            <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Top Divisions by Cost
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={divisionChartData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    stroke="hsl(var(--border))"
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <Card className="p-3 border-primary/30 bg-card/95 backdrop-blur-sm">
                            <p className="text-xs font-display font-semibold uppercase tracking-wider mb-1">
                              {data.payload.name}
                            </p>
                            <p className="text-sm font-mono font-bold text-primary">
                              {Number(data.value).toLocaleString('en-PK')} PKR
                            </p>
                          </Card>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Priority Funds Summary */}
        <Card className="p-4 border-border">
          <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Priority-Based Funds Required
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-display font-medium text-destructive">
                  High Priority Items
                </span>
                <span className="text-lg font-mono font-bold text-destructive" data-testid="text-high-funds">
                  {summary.highPriorityCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })} PKR
                </span>
              </div>
            </div>

            <div className="p-3 rounded-md bg-chart-4/10 border border-chart-4/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-display font-medium text-chart-4">
                  Mid Priority Items
                </span>
                <span className="text-lg font-mono font-bold text-chart-4" data-testid="text-mid-funds">
                  {summary.midPriorityCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })} PKR
                </span>
              </div>
            </div>

            <div className="p-3 rounded-md bg-chart-5/10 border border-chart-5/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-display font-medium text-chart-5">
                  Low Priority Items
                </span>
                <span className="text-lg font-mono font-bold text-chart-5" data-testid="text-low-funds">
                  {summary.lowPriorityCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })} PKR
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
