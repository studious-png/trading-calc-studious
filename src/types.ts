export type PositionDirection = "LONG" | "SHORT";
export type CalcMode = "CALCULATOR" | "RISK_SIZING";

export interface CalculatorInputs {
  marginAllocated: number;
  leverage: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit?: number;
  direction: PositionDirection;
}

export interface RiskSizingInputs {
  maxRiskUsd: number;
  leverage: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit?: number;
  direction: PositionDirection;
}

export interface CalculationResult {
  isValid: boolean;
  error?: string;
  mode: CalcMode;
  notionalSizeUsd: number;
  positionSizeBase: number;
  marginRequiredUsd: number;
  estimatedLiquidationPriceSimple: number;
  lossAtStopUsd: number;
  feesUsd: number;
  profitAtTargetUsd: number | null;
  riskRewardRatio: number | null;
}
