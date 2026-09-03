import React, { useState } from "react";
import {
  Calendar,
  Search,
  FileSpreadsheet,
  FileText,
  Users,
  Banknote,
  Coins,
  Info
} from "lucide-react";

export default function RekapBulanan() {
  const [periode, setPeriode] = useState("2026-09");

  // Employee dataset exact copy from reference image
  const dataPegawai = [
    { nama: "VANNY", rbNoa: 5, rbNom: "50.000.000", maxiNoa: 3, maxiNom: "20.000.000", abatanaNoa: 2, abatanaNom: "15.000.000", emasNoa: 4, emasGram: "10,00", hajiNoa: 2, hajiNom: "20.000.000", pembiayaanNoa: 3, pembiayaanNom: "30.000.000", cilemNoa: 2, cilemGram: "5,00" },
    { nama: "BETHARI", rbNoa: 3, rbNom: "30.000.000", maxiNoa: 2, maxiNom: "15.000.000", abatanaNoa: 1, abatanaNom: "10.000.000", emasNoa: 3, emasGram: "7,00", hajiNoa: 1, hajiNom: "10.000.000", pembiayaanNoa: 2, pembiayaanNom: "20.000.000", cilemNoa: 1, cilemGram: "2,00" },
    { nama: "ZHARIF", rbNoa: 4, rbNom: "40.000.000", maxiNoa: 3, maxiNom: "25.000.000", abatanaNoa: 2, abatanaNom: "20.000.000", emasNoa: 5, emasGram: "12,00", hajiNoa: 2, hajiNom: "15.000.000", pembiayaanNoa: 4, pembiayaanNom: "40.000.000", cilemNoa: 3, cilemGram: "8,00" },
    { nama: "RIZKY", rbNoa: 2, rbNom: "20.000.000", maxiNoa: 2, maxiNom: "10.000.000", abatanaNoa: 1, abatanaNom: "5.000.000", emasNoa: 2, emasGram: "3,00", hajiNoa: 1, hajiNom: "5.000.000", pembiayaanNoa: 2, pembiayaanNom: "15.000.000", cilemNoa: 1, cilemGram: "2,00" },
    { nama: "LILI", rbNoa: 3, rbNom: "25.000.000", maxiNoa: 1, maxiNom: "5.000.000", abatanaNoa: 2, abatanaNom: "10.000.000", emasNoa: 2, emasGram: "4,50", hajiNoa: 1, hajiNom: "10.000.000", pembiayaanNoa: 1, pembiayaanNom: "10.000.000", cilemNoa: 2, cilemGram: "3,00" },
    { nama: "NISA", rbNoa: 1, rbNom: "10.000.000", maxiNoa: 2, maxiNom: "10.000.000", abatanaNoa: 1, abatanaNom: "5.000.000", emasNoa: 1, emasGram: "2,00", hajiNoa: "-", hajiNom: "-", pembiayaanNoa: 1, pembiayaanNom: "5.000.000", cilemNoa: 1, cilemGram: "1,00" },
    { nama: "ARDI", rbNoa: 2, rbNom: "15.000.000", maxiNoa: 1, maxiNom: "5.000.000", abatanaNoa: 1, abatanaNom: "5.000.000", emasNoa: 1, emasGram: "1,50", hajiNoa: "-", hajiNom: "-", pembiayaanNoa: 1, pembiayaanNom: "10.000.000", cilemNoa: 1, cilemGram: "1,00" },
    { nama: "OKTA", rbNoa: 3, rbNom: "30.000.000", maxiNoa: 2, maxiNom: "10.000.000", abatanaNoa: 2, abatanaNom: "10.000.000", emasNoa: 2, emasGram: "3,50", hajiNoa: 1, hajiNom: "15.000.000", pembiayaanNoa: 2, pembiayaanNom: "20.000.000", cilemNoa: 2, cilemGram: "4,00" },
    { nama: "HENDRA", rbNoa: 2, rbNom: "15.000.000", maxiNoa: 1, maxiNom: "5.000.000", abatanaNoa: 1, abatanaNom: "5.000.000", emasNoa: 1, emasGram: "2,00", hajiNoa: 1, hajiNom: "5.000.000", pembiayaanNoa: 1, pembiayaanNom: "5.000.000", cilemNoa: 1, cilemGram: "1,50" },
    { nama: "RICO", rbNoa: 1, rbNom: "10.000.000", maxiNoa: "-", maxiNom: "-", abatanaNoa: 1, abatanaNom: "5.000.000", emasNoa: 1, emasGram: "1,00", hajiNoa: "-", hajiNom: "-", pembiayaanNoa: 1, pembiayaanNom: "5.000.000", cilemNoa: "-", cilemGram: "-" },
    { nama: "RIAN", rbNoa: 2, rbNom: "15.000.000", maxiNoa: 1, maxiNom: "5.000.000", abatanaNoa: 1, abatanaNom: "5.000.000", emasNoa: 1, emasGram: "1,50", hajiNoa: "-", hajiNom: "-", pembiayaanNoa: 1, pembiayaanNom: "5.000.000", cilemNoa: "-", cilemGram: "-" },
    { nama: "SYAIFUL", rbNoa: 1, rbNom: "10.000.000", maxiNoa: 1, maxiNom: "5.000.000", abatanaNoa: "-", abatanaNom: "-", emasNoa: 1, emasGram: "1,00", hajiNoa: "-", hajiNom: "-", pembiayaanNoa: 1, pembiayaanNom: "5.000.000", cilemNoa: "-", cilemGram: "-" },
    { nama: "RAHMAD", rbNoa: "-", rbNom: "-", maxiNoa: 1, maxiNom: "5.000.000", abatanaNoa: 1, abatanaNom: "5.000.000", emasNoa: "-", emasGram: "-", hajiNoa: 1, hajiNom: "5.000.000", pembiayaanNoa: "-", pembiayaanNom: "-", cilemNoa: 1, cilemGram: "1,00" },
    { nama: "SUHADI", rbNoa: 1, rbNom: "5.000.000", maxiNoa: "-", maxiNom: "-", abatanaNoa: 1, abatanaNom: "5.000.000", emasNoa: "-", emasGram: "-", hajiNoa: "-", hajiNom: "-", pembiayaanNoa: 1, pembiayaanNom: "5.000.000", cilemNoa: "-", cilemGram: "-" }
  ];

  const totalRow = {
    nama: "TOTAL",
    rbNoa: 30,
    rbNom: "300.000.000",
    maxiNoa: 20,
    maxiNom: "140.000.000",
    abatanaNoa: 17,
    abatanaNom: "120.000.000",
    emasNoa: 24,
    emasGram: "48,00",
    hajiNoa: 10,
    hajiNom: "85.000.000",
    pembiayaanNoa: 24,
    pembiayaanNom: "230.000.000",
    cilemNoa: 15,
    cilemGram: "28,50"
  };

  return (
    <div className="space-y-5">
      {/* Header Title & Filter Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            REKAP MONITORING PROGRAM
          </h2>
          <p className="text-sm font-semibold text-slate-500">
            KC PEKANBARU SUDIRMAN 1
          </p>
        </div>

        {/* Periode Filter */}
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 mb-1">Periode</span>
            <div className="relative flex items-center">
              <input
                type="text"
                value="September 2026"
                readOnly
                className="bg-white border border-slate-300 rounded-lg text-sm px-3 py-2 pr-10 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#009688]"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>

          <button className="mt-5 bg-[#00a0a0] hover:bg-[#008888] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer">
            <Search className="w-4 h-4" />
            <span>Tampilkan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL PEGAWAI AKTIF */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[#e6f5f5] flex items-center justify-center text-[#00a0a0] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL PEGAWAI AKTIF
            </div>
            <div className="text-2xl font-extrabold text-slate-800">14</div>
            <div className="text-xs font-semibold text-[#00a0a0]">Pegawai</div>
          </div>
        </div>

        {/* Card 2: TOTAL NOA */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#f0b43c] bg-amber-50 flex items-center justify-center text-[#f0b43c] shrink-0 font-bold text-xs">
            NOA
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL NOA
            </div>
            <div className="text-2xl font-extrabold text-slate-800">185</div>
            <div className="text-xs font-semibold text-slate-500">NOA</div>
          </div>
        </div>

        {/* Card 3: TOTAL NOMINAL */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[#e6f5f5] flex items-center justify-center text-[#00a0a0] shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL NOMINAL
            </div>
            <div className="text-xl font-extrabold text-slate-800">
              Rp 1.248.500.000
            </div>
            <div className="text-xs font-semibold text-[#00a0a0]">Nominal</div>
          </div>
        </div>

        {/* Card 4: TOTAL GRAM */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL GRAM
            </div>
            <div className="text-2xl font-extrabold text-slate-800">236,50</div>
            <div className="text-xs font-semibold text-amber-600">Gram</div>
          </div>
        </div>
      </div>

      {/* Main Data Section: REKAP PER PEGAWAI */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">
            REKAP PER PEGAWAI
          </h3>

          {/* Export Action Buttons */}
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors cursor-pointer">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Excel</span>
            </button>
            <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer">
              <FileText className="w-4 h-4 text-rose-600" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              {/* Row 1 Header */}
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4 text-left border-r border-slate-200 min-w-[140px]">
                  Nama Referral
                </th>
                <th colSpan="2" className="py-2 px-2 border-r border-slate-200">RB</th>
                <th colSpan="2" className="py-2 px-2 border-r border-slate-200">MAXI</th>
                <th colSpan="2" className="py-2 px-2 border-r border-slate-200">ABATANA</th>
                <th colSpan="2" className="py-2 px-2 border-r border-slate-200">TAB EMAS</th>
                <th colSpan="2" className="py-2 px-2 border-r border-slate-200">TAB HAJI</th>
                <th colSpan="2" className="py-2 px-2 border-r border-slate-200">PEMBIAYAAN</th>
                <th colSpan="2" className="py-2 px-2">CILEM</th>
              </tr>
              {/* Row 2 Sub-Header */}
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="border-r border-slate-200"></th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2 border-r border-slate-200">Nominal</th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2 border-r border-slate-200">Nominal</th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2 border-r border-slate-200">Nominal</th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2 border-r border-slate-200">Gram</th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2 border-r border-slate-200">Nominal</th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2 border-r border-slate-200">Nominal</th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2">Gram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {dataPegawai.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/80 transition-colors font-medium"
                >
                  <td className="py-2.5 px-4 text-left font-bold text-slate-800 border-r border-slate-100">
                    {row.nama}
                  </td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.rbNoa}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.rbNom}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.maxiNoa}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.maxiNom}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.abatanaNoa}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.abatanaNom}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.emasNoa}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.emasGram}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.hajiNoa}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.hajiNom}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.pembiayaanNoa}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.pembiayaanNom}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.cilemNoa}</td>
                  <td className="py-2.5 px-2">{row.cilemGram}</td>
                </tr>
              ))}

              {/* TOTAL ROW */}
              <tr className="bg-[#e6f5f5] font-extrabold text-[#008888] border-t-2 border-slate-200">
                <td className="py-3 px-4 text-left border-r border-slate-200 font-black">
                  {totalRow.nama}
                </td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.rbNoa}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.rbNom}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.maxiNoa}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.maxiNom}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.abatanaNoa}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.abatanaNom}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.emasNoa}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.emasGram}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.hajiNoa}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.hajiNom}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.pembiayaanNoa}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.pembiayaanNom}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.cilemNoa}</td>
                <td className="py-3 px-2">{totalRow.cilemGram}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Disclaimer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Data diambil dari transaksi yang telah diinput pada periode 01 September 2026 - 30 September 2026
          </span>
        </div>
      </div>
    </div>
  );
}
