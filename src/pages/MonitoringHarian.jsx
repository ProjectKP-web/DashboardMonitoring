import React, { useState } from "react";
import { Activity, Calendar, Search, Filter, ArrowUpRight } from "lucide-react";

export default function MonitoringHarian() {
  const [selectedDate, setSelectedDate] = useState("2026-09-03");

  const dailyLogs = [
    { jam: "16:45", pegawai: "VANNY", produk: "RB", noa: 2, nominal: "20.000.000", gram: "-" },
    { jam: "15:20", pegawai: "ZHARIF", produk: "TAB EMAS", noa: 1, nominal: "-", gram: "2,50" },
    { jam: "14:10", pegawai: "BETHARI", produk: "PEMBIAYAAN", noa: 1, nominal: "15.000.000", gram: "-" },
    { jam: "11:30", pegawai: "OKTA", produk: "MAXI", noa: 1, nominal: "10.000.000", gram: "-" },
    { jam: "10:05", pegawai: "RIZKY", produk: "ABATANA", noa: 1, nominal: "5.000.000", gram: "-" },
    { jam: "09:15", pegawai: "LILI", produk: "CILEM", noa: 1, nominal: "-", gram: "1,50" }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#e6f7f6] text-[#009688] rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Monitoring Harian Pegawai</h2>
            <p className="text-xs text-slate-500">Log transaksi real-time per tanggal operasional KC PEKANBARU SUDIRMAN 1</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl text-sm px-3 py-2 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#009688]"
            />
          </div>
          <button className="bg-[#009688] hover:bg-[#00897b] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-1.5 shadow-xs transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Transaksi Hari Ini</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">6 Input</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Nominal Hari Ini</span>
          <div className="text-2xl font-extrabold text-[#009688] mt-1">Rp 50.000.000</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Emas Hari Ini</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">4,00 Gram</div>
        </div>
      </div>

      {/* Daily Activity Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm">
          Log Transaksi Tanggal {selectedDate}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Nama Pegawai</th>
                <th className="py-3 px-4">Produk Program</th>
                <th className="py-3 px-4 text-center">NOA</th>
                <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                <th className="py-3 px-4 text-right">Gram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailyLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50 font-medium">
                  <td className="py-3 px-4 font-bold text-slate-500">{log.jam}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{log.pegawai}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-md font-semibold text-slate-700">
                      {log.produk}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold">{log.noa}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-800">{log.nominal}</td>
                  <td className="py-3 px-4 text-right font-bold text-amber-600">{log.gram}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
