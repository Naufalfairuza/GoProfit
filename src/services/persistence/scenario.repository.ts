import type { CheckAdsResult, PlanAdsInput, PlanAdsResult } from "../../domain/types";

export interface SavedCalculation {
  id: string;
  name: string;
  notes?: string;
  kind: "PLAN" | "CHECK";
  planInput: PlanAdsInput;
  planResult?: PlanAdsResult;
  checkResult?: CheckAdsResult;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioRepository {
  list(): Promise<SavedCalculation[]>;
  get(id: string): Promise<SavedCalculation | null>;
  save(value: SavedCalculation): Promise<void>;
  delete(id: string): Promise<void>;
}
