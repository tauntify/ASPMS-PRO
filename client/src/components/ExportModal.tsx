import { useState } from "react";
import { Division, Item, ProjectSummary } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Download, FileSpreadsheet, FileText, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportModalProps {
  onClose: () => void;
  divisions: Division[];
  items: Item[];
  summary: ProjectSummary | undefined;
}

export function ExportModal({ onClose, divisions, items, summary }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf" | "jpeg">("excel");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (exportFormat === "jpeg") {
        const html2canvas = (await import("html2canvas")).default;
        const dashboardElement = document.getElementById("root");
        
        if (!dashboardElement) {
          throw new Error("Dashboard element not found");
        }

        const canvas = await html2canvas(dashboardElement, {
          backgroundColor: "#0d1117",
          scale: 2,
        });

        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error("Failed to create image");
          }

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `arka-project-${new Date().toISOString().split('T')[0]}.jpg`;
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
      
      const extension = exportFormat === "excel" ? "xlsx" : "pdf";
      a.download = `arka-project-${new Date().toISOString().split('T')[0]}.${extension}`;
      
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden border-primary/30 bg-card">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
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
                      Generate a professional PDF report with all project data, charts, and visual summaries.
                      Perfect for presentations and client reports.
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ Professional formatting</li>
                      <li>✓ Includes all charts and graphs</li>
                      <li>✓ Priority breakdown visuals</li>
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
                      Export the current dashboard view as a high-quality JPEG image.
                      Great for quick sharing via email or messaging apps.
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ Dashboard snapshot with charts</li>
                      <li>✓ High resolution output</li>
                      <li>✓ Easy to share digitally</li>
                      <li>✓ Includes visual summaries</li>
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
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
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
  );
}
