import type {
  CostCalculationResult,
  QuantityContext,
  ScenarioCost,
} from "../../domain/types";
import { scopeMultiplier } from "./math";

export function calculateCosts(
  costs: ScenarioCost[],
  quantities: QuantityContext,
): CostCalculationResult {
  const items = costs.map((cost) => ({
    costId: cost.id,
    name: cost.name,
    amount: cost.amount * scopeMultiplier(cost.scope, quantities),
    scope: cost.scope,
  }));

  return {
    items,
    total: items.reduce((sum, item) => sum + item.amount, 0),
  };
}
