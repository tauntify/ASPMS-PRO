import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDivisionSchema, insertItemSchema, updateDivisionSchema, updateItemSchema } from "@shared/schema";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";

export async function registerRoutes(app: Express): Promise<Server> {
  // Division routes
  app.get("/api/divisions", async (_req, res) => {
    try {
      const divisions = await storage.getDivisions();
      res.json(divisions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch divisions" });
    }
  });

  app.post("/api/divisions", async (req, res) => {
    try {
      const parsed = insertDivisionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid division data", details: parsed.error });
      }

      const division = await storage.createDivision(parsed.data);
      res.status(201).json(division);
    } catch (error) {
      res.status(500).json({ error: "Failed to create division" });
    }
  });

  app.patch("/api/divisions/:id", async (req, res) => {
    try {
      const parsed = updateDivisionSchema.safeParse({ ...req.body, id: req.params.id });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid division data", details: parsed.error });
      }

      const division = await storage.updateDivision(parsed.data);
      if (!division) {
        return res.status(404).json({ error: "Division not found" });
      }

      res.json(division);
    } catch (error) {
      res.status(500).json({ error: "Failed to update division" });
    }
  });

  app.delete("/api/divisions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDivision(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Division not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete division" });
    }
  });

  // Item routes
  app.get("/api/items", async (_req, res) => {
    try {
      const items = await storage.getItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      const parsed = insertItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid item data", details: parsed.error });
      }

      const item = await storage.createItem(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create item" });
    }
  });

  app.patch("/api/items/:id", async (req, res) => {
    try {
      const parsed = updateItemSchema.safeParse({ ...req.body, id: req.params.id });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid item data", details: parsed.error });
      }

      const item = await storage.updateItem(parsed.data);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Summary route
  app.get("/api/summary", async (_req, res) => {
    try {
      const summary = await storage.getProjectSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch summary" });
    }
  });

  // Export routes
  app.post("/api/export/excel", async (req, res) => {
    try {
      const { divisions, items, summary } = req.body;

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "ARKA SERVICES PROJECT MANAGEMENT";
      workbook.created = new Date();

      // Summary Sheet
      const summarySheet = workbook.addWorksheet("Summary");
      summarySheet.columns = [
        { header: "Metric", key: "metric", width: 30 },
        { header: "Value", key: "value", width: 20 },
      ];

      summarySheet.addRows([
        { metric: "Total Project Cost (PKR)", value: summary.totalCost },
        { metric: "High Priority Cost (PKR)", value: summary.highPriorityCost },
        { metric: "Mid Priority Cost (PKR)", value: summary.midPriorityCost },
        { metric: "Low Priority Cost (PKR)", value: summary.lowPriorityCost },
        { metric: "Total Items", value: summary.totalItems },
        { metric: "Total Divisions", value: summary.totalDivisions },
      ]);

      summarySheet.getRow(1).font = { bold: true };

      // Divisions Sheet
      const divisionsSheet = workbook.addWorksheet("Divisions");
      divisionsSheet.columns = [
        { header: "Division Name", key: "name", width: 30 },
        { header: "Items", key: "items", width: 10 },
        { header: "Total Cost (PKR)", key: "cost", width: 20 },
      ];

      summary.divisionBreakdown.forEach((div: any) => {
        divisionsSheet.addRow({
          name: div.divisionName,
          items: div.itemCount,
          cost: div.totalCost,
        });
      });

      divisionsSheet.getRow(1).font = { bold: true };

      // Items Sheet
      const itemsSheet = workbook.addWorksheet("Items");
      itemsSheet.columns = [
        { header: "Division", key: "division", width: 20 },
        { header: "Description", key: "description", width: 35 },
        { header: "Unit", key: "unit", width: 15 },
        { header: "Quantity", key: "quantity", width: 12 },
        { header: "Rate (PKR)", key: "rate", width: 15 },
        { header: "Total (PKR)", key: "total", width: 15 },
        { header: "Priority", key: "priority", width: 12 },
      ];

      items.forEach((item: any) => {
        const division = divisions.find((d: any) => d.id === item.divisionId);
        itemsSheet.addRow({
          division: division?.name || "",
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          rate: item.rate,
          total: item.quantity * item.rate,
          priority: item.priority,
        });
      });

      itemsSheet.getRow(1).font = { bold: true };

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=arka-project.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Excel export error:", error);
      res.status(500).json({ error: "Failed to export to Excel" });
    }
  });

  app.post("/api/export/pdf", async (req, res) => {
    try {
      const { divisions, items, summary } = req.body;

      const doc = new jsPDF();
      let yPos = 20;

      doc.setFontSize(20);
      doc.text("ARKA SERVICES PROJECT MANAGEMENT", 105, yPos, { align: "center" });
      yPos += 15;

      doc.setFontSize(12);
      doc.text("Master Project Summary", 105, yPos, { align: "center" });
      yPos += 15;

      doc.setFontSize(10);
      doc.text(`Total Project Cost: ${summary.totalCost.toLocaleString('en-PK')} PKR`, 20, yPos);
      yPos += 8;
      doc.text(`High Priority Cost: ${summary.highPriorityCost.toLocaleString('en-PK')} PKR`, 20, yPos);
      yPos += 8;
      doc.text(`Mid Priority Cost: ${summary.midPriorityCost.toLocaleString('en-PK')} PKR`, 20, yPos);
      yPos += 8;
      doc.text(`Low Priority Cost: ${summary.lowPriorityCost.toLocaleString('en-PK')} PKR`, 20, yPos);
      yPos += 8;
      doc.text(`Total Items: ${summary.totalItems}`, 20, yPos);
      yPos += 8;
      doc.text(`Total Divisions: ${summary.totalDivisions}`, 20, yPos);
      yPos += 15;

      doc.setFontSize(14);
      doc.text("Division Breakdown", 20, yPos);
      yPos += 10;

      doc.setFontSize(9);
      summary.divisionBreakdown.forEach((div: any) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${div.divisionName}: ${div.itemCount} items, ${div.totalCost.toLocaleString('en-PK')} PKR`, 20, yPos);
        yPos += 7;
      });

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=arka-project.pdf");
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF export error:", error);
      res.status(500).json({ error: "Failed to export to PDF" });
    }
  });

  app.post("/api/export/jpeg", async (req, res) => {
    try {
      res.status(501).json({ 
        error: "JPEG export requires client-side rendering. Please use the download button in the UI." 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to export to JPEG" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
