/**
 * Unit Conversion Utilities for Architecture Lifecycle
 * Handles conversion between different area measurement units
 */

import { AreaUnit } from "./schema";

// Conversion factors to square meters (sqm) as canonical unit
const TO_SQM: Record<AreaUnit, number> = {
  sqm: 1,
  sqft: 0.092903, // 1 sqft = 0.092903 sqm
  kanal: 505.857, // 1 kanal = 505.857 sqm
  yard: 0.836127, // 1 yard = 0.836127 sqm
};

// Conversion factors from square meters
const FROM_SQM: Record<AreaUnit, number> = {
  sqm: 1,
  sqft: 10.7639, // 1 sqm = 10.7639 sqft
  kanal: 0.001977, // 1 sqm = 0.001977 kanal
  yard: 1.19599, // 1 sqm = 1.19599 yard
};

/**
 * Convert area value to canonical square meters
 */
export function toCanonicalSqm(value: number, unit: AreaUnit): number {
  return value * TO_SQM[unit];
}

/**
 * Convert from canonical square meters to target unit
 */
export function fromCanonicalSqm(sqmValue: number, targetUnit: AreaUnit): number {
  return sqmValue * FROM_SQM[targetUnit];
}

/**
 * Convert between any two area units
 */
export function convertArea(
  value: number,
  fromUnit: AreaUnit,
  toUnit: AreaUnit
): number {
  if (fromUnit === toUnit) return value;
  const sqm = toCanonicalSqm(value, fromUnit);
  return fromCanonicalSqm(sqm, toUnit);
}

/**
 * Format area value with unit
 */
export function formatArea(value: number, unit: AreaUnit, decimals: number = 2): string {
  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Calculate design fee based on fee model
 */
export function calculateDesignFee(
  feeModel: { type: string; value: number; unit?: AreaUnit },
  projectArea: number,
  projectAreaUnit: AreaUnit,
  constructionEstimate?: number
): number {
  switch (feeModel.type) {
    case "lumpSum":
      return feeModel.value;

    case "perUnit":
      if (!feeModel.unit) return 0;
      // Convert project area to fee model unit
      const areaInFeeUnit = convertArea(projectArea, projectAreaUnit, feeModel.unit);
      return feeModel.value * areaInFeeUnit;

    case "percentage":
      if (!constructionEstimate) return 0;
      return (constructionEstimate * feeModel.value) / 100;

    case "hybrid":
      // For hybrid, assume base lump sum + perUnit extras
      // This is a simplified calculation - can be extended
      return feeModel.value;

    default:
      return 0;
  }
}

/**
 * Calculate supervision fee
 */
export function calculateSupervisionFee(
  constructionEstimate: number,
  supervisionPercent: number
): number {
  return (constructionEstimate * supervisionPercent) / 100;
}

/**
 * Calculate total project financials
 */
export interface FinancialCalculation {
  boqTotal: number;
  laborTotal: number;
  procurementTotal: number;
  subcontractTotal: number;
  contingencyAmount: number;
  overheadAmount: number;
  constructionEstimate: number;
  designFee: number;
  supervisionFee: number;
  projectTotal: number;
}

export function calculateProjectFinancials(params: {
  boqTotal: number;
  laborTotal: number;
  procurementTotal: number;
  subcontractTotal: number;
  contingencyPercent: number;
  overheadPercent: number;
  feeModel?: { type: string; value: number; unit?: AreaUnit };
  projectArea?: number;
  projectAreaUnit?: AreaUnit;
  supervisionPercent?: number;
}): FinancialCalculation {
  const {
    boqTotal,
    laborTotal,
    procurementTotal,
    subcontractTotal,
    contingencyPercent,
    overheadPercent,
    feeModel,
    projectArea,
    projectAreaUnit,
    supervisionPercent,
  } = params;

  // Calculate base construction cost
  const baseConstructionCost =
    boqTotal + laborTotal + procurementTotal + subcontractTotal;

  // Calculate contingency and overhead
  const contingencyAmount = (baseConstructionCost * contingencyPercent) / 100;
  const overheadAmount = (baseConstructionCost * overheadPercent) / 100;

  // Total construction estimate
  const constructionEstimate =
    baseConstructionCost + contingencyAmount + overheadAmount;

  // Calculate design fee
  let designFee = 0;
  if (feeModel && projectArea && projectAreaUnit) {
    designFee = calculateDesignFee(
      feeModel,
      projectArea,
      projectAreaUnit,
      constructionEstimate
    );
  }

  // Calculate supervision fee
  let supervisionFee = 0;
  if (supervisionPercent && supervisionPercent > 0) {
    supervisionFee = calculateSupervisionFee(constructionEstimate, supervisionPercent);
  }

  // Total project cost
  const projectTotal = constructionEstimate + designFee + supervisionFee;

  return {
    boqTotal,
    laborTotal,
    procurementTotal,
    subcontractTotal,
    contingencyAmount,
    overheadAmount,
    constructionEstimate,
    designFee,
    supervisionFee,
    projectTotal,
  };
}
