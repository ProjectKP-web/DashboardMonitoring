import React from "react";
import { Coins, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabase";

export default function ProductComparisonChart({
  masterProducts = [],
  allTransactions = [],
  periode = "2026-09"
}) {
  // Product color scheme matching standard corporate dashboard
  const productColors = {
    RB: { bg: "bg-[#008080]", text: "text-[#008080]", label: "RB" },
    MAXI: { bg: "bg-[#10b981]", text: "text-[#10b981]", label: "MAXI" },
    ABATANA: { bg: "bg-[#06b6d4]", text: "text-[#06b6d4]", label: "ABATANA" },
    "TAB EMAS": { bg: "bg-[#f59e0b]", text: "text-[#f59e0b]", label: "Tabungan Emas" },
    "TABUNGAN EMAS": { bg: "bg-[#f59e0b]", text: "text-[#f59e0b]", label: "Tabungan Emas" },
    "TAB HAJI": { bg: "bg-[#f97316]", text: "text-[#f97316]", label: "Tabungan Haji" },
    "TABUNGAN HAJI": { bg: "bg-[#f97316]", text: "text-[#f97316]", label: "Tabungan Haji" },
    PEMBIAYAAN: { bg: "bg-[#3b82f6]", text: "text-[#3b82f6]", label: "Pembiayaan" },
    CILEM: { bg: "bg-[#8b5cf6]", text: "text-[#8b5cf6]", label: "Cilem" },
    CLEM: { bg: "bg-[#8b5cf6]", text: "text-[#8b5cf6]", label: "Cilem" },
    QRIS: { bg: "bg-[#ec4899]", text: "text-[#ec4899]", label: "QRIS" }
  };

  // Generate 6 months ending at current selected period
  const getMonthsList = (targetPeriode) => {
    let year = 2026;
    let month = 9;
    if (targetPeriode && targetPeriode.includes("-")) {
      const parts = targetPeriode.split("-");
      year = parseInt(parts[0], 10) || 2026;
      month = parseInt(parts[1], 10) || 9;
    }

    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const result = [];
    for (let i = 5; i >= 0; i--) {
      let dMonth = month - 1 - i;
      let dYear = year;
      while (dMonth < 0) {
        dMonth += 12;
        dYear -= 1;
      }
      const yyyymm = `${dYear}-${String(dMonth + 1).padStart(2, "0")}`;
      const label = `${monthNames[dMonth]} ${dYear}`;
      result.push({ yyyymm, label });
    }
    return result;
  };

  const months = getMonthsList(periode);

  // Default products list matching reference image
  const defaultProducts = [
    { code: "RB", label: "RB" },
    { code: "MAXI", label: "MAXI" },
    { code: "TAB EMAS", label: "Tabungan Emas" },
    { code: "TAB HAJI", label: "Tabungan Haji" },
    { code: "PEMBIAYAAN", label: "Pembiayaan" },
    { code: "CILEM", label: "Cilem" },
    { code: "QRIS", label: "QRIS" }
  ];

  const productsToShow = masterProducts.length > 0
    ? masterProducts.map((p) => {
        const codeUpper = (p.code || p.name).toUpperCase();
        return {
          code: codeUpper,
          label: productColors[codeUpper]?.label || p.name
        };
      })
    : defaultProducts;

  // Sample mock data for demo view (only applied if Supabase is not configured)
  const mockMonthlyData = {
    "April 2026": { RB: 5, MAXI: 8, "TAB EMAS": 12, "TAB HAJI": 0, PEMBIAYAAN: 2, CILEM: 1, QRIS: 3 },
    "Mei 2026": { RB: 7, MAXI: 10, "TAB EMAS": 15, "TAB HAJI": 0, PEMBIAYAAN: 3, CILEM: 2, QRIS: 4 },
    "Juni 2026": { RB: 6, MAXI: 11, "TAB EMAS": 16, "TAB HAJI": 0, PEMBIAYAAN: 3, CILEM: 2, QRIS: 5 },
    "Juli 2026": { RB: 8, MAXI: 12, "TAB EMAS": 18, "TAB HAJI": 0, PEMBIAYAAN: 4, CILEM: 2, QRIS: 6 },
    "Agustus 2026": { RB: 7, MAXI: 10, "TAB EMAS": 17, "TAB HAJI": 0, PEMBIAYAAN: 3, CILEM: 2, QRIS: 5 },
    "September 2026": { RB: 9, MAXI: 12, "TAB EMAS": 20, "TAB HAJI": 5, PEMBIAYAAN: 5, CILEM: 3, QRIS: 5 }
  };

  // Build dataset for rendering directly from Supabase database transactions
  const monthlyDataset = months.map((m) => {
    const monthTx = (allTransactions || []).filter(
      (tx) => tx.transaction_date && tx.transaction_date.startsWith(m.yyyymm)
    );

    const productValues = {};
    productsToShow.forEach((prod) => {
      if (isSupabaseConfigured) {
        const totalNoa = monthTx
          .filter((tx) => {
            const pName = (tx.products?.name || "").toUpperCase();
            const pCode = (prod.code || "").toUpperCase();
            return pName === pCode || (pName && pCode && (pName.includes(pCode) || pCode.includes(pName)));
          })
          .reduce((sum, tx) => sum + (Number(tx.noa) || 0), 0);
        productValues[prod.code] = totalNoa;
      } else {
        const sampleObj = mockMonthlyData[m.label] || {};
        productValues[prod.code] = sampleObj[prod.code] || sampleObj[prod.label] || 0;
      }
    });

    return {
      label: m.label,
      values: productValues
    };
  });

  // Dynamic calculations strictly matching database dataset:
  // 1. Produk terlaris (Highest NOA > 0 in the selected active month)
  const lastMonthValues = monthlyDataset[monthlyDataset.length - 1]?.values || {};
  let maxVal = 0;
  let topProduct = "-";
  Object.keys(lastMonthValues).forEach((code) => {
    const val = Number(lastMonthValues[code]) || 0;
    if (val > maxVal) {
      maxVal = val;
      const matchConfig = productColors[code];
      topProduct = matchConfig ? matchConfig.label : code;
    }
  });

  // 2. Total transaksi terbanyak (Month in chart dataset with highest overall NOA count > 0)
  let topMonth = "-";
  let maxMonthTotal = 0;
  monthlyDataset.forEach((m) => {
    const sum = Object.values(m.values).reduce((a, b) => a + Number(b), 0);
    if (sum > maxMonthTotal) {
      maxMonthTotal = sum;
      topMonth = m.label;
    }
  });

  // 3. Peningkatan tertinggi (Highest positive MoM % increase from previous month)
  let topGrowth = "-";
  if (monthlyDataset.length >= 2) {
    const prevMonth = monthlyDataset[monthlyDataset.length - 2]?.values || {};
    const currMonth = monthlyDataset[monthlyDataset.length - 1]?.values || {};
    let maxIncreasePct = 0;
    let bestGrowthProd = "";

    productsToShow.forEach((p) => {
      const prevVal = Number(prevMonth[p.code]) || 0;
      const currVal = Number(currMonth[p.code]) || 0;
      if (prevVal > 0 && currVal > prevVal) {
        const pct = Math.round(((currVal - prevVal) / prevVal) * 100);
        if (pct > maxIncreasePct) {
          maxIncreasePct = pct;
          bestGrowthProd = `${p.label} (+${pct}%)`;
        }
      }
    });

    if (bestGrowthProd && maxIncreasePct > 0) {
      topGrowth = bestGrowthProd;
    }
  }

  // Dynamic Y-axis scale calculated from peak dataset value (minimum scale 20)
  const allValues = monthlyDataset.flatMap((m) => Object.values(m.values));
  const peakVal = Math.max(...allValues, 0);
  const maxScale = Math.max(Math.ceil(peakVal / 5) * 5, 20);
  const yTicks = [
    maxScale,
    Math.round(maxScale * 0.75),
    Math.round(maxScale * 0.5),
    Math.round(maxScale * 0.25),
    0
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row items-center gap-5">
        
        {/* Left Section: Chart Area */}
        <div className="flex-1 flex flex-col justify-between space-y-2.5 w-full">
          {/* Header & Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase">
              PERBANDINGAN PRODUK PER BULAN
            </h3>

            {/* Horizontal Legend */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-semibold text-slate-600">
              {productsToShow.map((p) => {
                const colorConfig = productColors[p.code] || { bg: "bg-slate-400", label: p.label };
                return (
                  <div key={p.code} className="flex items-center space-x-1">
                    <span className={`w-2.5 h-2.5 rounded-xs ${colorConfig.bg}`}></span>
                    <span className="text-slate-700">{colorConfig.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grouped Bar Chart Visual */}
          <div className="relative pt-2 pb-1">
            {/* Y-Axis Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-5">
              {yTicks.map((tick) => (
                <div key={tick} className="flex items-center w-full">
                  <span className="text-[10px] font-semibold text-slate-400 w-5 text-right pr-1.5">
                    {tick}
                  </span>
                  <div className="w-full border-b border-slate-100"></div>
                </div>
              ))}
            </div>

            {/* Bars Container */}
            <div className="pl-6 pt-1 pb-5 min-h-[140px] flex items-end justify-between gap-1.5 sm:gap-3 relative z-10">
              {monthlyDataset.map((mGroup, mIdx) => (
                <div key={mIdx} className="flex-1 flex flex-col items-center">
                  {/* Cluster of bars for each month */}
                  <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-[115px]">
                    {productsToShow.map((p) => {
                      const val = mGroup.values[p.code] || 0;
                      const barHeightPct = Math.min(Math.max((val / maxScale) * 100, val > 0 ? 6 : 0), 100);
                      const colorConfig = productColors[p.code] || { bg: "bg-slate-500" };

                      return (
                        <div
                          key={p.code}
                          className="flex-1 flex flex-col items-center justify-end h-full max-w-[10px] sm:max-w-[14px] group relative"
                        >
                          {/* Value label on top of bar */}
                          {val > 0 && (
                            <span className="text-[8px] sm:text-[9px] font-bold text-slate-600 mb-0.5">
                              {val}
                            </span>
                          )}
                          
                          {/* Bar Element */}
                          <div
                            className={`w-full rounded-t-xs transition-all duration-300 ${colorConfig.bg} hover:brightness-95`}
                            style={{ height: `${barHeightPct}%` }}
                            title={`${mGroup.label} - ${p.label}: ${val}`}
                          ></div>
                        </div>
                      );
                    })}
                  </div>

                  {/* X-Axis Month Label */}
                  <div className="mt-2 text-[10px] font-semibold text-slate-600 text-center whitespace-nowrap">
                    {mGroup.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Ringkasan Box embedded directly inside the white card */}
        <div className="w-full lg:w-[220px] bg-[#e6f7f5] border border-[#c1f2eb] rounded-xl p-3.5 space-y-3 shrink-0 self-center">
          {/* Header */}
          <div className="flex items-center space-x-1.5 text-[#00796b] font-bold pb-2 border-b border-teal-200/50">
            <div className="p-1 bg-[#ccf2ed] text-[#00796b] rounded-md">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs">Ringkasan</span>
          </div>

          {/* 3 Dynamic Summary Items */}
          <div className="space-y-2.5 text-xs">
            {/* Item 1: Produk terlaris */}
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-100/90 flex items-center justify-center text-amber-600 shrink-0">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-slate-500 text-[10px] font-medium leading-tight">Produk terlaris</div>
                <div className="font-bold text-slate-800 text-[11px] leading-tight">{topProduct}</div>
              </div>
            </div>

            {/* Item 2: Total transaksi terbanyak */}
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-slate-500 text-[10px] font-medium leading-tight">Total transaksi terbanyak</div>
                <div className="font-bold text-teal-700 text-[11px] leading-tight">{topMonth}</div>
              </div>
            </div>

            {/* Item 3: Peningkatan tertinggi */}
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-slate-500 text-[10px] font-medium leading-tight">Peningkatan tertinggi</div>
                <div className="font-bold text-emerald-700 text-[11px] leading-tight">{topGrowth}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
