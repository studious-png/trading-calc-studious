"use client";
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Target, AlertTriangle } from 'lucide-react';

export default function PositionCalculator() {
  const [side, setSide] = useState<'Long' | 'Short'>('Long');
  const [accountSize, setAccountSize] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [entryPrice, setEntryPrice] = useState(100);
  const [stopLoss, setStopLoss] = useState(95);
  const [leverage, setLeverage] = useState(1);
  const [tpTargets, setTpTargets] = useState<{ price: number }[]>([]);

  // Calculations
  const riskAmount = accountSize * (riskPercent / 100);
  const priceRisk = Math.abs(entryPrice - stopLoss);
  const positionUnits = priceRisk > 0 ? riskAmount / priceRisk : 0;
  const positionSizeDollars = positionUnits * entryPrice;
  const marginRequired = positionSizeDollars / leverage;

  const addTarget = () => {
    const multiplier = side === 'Long' ? 2 : -2;
    const newPrice = entryPrice + (priceRisk * multiplier);
    setTpTargets([...tpTargets, { price: newPrice }]);
  };

  const removeTarget = (index: number) => {
    setTpTargets(tpTargets.filter((_, i) => i !== index));
  };

  const updateTarget = (index: number, value: string) => {
    const newTargets = [...tpTargets];
    newTargets[index].price = parseFloat(value) || 0;
    setTpTargets(newTargets);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center mb-8">Position Calculator</h1>

        {/* Long/Short Toggle */}
        <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setSide('Long')}
            className={`flex-1 py-2 rounded-lg transition-all ${side === 'Long' ? 'bg-[#22c55e] text-white' : 'text-gray-400'}`}
          >
            Long
          </button>
          <button 
            onClick={() => setSide('Short')}
            className={`flex-1 py-2 rounded-lg transition-all ${side === 'Short' ? 'bg-[#ef4444] text-white' : 'text-gray-400'}`}
          >
            Short
          </button>
        </div>

        {/* Input Grid */}
        <div className="space-y-4 bg-[#141414] p-6 rounded-2xl border border-white/5">
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">Account Size ($)</label>
            <input type="number" value={accountSize} onChange={(e) => setAccountSize(Number(e.target.value))} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">Entry Price</label>
              <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(Number(e.target.value))} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 mb-1 block">Stop Loss</label>
              <input type="number" value={stopLoss} onChange={(e) => setStopLoss(Number(e.target.value))} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Potential Loss Card */}
        <div className={`p-4 rounded-xl border ${side === 'Long' ? 'bg-red-500/10 border-red-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
          <div className="flex justify-between items-center">
            <span className="text-red-400 font-medium">Potential Loss</span>
            <span className="text-xl font-bold">${riskAmount.toLocaleString()}</span>
          </div>
          <div className="text-[10px] text-red-400/60 mt-1 uppercase text-right">Calculated Risk</div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#141414] p-4 rounded-xl border border-white/5">
            <div className="text-xs text-gray-500 uppercase mb-1">Position Size ($)</div>
            <div className="text-xl font-bold">${positionSizeDollars.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
          </div>
          <div className="bg-[#141414] p-4 rounded-xl border border-white/5">
            <div className="text-xs text-gray-500 uppercase mb-1">Margin ({leverage}x)</div>
            <div className="text-xl font-bold">${marginRequired.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
          </div>
        </div>

        {/* TP Targets */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Take Profit Targets</h2>
            <button onClick={addTarget} className="text-xs text-emerald-400 flex items-center gap-1 hover:text-emerald-300 transition-colors">
              <Plus size={14}/> Add Target
            </button>
          </div>

          {tpTargets.map((tp, index) => {
            const profit = side === 'Long' ? (tp.price - entryPrice) * positionUnits : (entryPrice - tp.price) * positionUnits;
            const rr = priceRisk > 0 ? (Math.abs(tp.price - entryPrice) / priceRisk).toFixed(2) : "0";
            
            return (
              <div key={index} className="bg-[#141414] p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={tp.price} 
                    onChange={(e) => updateTarget(index, e.target.value)}
                    className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg p-2 text-sm outline-none"
                  />
                  <button onClick={() => removeTarget(index)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase">Return</div>
                    <div className="text-emerald-400 font-bold">+${profit.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 uppercase">R:R</div>
                    <div className="text-emerald-400 font-bold">{rr}R</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}