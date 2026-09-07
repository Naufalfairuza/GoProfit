import type {
    PlanAdsInput,
    PlanAdsResult,
} from "@/domain/types";

export type ScenarioTargetProfitMode =
  | "NONE"
  | "AMOUNT_PER_ORDER"
  | "NET_MARGIN_PERCENT"
  | "HPP_MARKUP_PERCENT";

export interface ScenarioDraft {
  id: string;
  name: string;

  listPrice: number | null;
  hppPerUnit: number | null;

  adminFeeBps: number | null;
  processFee: number | null;
  packingCost: number | null;

  showDiscount: boolean;
  discount: number | null;

  showVoucher: boolean;
  voucher: number | null;

  targetMode: ScenarioTargetProfitMode;
  targetAmount: number | null;
  targetRateBps: number | null;
}

export interface ScenarioItem {
  draft: ScenarioDraft;

  input: PlanAdsInput;
  result: PlanAdsResult;

  dirty: boolean;
  error: string | null;
}