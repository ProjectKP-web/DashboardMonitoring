import React, { useState, useEffect } from "react";
import { FileEdit, Banknote, Coins, Package, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";

export default function DashboardSaya() {
  const { user, profile } = useAuth();
  const { role } = useRole();
  const [loading, setLoading] = useState(false);

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

      // Realtime Listener
      const channel = supabase
        .channel("realtime-dashboard-saya")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "transactions" },
          () => {
            fetchDashboardStats();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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
            DASHBOARD
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
          <span>+ Input Produk Baru</span>
        </Link>
      </div>

      {/* Monthly Summary Cards (4 Cards Matched to Kabag Visual Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {/* Card 1: TOTAL PRODUK */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[#e6f5f5] flex items-center justify-center text-[#00a0a0] shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL PRODUK
            </div>
            {loading ? (
              <div className="h-7 w-16 bg-slate-200/70 animate-pulse rounded-md my-1"></div>
            ) : (
              <div className="text-2xl font-extrabold text-slate-800">{stats.totalTransactions}</div>
            )}
            <div className="text-xs font-semibold text-[#00a0a0]">Produk</div>
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
            {loading ? (
              <div className="h-7 w-16 bg-slate-200/70 animate-pulse rounded-md my-1"></div>
            ) : (
              <div className="text-2xl font-extrabold text-slate-800">{stats.totalNoa}</div>
            )}
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
            {loading ? (
              <div className="h-7 w-32 bg-slate-200/70 animate-pulse rounded-md my-1"></div>
            ) : (
              <div className="text-xl font-extrabold text-slate-800">
                Rp {stats.totalNominal.toLocaleString("id-ID")}
              </div>
            )}
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
            {loading ? (
              <div className="h-7 w-20 bg-slate-200/70 animate-pulse rounded-md my-1"></div>
            ) : (
              <div className="text-2xl font-extrabold text-slate-800">
                {stats.totalGram.toFixed(2).replace(".", ",")}
              </div>
            )}
            <div className="text-xs font-semibold text-amber-600">Gram</div>
          </div>
        </div>
      </div>
    </div>
  );
}
