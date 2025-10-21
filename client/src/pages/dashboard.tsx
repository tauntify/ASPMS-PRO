import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Division, Item, ProjectSummary } from "@shared/schema";
import { DivisionSidebar } from "@/components/DivisionSidebar";
import { ItemManagement } from "@/components/ItemManagement";
import { Analytics } from "@/components/Analytics";
import { MasterSummary } from "@/components/MasterSummary";
import { ExportModal } from "@/components/ExportModal";
import { Button } from "@/components/ui/button";
import { Download, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const { data: divisions = [], isLoading: divisionsLoading } = useQuery<Division[]>({
    queryKey: ["/api/divisions"],
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });

  const { data: summary } = useQuery<ProjectSummary>({
    queryKey: ["/api/summary"],
  });

  const selectedDivision = divisions.find((d) => d.id === selectedDivisionId);
  const divisionItems = items.filter((item) => item.divisionId === selectedDivisionId);

  return (
    <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/20 border border-primary/50 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground tracking-wide">
                ARKA SERVICES
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Project Management System
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {summary && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 border border-primary/40">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total Budget
                </span>
                <span className="text-2xl font-mono font-bold text-primary">
                  {summary.totalCost.toLocaleString('en-PK')} PKR
                </span>
              </div>
            )}
            
            <Button
              onClick={() => setShowSummary(!showSummary)}
              variant="outline"
              className="border-accent/50 hover:border-accent"
              data-testid="button-toggle-summary"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showSummary ? "Hide" : "Show"} Summary
            </Button>
            
            <Button
              onClick={() => setShowExport(true)}
              variant="default"
              data-testid="button-export"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Division Sidebar */}
        <DivisionSidebar
          divisions={divisions}
          items={items}
          selectedDivisionId={selectedDivisionId}
          onSelectDivision={setSelectedDivisionId}
          isLoading={divisionsLoading}
        />

        {/* Center Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showSummary ? (
            <MasterSummary summary={summary} divisions={divisions} items={items} />
          ) : (
            <ItemManagement
              division={selectedDivision}
              items={divisionItems}
              isLoading={itemsLoading}
            />
          )}
        </div>

        {/* Right Analytics Panel */}
        <Analytics
          summary={summary}
          divisions={divisions}
          items={items}
        />
      </div>

      {/* Export Modal */}
      {showExport && (
        <ExportModal
          onClose={() => setShowExport(false)}
          divisions={divisions}
          items={items}
          summary={summary}
        />
      )}
    </div>
  );
}
