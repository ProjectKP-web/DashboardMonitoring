import React from "react";
import { LayoutDashboard, FileEdit, Hash, Banknote, Scale, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardSaya() {
  return (
    <div className="space-y-6">
      {/* Active Period Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            DASHBOARD SAYA
          </h2>
          <p className="text-sm font-semibold text-slate-500">
            Selamat Datang, Vanny! Periode Aktif: <span className="text-[#00a0a0]">September 2026</span> (01 September 2026 – 30 September 2026)
          </p>
        </div>

        <Link
          to="/input-transaksi"
          className="bg-[#00a0a0] hover:bg-[#008888] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs transition-colors self-start md:self-auto cursor-pointer"
        >
          <FileEdit className="w-4 h-4" />
          <span>+ Input Transaksi Baru</span>
        </Link>
      </div>

      {/* Monthly Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Transaksi</span>
            <FileEdit className="w-5 h-5 text-[#00a0a0]" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">15</div>
          <div className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>15 transaksi telah diinput bulan ini.</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total NOA</span>
            <Hash className="w-5 h-5 text-[#f0b43c]" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">24</div>
          <div className="text-xs font-semibold text-slate-500">Account (NOA)</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Nominal</span>
            <Banknote className="w-5 h-5 text-[#00a0a0]" />
          </div>
          <div className="text-xl font-extrabold text-slate-800">Rp 230.000.000</div>
          <div className="text-xs font-semibold text-[#00a0a0]">Pencapaian Rupiah</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Gram</span>
            <Scale className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">18,50</div>
          <div className="text-xs font-semibold text-amber-600">Gram Emas</div>
        </div>
      </div>

      {/* Activity Progress Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
          Aktivitas Transaksi Bulan Ini
        </h3>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#e6f5f5] text-[#00a0a0] rounded-xl font-bold">
              95%
            </div>
            <div>
              <div className="font-bold text-slate-800 text-xs">Pencapaian Target Monitoring</div>
              <div className="text-xs text-slate-500">Semua transaksi periode September 2026 terverifikasi otomatis.</div>
            </div>
          </div>
          <Link to="/rekap-bulanan-saya" className="text-xs font-bold text-[#00a0a0] hover:underline">
            Lihat Rekap Saya &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
