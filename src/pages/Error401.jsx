import React from "react";
import { Link } from "react-router-dom";

export default function Error401() {
  return (
    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <h1 className="text-4xl font-extrabold text-amber-600">401</h1>
      <p className="text-slate-600 font-medium">Akses Memerlukan Autentikasi (Unauthorized)</p>
      <Link to="/login" className="inline-block text-[#009688] font-bold underline text-sm">
        Ke Halaman Login
      </Link>
    </div>
  );
}
