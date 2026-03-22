import { useMemo, useState } from "react";
import { InputPanel } from "./components/InputPanel";
import { OutputMatrix } from "./components/OutputMatrix";
import { calculateRiskSizing, calculateStandard } from "./lib/math";
import type { CalcMode, PositionDirection } from "./types";

export default function App() {
  const [mode, setMode] = useState<CalcMode>("CALCULATOR");
  const [direction, setDirection] = useState<PositionDirection>("LONG");
  const [marginAllocated, setMarginAllocated] = useState<number>(250);
  const [maxRiskUsd, setMaxRiskUsd] = useState<number>(100);
  const [leverage, setLeverage] = useState<number>(20);
  const [entryPrice, setEntryPrice] = useState<number>(50000);
  const [stopLoss, setStopLoss] = useState<number>(49000);
  const [takeProfit, setTakeProfit] = useState<number | undefined>(53000);

  const sanitizedLeverage = Math.max(leverage, 0);

  const result = useMemo(() => {
    if (mode === "CALCULATOR") {
      return calculateStandard({
        marginAllocated,
        leverage: sanitizedLeverage,
        entryPrice,
        stopLoss,
        takeProfit,
        direction,
      });
    }

    return calculateRiskSizing({
      maxRiskUsd,
      leverage: sanitizedLeverage,
      entryPrice,
      stopLoss,
      takeProfit,
      direction,
    });
  }, [
    direction,
    entryPrice,
    marginAllocated,
    maxRiskUsd,
    mode,
    sanitizedLeverage,
    stopLoss,
    takeProfit,
  ]);

  return (
    <main className="min-h-screen bg-[#0a0a0c] px-4 py-6 text-white md:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            The Liquidation Matrix
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Hyper-fast liquidation and risk-based sizing engine for leverage trading.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <InputPanel
            mode={mode}
            onModeChange={setMode}
            direction={direction}
            onDirectionChange={setDirection}
            marginAllocated={marginAllocated}
            onMarginAllocatedChange={setMarginAllocated}
            maxRiskUsd={maxRiskUsd}
            onMaxRiskUsdChange={setMaxRiskUsd}
            leverage={leverage}
            onLeverageChange={setLeverage}
            entryPrice={entryPrice}
            onEntryPriceChange={setEntryPrice}
            stopLoss={stopLoss}
            onStopLossChange={setStopLoss}
            takeProfit={takeProfit}
            onTakeProfitChange={setTakeProfit}
          />

          <OutputMatrix result={result} direction={direction} leverage={leverage} stopLoss={stopLoss} />
        </div>
      </div>
    </main>
  );
}
