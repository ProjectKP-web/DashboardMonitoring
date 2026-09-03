import React from "react";
import { Link } from "react-router-dom";

export default function Guest() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Selamat Datang</h1>
        <p className="text-sm text-slate-500">Halaman Portal Guest BSI Dashboard</p>
        <Link
          to="/dashboard"
          className="inline-block bg-[#009688] hover:bg-[#00897b] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          Buka Dashboard Monitoring
        </Link>
      </div>
    </div>
  );
}
