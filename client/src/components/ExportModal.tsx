import { useState } from "react";
import { Division, Item, ProjectSummary, Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Download, FileSpreadsheet, FileText, Image as ImageIcon, Table2, FileBarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExportDashboard } from "./ExportDashboard";
import { jsPDF } from "jspdf";

interface ExportModalProps {
  onClose: () => void;
  project: Project;
  projectName: string;
  divisions: Division[];
  items: Item[];
  summary: ProjectSummary | undefined;
}

export type ExportTemplateType = "standard" | "boq" | "progress-report";

export function ExportModal({ onClose, project, projectName, divisions, items, summary }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf" | "jpeg">("excel");
  const [exportTemplate, setExportTemplate] = useState<ExportTemplateType>("standard");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  if (!summary) {
    return null;
  }

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (exportFormat === "jpeg" || exportFormat === "pdf") {
        const html2canvas = (await import("html2canvas")).default;
        const exportElement = document.getElementById("export-dashboard");
        
        if (!exportElement) {
          throw new Error("Export dashboard element not found");
        }

        // Temporarily move the element into view for capture
        exportElement.style.left = '0';
        exportElement.style.top = '0';

        const canvas = await html2canvas(exportElement, {
          backgroundColor: null,
          scale: 2,
          logging: false,
          width: 1920,
          height: 1080,
        });

        // Move it back off-screen
        exportElement.style.left = '-9999px';

        if (exportFormat === "jpeg") {
          canvas.toBlob((blob) => {
            if (!blob) {
              throw new Error("Failed to create image");
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const templateSuffix = exportTemplate === "boq" ? "-boq" : 
                                   exportTemplate === "progress-report" ? "-progress-report" : "";
            a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}${templateSuffix}-${new Date().toISOString().split('T')[0]}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
              title: "Export successful",
              description: "Your JPEG file has been downloaded.",
            });

            onClose();
            setIsExporting(false);
          }, "image/jpeg", 0.95);

          return;
        }

        if (exportFormat === "pdf") {
          // Create PDF with the canvas image
          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [1920, 1080],
          });

          pdf.addImage(imgData, "JPEG", 0, 0, 1920, 1080);
          const templateSuffix = exportTemplate === "boq" ? "-boq" : 
                                 exportTemplate === "progress-report" ? "-progress-report" : "";
          pdf.save(`${projectName.toLowerCase().replace(/\s+/g, '-')}${templateSuffix}-${new Date().toISOString().split('T')[0]}.pdf`);

          toast({
            title: "Export successful",
            description: "Your PDF file has been downloaded.",
          });

          onClose();
          setIsExporting(false);
          return;
        }
      }

      // Excel export - use API
      const response = await fetch(`/api/export/${exportFormat}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ divisions, items, summary }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: `Your ${exportFormat.toUpperCase()} file has been downloaded.`,
      });

      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Hidden export dashboard for rendering */}
      <ExportDashboard
        project={project}
        projectName={projectName}
        divisions={divisions}
        items={items}
        summary={summary}
        templateType={exportTemplate}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-primary/30 bg-card">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                Export Project Data
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Download your project in various formats
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              data-testid="button-close-export"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Export Template Selector */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Export Template
              </label>
              <Select value={exportTemplate} onValueChange={(v) => setExportTemplate(v as ExportTemplateType)}>
                <SelectTrigger className="w-full" data-testid="select-template">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard" data-testid="template-standard">
                    <div className="flex items-center gap-2">
                      <FileBarChart className="w-4 h-4" />
                      <span>Standard Dashboard - Charts & Summary</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="boq" data-testid="template-boq">
                    <div className="flex items-center gap-2">
                      <Table2 className="w-4 h-4" />
                      <span>BOQ - Bill of Quantities</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="progress-report" data-testid="template-progress">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Progress Report - Full Details</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {exportTemplate === "standard" && "Dashboard view with charts and metrics"}
                {exportTemplate === "boq" && "Professional table showing all divisions, items, quantities, and costs"}
                {exportTemplate === "progress-report" && "Comprehensive report with client info, progress tracking, and timeline"}
              </p>
            </div>

            <Tabs value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="excel" className="gap-2" data-testid="tab-excel">
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </TabsTrigger>
                <TabsTrigger value="pdf" className="gap-2" data-testid="tab-pdf">
                  <FileText className="w-4 h-4" />
                  PDF
                </TabsTrigger>
                <TabsTrigger value="jpeg" className="gap-2" data-testid="tab-jpeg">
                  <ImageIcon className="w-4 h-4" />
                  JPEG
                </TabsTrigger>
              </TabsList>

              <TabsContent value="excel" className="mt-6">
                <Card className="p-6 border-border bg-muted/30">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-md bg-chart-5/20 border border-chart-5/50 flex items-center justify-center flex-shrink-0">
                      <FileSpreadsheet className="w-8 h-8 text-chart-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-foreground mb-2">
                        Excel Spreadsheet (.xlsx)
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Export all divisions, items, and summaries to an Excel file with multiple sheets. 
                        Includes all data fields, calculations, and priority information.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>✓ Complete division and item data</li>
                        <li>✓ Master summary with breakdowns</li>
                        <li>✓ Priority-based funds allocation</li>
                        <li>✓ Formatted for easy editing and sharing</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="pdf" className="mt-6">
                <Card className="p-6 border-border bg-muted/30">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-md bg-destructive/20 border border-destructive/50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-8 h-8 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-foreground mb-2">
                        PDF Document (.pdf)
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Generate a professional PDF report with {exportTemplate === "progress-report" ? "client information, progress tracking, and" : ""} 
                        {exportTemplate === "boq" ? "complete bill of quantities" : "charts and visual summaries"}.
                        Perfect for presentations and client reports.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>✓ Professional formatting</li>
                        <li>✓ {exportTemplate === "boq" ? "Detailed BOQ table" : "Includes all charts and graphs"}</li>
                        <li>✓ {exportTemplate === "progress-report" ? "Client info and timeline" : "Priority breakdown visuals"}</li>
                        <li>✓ Ready for printing and sharing</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="jpeg" className="mt-6">
                <Card className="p-6 border-border bg-muted/30">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-md bg-primary/20 border border-primary/50 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-foreground mb-2">
                        Image Export (.jpg)
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Export the {exportTemplate === "boq" ? "BOQ table" : exportTemplate === "progress-report" ? "progress report" : "dashboard view"} as a high-quality JPEG image.
                        Great for quick sharing via email or messaging apps.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>✓ {exportTemplate === "boq" ? "Professional BOQ table" : exportTemplate === "progress-report" ? "Full progress report" : "Dashboard snapshot with charts"}</li>
                        <li>✓ High resolution output (1920x1080)</li>
                        <li>✓ Easy to share digitally</li>
                        <li>✓ {exportTemplate === "progress-report" ? "Includes client information" : "Includes visual summaries"}</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Summary Info */}
            {summary && (
              <Card className="mt-6 p-4 border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Your export will include:
                    </p>
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {summary.totalDivisions} divisions • {summary.totalItems} items • 
                      Total: {summary.totalCost.toLocaleString('en-PK')} PKR
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border sticky bottom-0 bg-card">
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-export"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              data-testid="button-download"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : `Download ${exportFormat.toUpperCase()}`}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
