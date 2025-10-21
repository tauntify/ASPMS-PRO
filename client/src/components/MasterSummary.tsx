import { Division, Item, ProjectSummary } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, TrendingUp, CheckCircle, Package, Layers, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface MasterSummaryProps {
  summary: ProjectSummary | undefined;
  divisions: Division[];
  items: Item[];
}

const STATUS_COLORS = {
  "Not Started": "#ef4444",
  "Purchased": "#f59e0b",
  "In Installation Phase": "#3b82f6",
  "Installed": "#8b5cf6",
  "Delivered": "#10b981",
};

const PRIORITY_COLORS = {
  High: "#ef4444",
  Mid: "#f59e0b",
  Low: "#10b981",
};

export function MasterSummary({ summary, divisions, items }: MasterSummaryProps) {
  if (!summary) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            Loading Summary
          </h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we calculate the project summary
          </p>
        </div>
      </div>
    );
  }

  // Prepare status distribution data
  const statusData = summary.statusBreakdown.map(status => ({
    name: status.status,
    value: status.itemCount,
    cost: status.cost,
  }));

  // Prepare priority distribution data for bar chart
  const priorityData = summary.priorityBreakdown.map(priority => ({
    name: priority.priority,
    cost: priority.cost,
    items: priority.itemCount,
  }));

  // Prepare division data for chart
  const divisionChartData = summary.divisionBreakdown.slice(0, 8).map(div => ({
    name: div.divisionName.length > 15 ? div.divisionName.substring(0, 15) + '...' : div.divisionName,
    cost: div.totalCost,
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">
            Master Project Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete overview with analytics and progress tracking
          </p>
        </div>

        {/* Top Row - Key Metrics Grid */}
        <div className="grid grid-cols-6 gap-4">
          {/* Overall Progress - Takes 2 columns */}
          <Card className="col-span-2 p-6 border-primary/50 bg-gradient-to-br from-primary/20 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/30 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wide">
                  Overall Progress
                </h3>
                <p className="text-xs text-muted-foreground">
                  Status-based completion
                </p>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-5xl font-mono font-bold text-primary" data-testid="text-overall-progress">
                {Math.round(summary.overallProgress)}%
              </p>
            </div>
            <Progress value={summary.overallProgress} className="h-3" />
          </Card>

          {/* Total Cost */}
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Total Cost
              </p>
            </div>
            <p className="text-3xl font-mono font-bold text-primary mb-1" data-testid="text-summary-total">
              {summary.totalCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">PKR</p>
          </Card>

          {/* Total Items */}
          <Card className="p-6 border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-accent" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Total Items
              </p>
            </div>
            <p className="text-3xl font-mono font-bold text-accent mb-1">
              {summary.totalItems}
            </p>
            <p className="text-xs text-muted-foreground">Items</p>
          </Card>

          {/* Total Divisions */}
          <Card className="p-6 border-chart-3/30 bg-gradient-to-br from-chart-3/10 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-5 h-5 text-chart-3" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Divisions
              </p>
            </div>
            <p className="text-3xl font-mono font-bold text-chart-3 mb-1">
              {summary.totalDivisions}
            </p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </Card>

          {/* Average Cost */}
          <Card className="p-6 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Avg Cost
              </p>
            </div>
            <p className="text-3xl font-mono font-bold text-purple-500 mb-1">
              {summary.totalItems > 0 
                ? Math.round(summary.totalCost / summary.totalItems).toLocaleString('en-PK', { maximumFractionDigits: 0 })
                : '0'
              }
            </p>
            <p className="text-xs text-muted-foreground">PKR/Item</p>
          </Card>
        </div>

        {/* Priority Breakdown Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-5 border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                High Priority
              </p>
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
            </div>
            <p className="text-3xl font-mono font-bold text-destructive mb-1">
              {summary.highPriorityCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.totalCost > 0 ? Math.round((summary.highPriorityCost / summary.totalCost) * 100) : 0}% of total • {
                summary.priorityBreakdown.find(p => p.priority === 'High')?.itemCount || 0
              } items
            </p>
          </Card>

          <Card className="p-5 border-chart-4/30 bg-gradient-to-br from-chart-4/10 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Mid Priority
              </p>
              <div className="w-3 h-3 rounded-full bg-chart-4"></div>
            </div>
            <p className="text-3xl font-mono font-bold text-chart-4 mb-1">
              {summary.midPriorityCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.totalCost > 0 ? Math.round((summary.midPriorityCost / summary.totalCost) * 100) : 0}% of total • {
                summary.priorityBreakdown.find(p => p.priority === 'Mid')?.itemCount || 0
              } items
            </p>
          </Card>

          <Card className="p-5 border-chart-5/30 bg-gradient-to-br from-chart-5/10 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Low Priority
              </p>
              <div className="w-3 h-3 rounded-full bg-chart-5"></div>
            </div>
            <p className="text-3xl font-mono font-bold text-chart-5 mb-1">
              {summary.lowPriorityCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.totalCost > 0 ? Math.round((summary.lowPriorityCost / summary.totalCost) * 100) : 0}% of total • {
                summary.priorityBreakdown.find(p => p.priority === 'Low')?.itemCount || 0
              } items
            </p>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Status Distribution Pie Chart */}
          <Card className="p-6 border-border">
            <h3 className="text-lg font-display font-bold text-foreground mb-1">
              Status Distribution
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Items breakdown by completion status
            </p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      const percentValue = Number.isFinite(percent) ? (percent * 100).toFixed(0) : '0';
                      return `${name}: ${percentValue}%`;
                    }}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border p-3 rounded-md shadow-lg">
                            <p className="font-semibold text-foreground">{data.name}</p>
                            <p className="text-sm text-muted-foreground">Items: {data.value}</p>
                            <p className="text-sm text-primary font-mono">
                              {data.cost.toLocaleString('en-PK')} PKR
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Priority Cost Bar Chart */}
          <Card className="p-6 border-border">
            <h3 className="text-lg font-display font-bold text-foreground mb-1">
              Priority Cost Analysis
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Budget allocation by priority level
            </p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border p-3 rounded-md shadow-lg">
                            <p className="font-semibold text-foreground">{data.name} Priority</p>
                            <p className="text-sm text-primary font-mono">
                              {data.cost.toLocaleString('en-PK')} PKR
                            </p>
                            <p className="text-sm text-muted-foreground">{data.items} items</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Division Cost Chart */}
        {divisionChartData.length > 0 && (
          <Card className="p-6 border-border">
            <h3 className="text-lg font-display font-bold text-foreground mb-1">
              Division Cost Breakdown
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Cost distribution across divisions
            </p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={divisionChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                  <XAxis 
                    type="number"
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    stroke="#888"
                    style={{ fontSize: '11px' }}
                    width={120}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border p-3 rounded-md shadow-lg">
                            <p className="font-semibold text-foreground">{data.name}</p>
                            <p className="text-sm text-primary font-mono">
                              {data.cost.toLocaleString('en-PK')} PKR
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="cost" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Status Breakdown Table */}
        <Card className="border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-display font-bold text-foreground">
              Status Breakdown
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed view of items by completion status
            </p>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-display font-semibold uppercase text-xs tracking-wider">
                  Status
                </TableHead>
                <TableHead className="font-display font-semibold uppercase text-xs tracking-wider text-right">
                  Items
                </TableHead>
                <TableHead className="font-display font-semibold uppercase text-xs tracking-wider text-right">
                  Total Cost (PKR)
                </TableHead>
                <TableHead className="font-display font-semibold uppercase text-xs tracking-wider text-right">
                  % of Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.statusBreakdown.map((status) => (
                <TableRow 
                  key={status.status} 
                  className="border-border hover-elevate"
                >
                  <TableCell className="font-display font-medium">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: STATUS_COLORS[status.status as keyof typeof STATUS_COLORS] }}
                      ></div>
                      {status.status}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {status.itemCount}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-primary">
                    {status.cost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {summary.totalCost > 0 ? Math.round((status.cost / summary.totalCost) * 100) : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Division Breakdown Table */}
        <Card className="border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-display font-bold text-foreground">
              Division Breakdown
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed cost analysis for each division
            </p>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-display font-semibold uppercase text-xs tracking-wider">
                  Division Name
                </TableHead>
                <TableHead className="font-display font-semibold uppercase text-xs tracking-wider text-right">
                  Items
                </TableHead>
                <TableHead className="font-display font-semibold uppercase text-xs tracking-wider text-right">
                  Total Cost (PKR)
                </TableHead>
                <TableHead className="font-display font-semibold uppercase text-xs tracking-wider text-right">
                  % of Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.divisionBreakdown.map((division, idx) => (
                <TableRow 
                  key={division.divisionId} 
                  className="border-border hover-elevate"
                  data-testid={`row-summary-division-${idx}`}
                >
                  <TableCell className="font-display font-medium">
                    {division.divisionName}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {division.itemCount}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-primary">
                    {division.totalCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {summary.totalCost > 0 ? Math.round((division.totalCost / summary.totalCost) * 100) : 0}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 border-primary/30 bg-primary/5 hover:bg-primary/5">
                <TableCell className="font-display font-bold">
                  TOTAL
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  {summary.totalItems}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-primary text-lg">
                  {summary.totalCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  {summary.totalCost > 0 ? '100%' : '0%'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
