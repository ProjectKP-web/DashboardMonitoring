import React from "react";
import { CheckCircle2, Clock, AlertTriangle, FileText, CheckCheck } from "lucide-react";

export default function StatusBadge({ status, catatan = "" }) {
  switch (status) {
    case "Tersimpan":
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Tersimpan</span>
        </span>
      );

    case "Menunggu Review":
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          <span>Menunggu Review</span>
        </span>
      );

    case "Disetujui":
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e6f5f5] text-[#00a0a0] border border-[#00a0a0]/30">
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Disetujui</span>
        </span>
      );

    case "Perlu Perbaikan":
      return (
        <div className="relative group inline-block">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 cursor-pointer">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Perlu Perbaikan</span>
          </span>

          {catatan && (
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg z-50">
              <span className="font-bold text-amber-300 block mb-0.5">Catatan Kabag:</span>
              {catatan}
            </div>
          )}
        </div>
      );

    case "Draft":
    default:
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <FileText className="w-3.5 h-3.5" />
          <span>Draft</span>
        </span>
      );
  }
}
