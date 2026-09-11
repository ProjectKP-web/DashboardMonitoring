import React, { useState, useEffect } from "react";
import { Calendar, Banknote, Scale, Calculator, Info, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const getCurrentPeriode = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export default function RekapBulananSaya() {
  const { user, profile } = useAuth();
  const [periode, setPeriode] = useState(getCurrentPeriode);
  const [loading, setLoading] = useState(false);

  const masterProducts = [
    { id: 1, code: "RB", name: "RB (Rupiah)", unit: "nominal" },
    { id: 2, code: "MAXI", name: "MAXI (Deposito)", unit: "nominal" },
    { id: 3, code: "ABATANA", name: "ABATANA (Tabungan)", unit: "nominal" },
    { id: 4, code: "TAB EMAS", name: "TAB EMAS", unit: "gram" },
    { id: 5, code: "TAB HAJI", name: "TAB HAJI", unit: "nominal" },
    { id: 6, code: "PEMBIAYAAN", name: "PEMBIAYAAN", unit: "nominal" },
    { id: 7, code: "CILEM", name: "CILEM (Cicil Emas)", unit: "gram" }
  ];

  const [rekapProduk, setRekapProduk] = useState([
    { code: "RB", name: "RB (Rupiah)", noa: 0, nominal: "0", gram: "-", unit: "nominal" },
    { code: "MAXI", name: "MAXI (Deposito)", noa: 0, nominal: "0", gram: "-", unit: "nominal" },
    { code: "ABATANA", name: "ABATANA (Tabungan)", noa: 0, nominal: "0", gram: "-", unit: "nominal" },
    { code: "TAB EMAS", name: "TAB EMAS", noa: 0, nominal: "-", gram: "0,00", unit: "gram" },
    { code: "TAB HAJI", name: "TAB HAJI", noa: 0, nominal: "0", gram: "-", unit: "nominal" },
    { code: "PEMBIAYAAN", name: "PEMBIAYAAN", noa: 0, nominal: "0", gram: "-", unit: "nominal" },
    { code: "CILEM", name: "CILEM (Cicil Emas)", noa: 0, nominal: "-", gram: "0,00", unit: "gram" }
  ]);

  const fetchUserRecap = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    try {
      const currentUserId = user?.id || profile?.id;
      
      let query = supabase
        .from("transactions")
        .select("*, products(id, name, measurement_type)");

      if (currentUserId && currentUserId !== "demo-user-id") {
        query = query.eq("user_id", currentUserId);
      } else if (!currentUserId || currentUserId === "demo-user-id") {
        query = query.eq("user_id", "00000000-0000-0000-0000-000000000000");
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching recap from Supabase:", error);
      } else if (data) {
        const userTxs = data;

        // Aggregate transactions by product
        const stats = {};
        masterProducts.forEach((p) => {
          stats[p.id] = { noa: 0, nominal: 0, gram: 0 };
        });

        userTxs.forEach((item) => {
          const itemDate = item.transaction_date || "";
          if (periode && !itemDate.startsWith(periode)) {
            return;
          }

          const prodName = (item.products?.name || "").toUpperCase();
          const matchProd = masterProducts.find(
            (p) => p.id === Number(item.product_id) || p.code.toUpperCase() === prodName
          );

          const pid = matchProd ? matchProd.id : 1;
          if (!stats[pid]) {
            stats[pid] = { noa: 0, nominal: 0, gram: 0 };
          }
          stats[pid].noa += Number(item.noa) || 0;
          stats[pid].nominal += Number(item.nominal) || 0;
          stats[pid].gram += Number(item.gram) || 0;
        });

        const updated = masterProducts.map((prod) => {
          const s = stats[prod.id] || { noa: 0, nominal: 0, gram: 0 };
          return {
            code: prod.code,
            name: prod.name,
            noa: s.noa,
            nominal: prod.unit === "nominal" ? (s.nominal > 0 ? Number(s.nominal).toLocaleString("id-ID") : "0") : "-",
            gram: prod.unit === "gram" ? (s.gram > 0 ? Number(s.gram).toFixed(2).replace(".", ",") : "0,00") : "-",
            unit: prod.unit
          };
        });

        setRekapProduk(updated);
      }
    } catch (err) {
      console.error("User recap error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchUserRecap();
    } else {
      // Offline fallback
      setRekapProduk([
        { code: "RB", name: "RB (Rupiah)", noa: 0, nominal: "0", gram: "-", unit: "nominal" },
        { code: "MAXI", name: "MAXI (Deposito)", noa: 0, nominal: "0", gram: "-", unit: "nominal" },
        { code: "ABATANA", name: "ABATANA (Tabungan)", noa: 0, nominal: "0", gram: "-", unit: "nominal" },
        { code: "TAB EMAS", name: "TAB EMAS", noa: 0, nominal: "-", gram: "0,00", unit: "gram" },
        { code: "TAB HAJI", name: "TAB HAJI", noa: 0, nominal: "0", gram: "-", unit: "nominal" },
        { code: "PEMBIAYAAN", name: "PEMBIAYAAN", noa: 0, nominal: "0", gram: "-", unit: "nominal" },
        { code: "CILEM", name: "CILEM (Cicil Emas)", noa: 0, nominal: "-", gram: "0,00", unit: "gram" }
      ]);
    }
  }, [user, profile, periode]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#e6f5f5] text-[#00a0a0] rounded-xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">REKAP BULANAN SAYA</h2>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-[#00a0a0]" />
            <span>Periode:</span>
            <input
              type="month"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Product Summary Grid */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10 rounded-2xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#00a0a0]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Menghitung rekap dari Supabase...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rekapProduk.map((item) => (
            <div key={item.code} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#00a0a0] bg-[#e6f5f5] px-3 py-1 rounded-lg uppercase tracking-wide">
                  {item.code}
                </span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  NOA: <strong className="text-slate-800">{item.noa}</strong>
                </span>
              </div>

              <div className="pt-1">
                <div className="text-xs text-slate-500 font-medium">{item.name}</div>
                {item.unit === "nominal" ? (
                  <div className="text-lg font-extrabold text-slate-800 flex items-center space-x-1 mt-0.5">
                    <Banknote className="w-4 h-4 text-[#00a0a0]" />
                    <span>Rp {item.nominal}</span>
                  </div>
                ) : (
                  <div className="text-lg font-extrabold text-amber-700 flex items-center space-x-1 mt-0.5">
                    <Scale className="w-4 h-4 text-[#f0b43c]" />
                    <span>{item.gram} Gram</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
