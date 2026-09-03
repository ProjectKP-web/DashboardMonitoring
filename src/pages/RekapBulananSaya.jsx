import React, { useState } from "react";
import { Calendar, Banknote, Scale, Calculator, Info } from "lucide-react";

export default function RekapBulananSaya() {
  const [periode, setPeriode] = useState("September 2026");

  // Auto-calculated breakdown per product for Vanny
  const rekapProduk = [
    { code: "RB", name: "RB (Rupiah)", noa: 5, nominal: "50.000.000", gram: "-", unit: "nominal" },
    { code: "MAXI", name: "MAXI (Deposito)", noa: 3, nominal: "20.000.000", gram: "-", unit: "nominal" },
    { code: "ABATANA", name: "ABATANA (Tabungan)", noa: 2, nominal: "15.000.000", gram: "-", unit: "nominal" },
    { code: "TAB EMAS", name: "TAB EMAS", noa: 4, nominal: "-", gram: "10,00", unit: "gram" },
    { code: "TAB HAJI", name: "TAB HAJI", noa: 2, nominal: "20.000.000", gram: "-", unit: "nominal" },
    { code: "PEMBIAYAAN", name: "PEMBIAYAAN", noa: 3, nominal: "30.000.000", gram: "-", unit: "nominal" },
    { code: "CILEM", name: "CILEM (Cicil Emas)", noa: 2, nominal: "-", gram: "5,00", unit: "gram" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#e6f5f5] text-[#00a0a0] rounded-xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">REKAP BULANAN SAYA</h2>
            <p className="text-xs text-slate-500">Hasil perhitungan otomatis dari seluruh transaksi yang Anda input pada periode {periode}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-[#00a0a0]" />
          <span>Periode: {periode}</span>
        </div>
      </div>

      {/* Product Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rekapProduk.map((item) => (
          <div key={item.code} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#00a0a0] bg-[#e6f5f5] px-3 py-1 rounded-lg uppercase tracking-wide">
                {item.code}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                NOA: <strong className="text-slate-800">{item.noa}</strong>
              </span>
            </div>

            <div className="pt-1">
              <div className="text-xs text-slate-500 font-medium">{item.name}</div>
              {item.unit === "nominal" ? (
                <div className="text-lg font-extrabold text-slate-800 flex items-center space-x-1 mt-0.5">
                  <Banknote className="w-4 h-4 text-[#00a0a0]" />
                  <span>Rp {item.nominal}</span>
                </div>
              ) : (
                <div className="text-lg font-extrabold text-amber-700 flex items-center space-x-1 mt-0.5">
                  <Scale className="w-4 h-4 text-[#f0b43c]" />
                  <span>{item.gram} Gram</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Information Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-[#00a0a0] shrink-0" />
        <span>
          Data rekap ini dihitung otomatis dari seluruh transaksi yang telah Anda simpan pada tanggal 01 September 2026 - 30 September 2026.
        </span>
      </div>
    </div>
  );
}
