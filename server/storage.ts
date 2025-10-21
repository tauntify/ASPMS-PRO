import {
  Division,
  InsertDivision,
  UpdateDivision,
  Item,
  InsertItem,
  UpdateItem,
  ProjectSummary,
  Priority,
  divisions,
  items,
} from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  // Divisions
  getDivisions(): Promise<Division[]>;
  getDivision(id: string): Promise<Division | undefined>;
  createDivision(division: InsertDivision): Promise<Division>;
  updateDivision(division: UpdateDivision): Promise<Division | undefined>;
  deleteDivision(id: string): Promise<boolean>;

  // Items
  getItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  getItemsByDivision(divisionId: string): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(item: UpdateItem): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;

  // Summary
  getProjectSummary(): Promise<ProjectSummary>;
}

export class DatabaseStorage implements IStorage {
  // Divisions
  async getDivisions(): Promise<Division[]> {
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
  async getItems(): Promise<Item[]> {
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
  async getProjectSummary(): Promise<ProjectSummary> {
    const allDivisions = await this.getDivisions();
    const allItems = await this.getItems();

    const totalCost = allItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    
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

    allItems.forEach((item) => {
      const itemTotal = item.quantity * item.rate;
      priorityCosts[item.priority as Priority] += itemTotal;
      priorityCounts[item.priority as Priority]++;
    });

    const divisionBreakdown = allDivisions.map((division) => {
      const divisionItems = allItems.filter((item) => item.divisionId === division.id);
      const totalCost = divisionItems.reduce(
        (sum, item) => sum + item.quantity * item.rate,
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

    return {
      totalCost,
      highPriorityCost: priorityCosts.High,
      midPriorityCost: priorityCosts.Mid,
      lowPriorityCost: priorityCosts.Low,
      totalItems: allItems.length,
      totalDivisions: allDivisions.length,
      divisionBreakdown,
      priorityBreakdown,
    };
  }
}

export const storage = new DatabaseStorage();
