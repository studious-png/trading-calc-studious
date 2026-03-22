import type {
  CalculationResult,
  CalculatorInputs,
  PositionDirection,
  RiskSizingInputs,
} from "../types";

const TAKER_FEE_RATE = 0.0006;
const ROUND_TRIP_FEE_RATE = TAKER_FEE_RATE * 2;
const MAINTENANCE_MARGIN_RATE = 0.005;
const MIN_DISTANCE = 0.0001;

interface SharedInputs {
  leverage: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit?: number;
  direction: PositionDirection;
}

function emptyResult(mode: CalculationResult["mode"]): CalculationResult {
  return {
    isValid: false,
    mode,
    notionalSizeUsd: 0,
    positionSizeBase: 0,
    marginRequiredUsd: 0,
    estimatedLiquidationPriceSimple: 0,
    lossAtStopUsd: 0,
    feesUsd: 0,
    profitAtTargetUsd: null,
    riskRewardRatio: null,
  };
}

export function validateInputs(inputs: SharedInputs): string | null {
  const { leverage, entryPrice, stopLoss, direction } = inputs;

  if (!Number.isFinite(leverage) || leverage <= 0) {
    return "Leverage must be greater than 0.";
  }

  if (!Number.isFinite(entryPrice) || entryPrice <= 0) {
    return "Entry price must be greater than 0.";
  }

  if (!Number.isFinite(stopLoss) || stopLoss <= 0) {
    return "Stop loss must be greater than 0.";
  }

  if (direction === "LONG" && stopLoss >= entryPrice) {
    return "For LONG positions, stop loss must be below entry.";
  }

  if (direction === "SHORT" && stopLoss <= entryPrice) {
    return "For SHORT positions, stop loss must be above entry.";
  }

  return null;
}

function getStopDistance(entryPrice: number, stopLoss: number): number {
  return Math.max(Math.abs(entryPrice - stopLoss) / entryPrice, MIN_DISTANCE);
}

function getSimpleLiquidationPrice(
  entryPrice: number,
  leverage: number,
  direction: PositionDirection,
): number {
  if (direction === "LONG") {
    return entryPrice * (1 - 1 / leverage + MAINTENANCE_MARGIN_RATE);
  }
  return entryPrice * (1 + 1 / leverage - MAINTENANCE_MARGIN_RATE);
}

function computeTargetPnl(
  direction: PositionDirection,
  entryPrice: number,
  takeProfit: number | undefined,
  notionalSizeUsd: number,
): number | null {
  if (!takeProfit || takeProfit <= 0) {
    return null;
  }

  const targetMoveRatio =
    direction === "LONG"
      ? (takeProfit - entryPrice) / entryPrice
      : (entryPrice - takeProfit) / entryPrice;

  return notionalSizeUsd * targetMoveRatio - notionalSizeUsd * ROUND_TRIP_FEE_RATE;
}

function finalizeResult(
  mode: CalculationResult["mode"],
  shared: SharedInputs,
  notionalSizeUsd: number,
): CalculationResult {
  const stopDistance = getStopDistance(shared.entryPrice, shared.stopLoss);
  const positionSizeBase = notionalSizeUsd / shared.entryPrice;
  const marginRequiredUsd = notionalSizeUsd / shared.leverage;
  const feesUsd = notionalSizeUsd * ROUND_TRIP_FEE_RATE;
  const lossAtStopUsd = notionalSizeUsd * stopDistance + feesUsd;
  const profitAtTargetUsd = computeTargetPnl(
    shared.direction,
    shared.entryPrice,
    shared.takeProfit,
    notionalSizeUsd,
  );

  return {
    isValid: true,
    mode,
    notionalSizeUsd,
    positionSizeBase,
    marginRequiredUsd,
    estimatedLiquidationPriceSimple: getSimpleLiquidationPrice(
      shared.entryPrice,
      shared.leverage,
      shared.direction,
    ),
    lossAtStopUsd,
    feesUsd,
    profitAtTargetUsd,
    riskRewardRatio:
      profitAtTargetUsd === null || lossAtStopUsd <= 0
        ? null
        : profitAtTargetUsd / lossAtStopUsd,
  };
}

export function calculateStandard(inputs: CalculatorInputs): CalculationResult {
  const result = emptyResult("CALCULATOR");
  const validationError = validateInputs(inputs);

  if (validationError) {
    return { ...result, error: validationError };
  }

  if (!Number.isFinite(inputs.marginAllocated) || inputs.marginAllocated <= 0) {
    return { ...result, error: "Margin allocated must be greater than 0." };
  }

  const notionalSizeUsd = inputs.marginAllocated * inputs.leverage;
  return finalizeResult("CALCULATOR", inputs, notionalSizeUsd);
}

export function calculateRiskSizing(inputs: RiskSizingInputs): CalculationResult {
  const result = emptyResult("RISK_SIZING");
  const validationError = validateInputs(inputs);

  if (validationError) {
    return { ...result, error: validationError };
  }

  if (!Number.isFinite(inputs.maxRiskUsd) || inputs.maxRiskUsd <= 0) {
    return { ...result, error: "Max risk ($) must be greater than 0." };
  }

  const stopDistance = getStopDistance(inputs.entryPrice, inputs.stopLoss);
  const notionalSizeUsd = inputs.maxRiskUsd / (stopDistance + ROUND_TRIP_FEE_RATE);

  return finalizeResult("RISK_SIZING", inputs, notionalSizeUsd);
}
