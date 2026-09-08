import type { Money } from "@/domain/types";

export interface ShopeeValidationData {
  actualGmv: Money;
  actualHpp: Money;
  actualMarketplaceFees: Money;
  actualOperationalCosts: Money;
  actualAdvertisingCost: Money;
  actualRefunds: Money;
}

export interface ShopeeValidationComparison {
  actualProfit: Money;
  estimatedProfit: Money;
  difference: Money;
  actualMarginBps?: number;
}

export function calculateShopeeValidation(
  data: ShopeeValidationData,
  estimatedProfit: Money,
): ShopeeValidationComparison {
  const actualProfit =
    data.actualGmv -
    data.actualHpp -
    data.actualMarketplaceFees -
    data.actualOperationalCosts -
    data.actualAdvertisingCost -
    data.actualRefunds;

  return {
    actualProfit,
    estimatedProfit,
    difference: actualProfit - estimatedProfit,
    actualMarginBps:
      data.actualGmv > 0
        ? Math.round((actualProfit / data.actualGmv) * 10_000)
        : undefined,
  };
}
