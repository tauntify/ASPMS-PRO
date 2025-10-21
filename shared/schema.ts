import { z } from "zod";

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

export const divisionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Division name is required"),
  order: z.number(),
});

export const insertDivisionSchema = divisionSchema.omit({ id: true });
export type Division = z.infer<typeof divisionSchema>;
export type InsertDivision = z.infer<typeof insertDivisionSchema>;

export const itemSchema = z.object({
  id: z.string(),
  divisionId: z.string(),
  description: z.string().min(1, "Description is required"),
  unit: unitEnum,
  quantity: z.number().min(0, "Quantity must be positive"),
  rate: z.number().min(0, "Rate must be positive"),
  priority: priorityEnum,
});

export const insertItemSchema = itemSchema.omit({ id: true });
export type Item = z.infer<typeof itemSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;

export const updateDivisionSchema = divisionSchema.partial().required({ id: true });
export type UpdateDivision = z.infer<typeof updateDivisionSchema>;

export const updateItemSchema = itemSchema.partial().required({ id: true });
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
