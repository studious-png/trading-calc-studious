import { AlertTriangle, Skull } from "lucide-react";
import { formatPrice, formatRatio, formatUsd } from "../lib/format";
import type { CalculationResult, PositionDirection } from "../types";

interface OutputMatrixProps {
  result: CalculationResult;
  direction: PositionDirection;
  leverage: number;
  stopLoss: number;
}

function rrColor(riskRewardRatio: number | null): string {
  if (riskRewardRatio === null) {
    return "text-zinc-400";
  }
  if (riskRewardRatio < 1) {
    return "text-[#ff2a2a]";
  }
  if (riskRewardRatio <= 2) {
    return "text-[#facc15]";
  }
  return "text-[#00ff88]";
}

export function OutputMatrix({ result, direction, leverage, stopLoss }: OutputMatrixProps) {
  const shouldWarnLiquidation =
    result.isValid &&
    ((direction === "LONG" && stopLoss <= result.estimatedLiquidationPriceSimple) ||
      (direction === "SHORT" && stopLoss >= result.estimatedLiquidationPriceSimple));

  return (
    <section className="rounded-2xl border border-zinc-800 bg-[#16161a] p-4 shadow-[0_0_20px_rgba(0,0,0,0.35)] md:p-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">The Liquidation Matrix</h2>
          <p className="mt-1 text-sm text-zinc-400">Risk diagnostics and liquidation proximity.</p>
        </div>
        {leverage > 50 ? (
          <div className="inline-flex items-center gap-2 rounded-lg border border-[#ff2a2a]/60 bg-[#ff2a2a]/10 px-3 py-2 text-sm font-semibold text-[#ff2a2a]">
            <Skull size={16} />
            <span>Leverage Over 50x</span>
          </div>
        ) : null}
      </header>

      {!result.isValid && result.error ? (
        <div className="mb-5 rounded-xl border border-[#facc15]/60 bg-[#facc15]/10 px-4 py-3 text-sm text-[#facc15]">
          {result.error}
        </div>
      ) : null}

      {shouldWarnLiquidation ? (
        <div className="mb-5 animate-pulse rounded-xl border border-[#ff2a2a] bg-[#ff2a2a]/20 px-4 py-3 text-sm font-bold tracking-wide text-[#ff2a2a]">
          LIQUIDATION TRIGGERS BEFORE STOP LOSS
        </div>
      ) : null}

      <div className={`${!result.isValid ? "pointer-events-none blur-[2px] opacity-60" : ""}`}>
        <div className="mb-5 rounded-xl border border-[#ff2a2a]/40 bg-[#ff2a2a]/10 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-300">The Death Zone</div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-[#ff2a2a]">
            {formatPrice(result.estimatedLiquidationPriceSimple)}
          </div>
          <p className="mt-1 text-xs text-zinc-400">Simplified model. May vary by exchange.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-[#0a0a0c] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Damage Report</div>
            <div className="mt-1 text-xl font-semibold text-[#ff2a2a]">{formatUsd(result.lossAtStopUsd)}</div>
            <div className="text-xs text-zinc-500">Includes est. fees</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#0a0a0c] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Estimated Fees</div>
            <div className="mt-1 text-xl font-semibold text-zinc-100">{formatUsd(result.feesUsd)}</div>
            <div className="text-xs text-zinc-500">Round-trip taker estimate</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#0a0a0c] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Notional Size</div>
            <div className="mt-1 text-xl font-semibold text-zinc-100">
              {formatUsd(result.notionalSizeUsd)}
            </div>
            <div className="text-xs text-zinc-500">{formatPrice(result.positionSizeBase)} base units</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#0a0a0c] p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Margin Required</div>
            <div className="mt-1 text-xl font-semibold text-zinc-100">
              {formatUsd(result.marginRequiredUsd)}
            </div>
            <div className="text-xs text-zinc-500">{result.mode === "RISK_SIZING" ? "Risk-sized" : "Manual sized"}</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-[#0a0a0c] p-4 sm:col-span-2">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Target Projection</div>
            <div className="mt-1 flex items-end justify-between gap-3">
              <div className="text-xl font-semibold text-[#00ff88]">
                {result.profitAtTargetUsd === null ? "N/A" : formatUsd(result.profitAtTargetUsd)}
              </div>
              <div className={`text-lg font-bold ${rrColor(result.riskRewardRatio)}`}>
                {result.riskRewardRatio === null ? "R:R N/A" : `R:R ${formatRatio(result.riskRewardRatio)}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
        <AlertTriangle size={14} />
        <span>High leverage and tight stops materially increase liquidation risk.</span>
      </div>
    </section>
  );
}
