import React from "react";
import { Link } from "react-router-dom";

export default function Error403() {
  return (
    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <h1 className="text-4xl font-extrabold text-rose-600">403</h1>
      <p className="text-slate-600 font-medium">Akses Ditolak (Forbidden)</p>
      <Link to="/dashboard" className="inline-block text-[#009688] font-bold underline text-sm">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
