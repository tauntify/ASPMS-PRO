import { Division, Item, ProjectSummary } from "@shared/schema";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, TrendingUp } from "lucide-react";

interface MasterSummaryProps {
  summary: ProjectSummary | undefined;
  divisions: Division[];
  items: Item[];
}

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

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Master Project Summary
          </h1>
          <p className="text-muted-foreground">
            Complete breakdown of all divisions and budget allocation
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Total Project Cost
            </p>
            <p className="text-3xl font-mono font-bold text-primary mb-1" data-testid="text-summary-total">
              {summary.totalCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-muted-foreground">PKR</p>
          </Card>

          <Card className="p-6 border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              High Priority
            </p>
            <p className="text-3xl font-mono font-bold text-destructive mb-1">
              {summary.highPriorityCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-muted-foreground">
              {Math.round((summary.highPriorityCost / summary.totalCost) * 100)}% of total
            </p>
          </Card>

          <Card className="p-6 border-chart-4/30 bg-gradient-to-br from-chart-4/10 to-transparent">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Mid Priority
            </p>
            <p className="text-3xl font-mono font-bold text-chart-4 mb-1">
              {summary.midPriorityCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-muted-foreground">
              {Math.round((summary.midPriorityCost / summary.totalCost) * 100)}% of total
            </p>
          </Card>

          <Card className="p-6 border-chart-5/30 bg-gradient-to-br from-chart-5/10 to-transparent">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Low Priority
            </p>
            <p className="text-3xl font-mono font-bold text-chart-5 mb-1">
              {summary.lowPriorityCost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-sm text-muted-foreground">
              {Math.round((summary.lowPriorityCost / summary.totalCost) * 100)}% of total
            </p>
          </Card>
        </div>

        {/* Division Breakdown Table */}
        <Card className="border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-display font-bold text-foreground">
              Division-by-Division Breakdown
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
                    {Math.round((division.totalCost / summary.totalCost) * 100)}%
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
                  100%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        {/* Priority Breakdown Table */}
        <Card className="border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-display font-bold text-foreground">
              Priority-Based Funds Allocation
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Budget distribution across priority levels
            </p>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-display font-semibold uppercase text-xs tracking-wider">
                  Priority Level
                </TableHead>
                <TableHead className="font-display font-semibold uppercase text-xs tracking-wider text-right">
                  Items
                </TableHead>
                <TableHead className="font-display font-semibold uppercase text-xs tracking-wider text-right">
                  Required Funds (PKR)
                </TableHead>
                <TableHead className="font-display font-semibold uppercase text-xs tracking-wider text-right">
                  % of Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.priorityBreakdown.map((priority) => (
                <TableRow 
                  key={priority.priority} 
                  className="border-border hover-elevate"
                  data-testid={`row-summary-priority-${priority.priority}`}
                >
                  <TableCell className="font-display font-medium">
                    {priority.priority} Priority
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {priority.itemCount}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-primary">
                    {priority.cost.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {Math.round((priority.cost / summary.totalCost) * 100)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Project Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6 border-border text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-mono font-bold text-foreground">
              {summary.totalDivisions}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Total Divisions
            </p>
          </Card>

          <Card className="p-6 border-border text-center">
            <FileText className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-mono font-bold text-foreground">
              {summary.totalItems}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Total Items
            </p>
          </Card>

          <Card className="p-6 border-border text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-mono font-bold text-foreground">
              {summary.totalItems > 0 
                ? Math.round(summary.totalCost / summary.totalItems).toLocaleString('en-PK')
                : '0'
              }
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Avg Cost Per Item (PKR)
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
