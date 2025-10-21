import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Division, Item, ProjectSummary, Project } from "@shared/schema";
import { ProjectSelector } from "@/components/ProjectSelector";
import { ProjectDetailsDialog } from "@/components/ProjectDetailsDialog";
import { DivisionSidebar } from "@/components/DivisionSidebar";
import { ItemManagement } from "@/components/ItemManagement";
import { Analytics } from "@/components/Analytics";
import { MasterSummary } from "@/components/MasterSummary";
import { ExportModal } from "@/components/ExportModal";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, ArrowLeft, Info } from "lucide-react";

export default function Dashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: divisions = [], isLoading: divisionsLoading } = useQuery<Division[]>({
    queryKey: [`/api/divisions?projectId=${selectedProjectId}`],
    enabled: !!selectedProjectId,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: [`/api/items?projectId=${selectedProjectId}`],
    enabled: !!selectedProjectId,
  });

  const { data: summary } = useQuery<ProjectSummary>({
    queryKey: [`/api/summary?projectId=${selectedProjectId}`],
    enabled: !!selectedProjectId,
  });

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const selectedDivision = divisions.find((d) => d.id === selectedDivisionId);
  const divisionItems = items.filter((item) => item.divisionId === selectedDivisionId);

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setSelectedDivisionId(null);
    setShowSummary(false);
  };

  // Show project selector if no project is selected
  if (!selectedProjectId) {
    return (
      <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
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
          </div>
        </header>
        <ProjectSelector onSelectProject={setSelectedProjectId} />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background overflow-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToProjects}
              data-testid="button-back-to-projects"
              className="mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-md bg-primary/20 border border-primary/50 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground tracking-wide">
                {selectedProject?.name || "PROJECT"}
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Architecture & Interior Design Management
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
              onClick={() => setShowProjectDetails(true)}
              variant="outline"
              className="border-purple-500/50 hover:border-purple-500"
              data-testid="button-project-details"
            >
              <Info className="w-4 h-4 mr-2" />
              Project Details
            </Button>

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
          projectId={selectedProjectId}
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

      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        project={selectedProject || null}
        open={showProjectDetails}
        onOpenChange={setShowProjectDetails}
      />

      {/* Export Modal */}
      {showExport && selectedProject && (
        <ExportModal
          onClose={() => setShowExport(false)}
          project={selectedProject}
          projectName={selectedProject.name}
          divisions={divisions}
          items={items}
          summary={summary}
        />
      )}
    </div>
  );
}
