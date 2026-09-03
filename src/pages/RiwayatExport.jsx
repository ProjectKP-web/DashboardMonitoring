import React from "react";
import { History } from "lucide-react";

export default function RiwayatExport() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-[#e6f7f6] text-[#009688] rounded-xl">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Riwayat Export</h2>
          <p className="text-xs text-slate-500">Daftar riwayat berkas laporan yang pernah diunduh</p>
        </div>
      </div>
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
        <p className="text-slate-500 font-medium">Halaman Riwayat Export siap digunakan.</p>
      </div>
    </div>
  );
}
