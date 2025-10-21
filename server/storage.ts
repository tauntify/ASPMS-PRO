import {
  Division,
  InsertDivision,
  UpdateDivision,
  Item,
  InsertItem,
  UpdateItem,
  ProjectSummary,
  Priority,
} from "@shared/schema";
import { randomUUID } from "crypto";

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
  deleteItemsByDivision(divisionId: string): Promise<void>;

  // Summary
  getProjectSummary(): Promise<ProjectSummary>;
}

export class MemStorage implements IStorage {
  private divisions: Map<string, Division>;
  private items: Map<string, Item>;

  constructor() {
    this.divisions = new Map();
    this.items = new Map();
  }

  // Divisions
  async getDivisions(): Promise<Division[]> {
    return Array.from(this.divisions.values()).sort((a, b) => a.order - b.order);
  }

  async getDivision(id: string): Promise<Division | undefined> {
    return this.divisions.get(id);
  }

  async createDivision(insertDivision: InsertDivision): Promise<Division> {
    const id = randomUUID();
    const division: Division = { ...insertDivision, id };
    this.divisions.set(id, division);
    return division;
  }

  async updateDivision(updateDivision: UpdateDivision): Promise<Division | undefined> {
    const existing = this.divisions.get(updateDivision.id);
    if (!existing) return undefined;

    const updated: Division = { ...existing, ...updateDivision };
    this.divisions.set(updateDivision.id, updated);
    return updated;
  }

  async deleteDivision(id: string): Promise<boolean> {
    const exists = this.divisions.has(id);
    if (exists) {
      this.divisions.delete(id);
      await this.deleteItemsByDivision(id);
    }
    return exists;
  }

  // Items
  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: string): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async getItemsByDivision(divisionId: string): Promise<Item[]> {
    return Array.from(this.items.values()).filter(
      (item) => item.divisionId === divisionId
    );
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const id = randomUUID();
    const item: Item = { ...insertItem, id };
    this.items.set(id, item);
    return item;
  }

  async updateItem(updateItem: UpdateItem): Promise<Item | undefined> {
    const existing = this.items.get(updateItem.id);
    if (!existing) return undefined;

    const updated: Item = { ...existing, ...updateItem };
    this.items.set(updateItem.id, updated);
    return updated;
  }

  async deleteItem(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  async deleteItemsByDivision(divisionId: string): Promise<void> {
    const items = await this.getItemsByDivision(divisionId);
    items.forEach((item) => this.items.delete(item.id));
  }

  // Summary
  async getProjectSummary(): Promise<ProjectSummary> {
    const divisions = await this.getDivisions();
    const items = await this.getItems();

    const totalCost = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    
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

    items.forEach((item) => {
      const itemTotal = item.quantity * item.rate;
      priorityCosts[item.priority] += itemTotal;
      priorityCounts[item.priority]++;
    });

    const divisionBreakdown = divisions.map((division) => {
      const divisionItems = items.filter((item) => item.divisionId === division.id);
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
      totalItems: items.length,
      totalDivisions: divisions.length,
      divisionBreakdown,
      priorityBreakdown,
    };
  }
}

export const storage = new MemStorage();
