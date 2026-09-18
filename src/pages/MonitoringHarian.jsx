import React, { useState, useEffect } from "react";
import { Activity, Calendar, Search, Filter, ArrowUpRight, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";

export default function MonitoringHarian() {
  const { user, profile } = useAuth();
  const { role } = useRole();

  const isKabag = role === "kabag" || profile?.role === "kepala_bagian" || profile?.role === "kabag";
  const currentUserId = user?.id || profile?.id;

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [loading, setLoading] = useState(false);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [summary, setSummary] = useState({
    totalInput: 0,
    totalNominal: 0,
    totalGram: 0
  });

  const fetchDailyLogs = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    try {
      // Get all pegawai for mapping pegawai_id -> pegawai name
      const { data: pegawaiData } = await supabase.from("pegawai").select("*");
      const pegawaiMap = {};
      (pegawaiData || []).forEach((p) => {
        pegawaiMap[p.id] = (p.nama || "PEGAWAI").toUpperCase();
      });

      let query = supabase
        .from("transactions")
        .select("*, products(id, name, measurement_type), pegawai(id, nama)")
        .eq("transaction_date", selectedDate)
        .order("created_at", { ascending: false });

      if (!isKabag) {
        if (currentUserId && currentUserId !== "demo-user-id") {
          query = query.eq("user_id", currentUserId);
        } else {
          query = query.eq("user_id", "00000000-0000-0000-0000-000000000000");
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching daily logs:", error);
      } else if (data) {
        let nomSum = 0;
        let gramSum = 0;

        const formatted = data.map((item) => {
          const jam = item.created_at ? new Date(item.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "12:00";
          const empName = item.pegawai?.nama ? item.pegawai.nama.toUpperCase() : (pegawaiMap[item.pegawai_id] || "PEGAWAI BSI");
          const prodCode = item.products?.name || "RB";

          const nominalVal = item.nominal !== null && item.nominal !== undefined ? Number(item.nominal) : 0;
          const gramVal = item.gram !== null && item.gram !== undefined ? Number(item.gram) : 0;

          nomSum += nominalVal;
          gramSum += gramVal;

          return {
            id: item.id,
            jam,
            pegawai: empName,
            produk: prodCode,
            noa: item.noa || 0,
            nominal: item.nominal !== null && item.nominal !== undefined ? Number(item.nominal).toLocaleString("id-ID") : "-",
            gram: item.gram !== null && item.gram !== undefined ? Number(item.gram).toFixed(2).replace(".", ",") : "-"
          };
        });

        setDailyLogs(formatted);
        setSummary({
          totalInput: data.length,
          totalNominal: nomSum,
          totalGram: gramSum
        });
      }
    } catch (err) {
      console.error("Fetch daily log error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchDailyLogs();
    }
  }, [selectedDate, user, profile, role]);

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
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl text-sm px-3 py-2 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#009688] cursor-pointer"
            />
          </div>
          <button
            onClick={fetchDailyLogs}
            className="bg-[#009688] hover:bg-[#00897b] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Transaksi Hari Ini</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">{summary.totalInput} Input</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Nominal Hari Ini</span>
          <div className="text-2xl font-extrabold text-[#009688] mt-1">
            Rp {summary.totalNominal.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Emas Hari Ini</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {summary.totalGram.toFixed(2).replace(".", ",")} Gram
          </div>
        </div>
      </div>

      {/* Daily Activity Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#009688]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memuat log harian...</span>
            </div>
          </div>
        )}

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
              {dailyLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 font-semibold">
                    Belum ada transaksi diinput pada tanggal {selectedDate}.
                  </td>
                </tr>
              ) : (
                dailyLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50 font-medium">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
