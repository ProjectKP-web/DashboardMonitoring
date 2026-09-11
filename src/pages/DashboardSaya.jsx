import React, { useState, useEffect } from "react";
import { LayoutDashboard, FileEdit, Hash, Banknote, Scale, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";

export default function DashboardSaya() {
  const { user, profile } = useAuth();
  const { role } = useRole();
  const [loading, setLoading] = useState(false);

  const isKabag = role === "kabag" || profile?.role === "kepala_bagian" || profile?.role === "kabag";
  const currentUserId = user?.id || profile?.id;
  const userName = profile?.full_name || profile?.name || (user?.email ? user.email.split("@")[0].toUpperCase() : "Pegawai");

  // Dynamic Current Real-Time Month & Year
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const currentMonthName = monthNames[today.getMonth()];
  const currentYear = today.getFullYear();

  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalNoa: 0,
    totalNominal: 0,
    totalGram: 0,
  });

  const fetchDashboardStats = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    try {
      let query = supabase.from("transactions").select("*");

      if (currentUserId && currentUserId !== "demo-user-id") {
        query = query.eq("user_id", currentUserId);
      } else {
        query = query.eq("user_id", "00000000-0000-0000-0000-000000000000");
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching dashboard stats:", error);
      } else if (data) {
        let noaSum = 0;
        let nominalSum = 0;
        let gramSum = 0;
        let count = 0;

        data.forEach((item) => {
          const itemDate = item.transaction_date || "";
          // Filter strictly for active real-time month
          if (itemDate.startsWith(currentMonthStr)) {
            count += 1;
            noaSum += Number(item.noa) || 0;
            nominalSum += Number(item.nominal) || 0;
            gramSum += Number(item.gram) || 0;
          }
        });

        setStats({
          totalTransactions: count,
          totalNoa: noaSum,
          totalNominal: nominalSum,
          totalGram: gramSum,
        });
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchDashboardStats();
    } else {
      setStats({
        totalTransactions: 0,
        totalNoa: 0,
        totalNominal: 0,
        totalGram: 0,
      });
    }
  }, [user, profile, role]);

  return (
    <div className="space-y-6">
      {/* Active Period Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            DASHBOARD SAYA
          </h2>
          <p className="text-sm font-semibold text-slate-500">
            Selamat Datang, <span className="text-slate-800 font-bold">{userName}</span>! Periode Aktif:{" "}
            <span className="text-[#00a0a0] font-bold">{currentMonthName} {currentYear}</span>
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

      {/* Monthly Summary Cards (4 Cards Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10 rounded-2xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#00a0a0]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memuat data dashboard...</span>
            </div>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Transaksi</span>
            <FileEdit className="w-5 h-5 text-[#00a0a0]" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{stats.totalTransactions}</div>
          <div className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{stats.totalTransactions} transaksi bulan {currentMonthName}.</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total NOA</span>
            <Hash className="w-5 h-5 text-[#f0b43c]" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{stats.totalNoa}</div>
          <div className="text-xs font-semibold text-slate-500">Account (NOA)</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Nominal</span>
            <Banknote className="w-5 h-5 text-[#00a0a0]" />
          </div>
          <div className="text-xl font-extrabold text-slate-800">
            Rp {stats.totalNominal.toLocaleString("id-ID")}
          </div>
          <div className="text-xs font-semibold text-[#00a0a0]">Pencapaian Rupiah</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Gram</span>
            <Scale className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">
            {stats.totalGram.toFixed(2).replace(".", ",")}
          </div>
          <div className="text-xs font-semibold text-amber-600">Gram Emas</div>
        </div>
      </div>
    </div>
  );
}
