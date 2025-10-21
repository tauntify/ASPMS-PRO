import {
  Project,
  InsertProject,
  UpdateProject,
  Division,
  InsertDivision,
  UpdateDivision,
  Item,
  InsertItem,
  UpdateItem,
  ProjectSummary,
  Priority,
  ItemStatus,
  projects,
  divisions,
  items,
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, inArray } from "drizzle-orm";

const STATUS_WEIGHTS: Record<ItemStatus, number> = {
  "Not Started": 0,
  "Purchased": 25,
  "In Installation Phase": 50,
  "Installed": 75,
  "Delivered": 100,
};

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(project: UpdateProject): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Divisions
  getDivisions(projectId?: string): Promise<Division[]>;
  getDivision(id: string): Promise<Division | undefined>;
  createDivision(division: InsertDivision): Promise<Division>;
  updateDivision(division: UpdateDivision): Promise<Division | undefined>;
  deleteDivision(id: string): Promise<boolean>;

  // Items
  getItems(projectId?: string): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  getItemsByDivision(divisionId: string): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(item: UpdateItem): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;

  // Summary
  getProjectSummary(projectId?: string): Promise<ProjectSummary>;
}

export class DatabaseStorage implements IStorage {
  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(asc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(insertProject).returning();
    return result[0];
  }

  async updateProject(updateProject: UpdateProject): Promise<Project | undefined> {
    const { id, ...updates } = updateProject;
    const result = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  // Divisions
  async getDivisions(projectId?: string): Promise<Division[]> {
    if (projectId) {
      return await db
        .select()
        .from(divisions)
        .where(eq(divisions.projectId, projectId))
        .orderBy(asc(divisions.order));
    }
    return await db.select().from(divisions).orderBy(asc(divisions.order));
  }

  async getDivision(id: string): Promise<Division | undefined> {
    const result = await db.select().from(divisions).where(eq(divisions.id, id));
    return result[0];
  }

  async createDivision(insertDivision: InsertDivision): Promise<Division> {
    const result = await db.insert(divisions).values(insertDivision).returning();
    return result[0];
  }

  async updateDivision(updateDivision: UpdateDivision): Promise<Division | undefined> {
    const { id, ...updates } = updateDivision;
    const result = await db
      .update(divisions)
      .set(updates)
      .where(eq(divisions.id, id))
      .returning();
    return result[0];
  }

  async deleteDivision(id: string): Promise<boolean> {
    const result = await db.delete(divisions).where(eq(divisions.id, id)).returning();
    return result.length > 0;
  }

  // Items
  async getItems(projectId?: string): Promise<Item[]> {
    if (projectId) {
      const projectDivisions = await this.getDivisions(projectId);
      const divisionIds = projectDivisions.map(d => d.id);
      if (divisionIds.length === 0) return [];
      return await db.select().from(items).where(inArray(items.divisionId, divisionIds));
    }
    return await db.select().from(items);
  }

  async getItem(id: string): Promise<Item | undefined> {
    const result = await db.select().from(items).where(eq(items.id, id));
    return result[0];
  }

  async getItemsByDivision(divisionId: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.divisionId, divisionId));
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const result = await db.insert(items).values(insertItem).returning();
    return result[0];
  }

  async updateItem(updateItem: UpdateItem): Promise<Item | undefined> {
    const { id, ...updates } = updateItem;
    const result = await db
      .update(items)
      .set(updates)
      .where(eq(items.id, id))
      .returning();
    return result[0];
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id)).returning();
    return result.length > 0;
  }

  // Summary
  async getProjectSummary(projectId?: string): Promise<ProjectSummary> {
    const allDivisions = await this.getDivisions(projectId);
    const allItems = await this.getItems(projectId);

    const totalCost = allItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.rate), 0);
    
    const priorityCosts = {
      High: 0,
      Mid: 0,
      Low: 0,
    };

    const priorityCounts = {
      High: 0,
      Mid: 0,
      Low: 0,
    };

    const statusCosts: Record<ItemStatus, number> = {
      "Not Started": 0,
      "Purchased": 0,
      "In Installation Phase": 0,
      "Installed": 0,
      "Delivered": 0,
    };

    const statusCounts: Record<ItemStatus, number> = {
      "Not Started": 0,
      "Purchased": 0,
      "In Installation Phase": 0,
      "Installed": 0,
      "Delivered": 0,
    };

    let totalProgress = 0;

    allItems.forEach((item) => {
      const itemTotal = Number(item.quantity) * Number(item.rate);
      priorityCosts[item.priority as Priority] += itemTotal;
      priorityCounts[item.priority as Priority]++;

      const itemStatus = item.status as ItemStatus;
      statusCosts[itemStatus] += itemTotal;
      statusCounts[itemStatus]++;
      totalProgress += STATUS_WEIGHTS[itemStatus];
    });

    const overallProgress = allItems.length > 0 ? totalProgress / allItems.length : 0;

    const divisionBreakdown = allDivisions.map((division) => {
      const divisionItems = allItems.filter((item) => item.divisionId === division.id);
      const totalCost = divisionItems.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.rate),
        0
      );

      return {
        divisionId: division.id,
        divisionName: division.name,
        totalCost,
        itemCount: divisionItems.length,
      };
    });

    const priorityBreakdown: { priority: Priority; cost: number; itemCount: number }[] = [
      { priority: "High", cost: priorityCosts.High, itemCount: priorityCounts.High },
      { priority: "Mid", cost: priorityCosts.Mid, itemCount: priorityCounts.Mid },
      { priority: "Low", cost: priorityCosts.Low, itemCount: priorityCounts.Low },
    ];

    const statusBreakdown: { status: ItemStatus; itemCount: number; cost: number }[] = [
      { status: "Not Started", itemCount: statusCounts["Not Started"], cost: statusCosts["Not Started"] },
      { status: "Purchased", itemCount: statusCounts["Purchased"], cost: statusCosts["Purchased"] },
      { status: "In Installation Phase", itemCount: statusCounts["In Installation Phase"], cost: statusCosts["In Installation Phase"] },
      { status: "Installed", itemCount: statusCounts["Installed"], cost: statusCosts["Installed"] },
      { status: "Delivered", itemCount: statusCounts["Delivered"], cost: statusCosts["Delivered"] },
    ];

    return {
      totalCost,
      highPriorityCost: priorityCosts.High,
      midPriorityCost: priorityCosts.Mid,
      lowPriorityCost: priorityCosts.Low,
      totalItems: allItems.length,
      totalDivisions: allDivisions.length,
      overallProgress,
      divisionBreakdown,
      priorityBreakdown,
      statusBreakdown,
    };
  }
}

export const storage = new DatabaseStorage();
