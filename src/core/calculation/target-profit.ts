import type {
  BasisPoints,
  Money,
  TargetProfit,
} from "../../domain/types";
import { applyBasisPoints } from "./math";

export function calculateTargetProfit(
  target: TargetProfit,
  context: {
    effectiveRevenue: Money;
    hpp: Money;
    orders: number;
  },
): Money | undefined {
  switch (target.mode) {
    case "NONE":
      return undefined;
    case "AMOUNT_PER_ORDER":
      return target.amount * context.orders;
    case "NET_MARGIN_PERCENT":
      return applyBasisPoints(context.effectiveRevenue, target.rateBps as BasisPoints);
    case "HPP_MARKUP_PERCENT":
      return applyBasisPoints(context.hpp, target.rateBps as BasisPoints);
  }
}
