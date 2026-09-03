import React from "react";
import { FileDown } from "lucide-react";

export default function ExportLaporan() {
  return (
    <div className="bg-[#ffffff] p-6 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-[#e6f7f6] text-[#009688] rounded-xl">
          <FileDown className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Export Laporan</h2>
          <p className="text-xs text-slate-500">Unduh laporan rekapitulasi bulanan dan harian (Excel/PDF)</p>
        </div>
      </div>
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
        <p className="text-slate-500 font-medium">Halaman Export Laporan siap digunakan.</p>
      </div>
    </div>
  );
}
