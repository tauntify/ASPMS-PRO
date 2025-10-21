import { pgTable, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const priorityLevels = ["High", "Mid", "Low"] as const;
export const priorityEnum = z.enum(priorityLevels);
export type Priority = z.infer<typeof priorityEnum>;

export const unitTypes = [
  "number",
  "rft",
  "sft",
  "meter",
  "meter square",
  "gallons",
  "drums",
  "coils",
  "length",
] as const;
export const unitEnum = z.enum(unitTypes);
export type Unit = z.infer<typeof unitEnum>;

// Database Tables
export const divisions = pgTable("divisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  divisionId: varchar("division_id").notNull().references(() => divisions.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  unit: text("unit").notNull(),
  quantity: real("quantity").notNull(),
  rate: real("rate").notNull(),
  priority: text("priority").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod Schemas
export const insertDivisionSchema = createInsertSchema(divisions).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Division name is required"),
  order: z.number(),
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
}).extend({
  divisionId: z.string(),
  description: z.string().min(1, "Description is required"),
  unit: unitEnum,
  quantity: z.number().min(0, "Quantity must be positive"),
  rate: z.number().min(0, "Rate must be positive"),
  priority: priorityEnum,
});

export const updateDivisionSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  order: z.number().optional(),
});

export const updateItemSchema = z.object({
  id: z.string(),
  divisionId: z.string().optional(),
  description: z.string().min(1).optional(),
  unit: unitEnum.optional(),
  quantity: z.number().min(0).optional(),
  rate: z.number().min(0).optional(),
  priority: priorityEnum.optional(),
});

// Types
export type Division = typeof divisions.$inferSelect;
export type InsertDivision = z.infer<typeof insertDivisionSchema>;
export type UpdateDivision = z.infer<typeof updateDivisionSchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type UpdateItem = z.infer<typeof updateItemSchema>;

export interface DivisionWithItems extends Division {
  items: Item[];
}

export interface ProjectSummary {
  totalCost: number;
  highPriorityCost: number;
  midPriorityCost: number;
  lowPriorityCost: number;
  totalItems: number;
  totalDivisions: number;
  divisionBreakdown: {
    divisionId: string;
    divisionName: string;
    totalCost: number;
    itemCount: number;
  }[];
  priorityBreakdown: {
    priority: Priority;
    cost: number;
    itemCount: number;
  }[];
}
