import React, { useState, useEffect } from "react";
import { Package, Banknote, Scale, Hash, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export default function Produk() {
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(false);

  const productDescriptions = {
    RB: "Program Tabungan Rupiah Berhadiah / Regular",
    MAXI: "Program Deposito Berjangka Nisbah Kompetitif",
    ABATANA: "Program Simpanan Wadiah Abatana",
    "TAB EMAS": "Program Kepemilikan & Investasi Emas Syariah",
    "TAB HAJI": "Setoran Porsi Haji & Tabungan Haji Mabrur",
    PEMBIAYAAN: "Pencairan Pembiayaan Griya / OTO / Mitraguna",
    CILEM: "Program Akad Murabahah Cicil Emas Batangan",
    QRIS: "Program Transaksi & Perolehan Merchant QRIS BSI"
  };

  const fetchProducts = async () => {
    if (!isSupabaseConfigured) {
      useFallback();
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });
      if (error || !data || data.length === 0) {
        useFallback();
      } else {
        const formatted = data.map((item) => {
          let unitLabel = "Nominal (Rp)";
          if (item.measurement_type === "gram") unitLabel = "Gram";
          else if (item.measurement_type === "noa") unitLabel = "NOA";

          return {
            id: item.id,
            kode: item.name,
            nama: item.name === "QRIS" ? "Merchant QRIS BSI" : item.description || item.name,
            satuan: unitLabel,
            measurement_type: item.measurement_type,
            deskripsi: item.description || productDescriptions[item.name] || `Program Transaksi ${item.name}`
          };
        });
        setProdukList(formatted);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      useFallback();
    } finally {
      setLoading(false);
    }
  };

  const useFallback = () => {
    setProdukList([
      { kode: "RB", nama: "Tabungan RB (Rupiah)", satuan: "Nominal (Rp)", measurement_type: "nominal", deskripsi: "Program Tabungan Rupiah Berhadiah / Regular" },
      { kode: "MAXI", nama: "Deposito MAXI", satuan: "Nominal (Rp)", measurement_type: "nominal", deskripsi: "Program Deposito Berjangka Nisbah Kompetitif" },
      { kode: "ABATANA", nama: "Tabungan ABATANA", satuan: "Nominal (Rp)", measurement_type: "nominal", deskripsi: "Program Simpanan Wadiah Abatana" },
      { kode: "TAB EMAS", nama: "Tabungan Emas BSI", satuan: "Gram", measurement_type: "gram", deskripsi: "Program Kepemilikan & Investasi Emas Syariah" },
      { kode: "TAB HAJI", nama: "Tabungan Haji BSI", satuan: "Nominal (Rp)", measurement_type: "nominal", deskripsi: "Setoran Porsi Haji & Tabungan Haji Mabrur" },
      { kode: "PEMBIAYAAN", nama: "Pembiayaan BSI", satuan: "Nominal (Rp)", measurement_type: "nominal", deskripsi: "Pencairan Pembiayaan Griya / OTO / Mitraguna" },
      { kode: "CILEM", nama: "Cicil Emas (CILEM)", satuan: "Gram", measurement_type: "gram", deskripsi: "Program Akad Murabahah Cicil Emas Batangan" },
      { kode: "QRIS", nama: "Merchant QRIS BSI", satuan: "NOA Only", measurement_type: "noa", deskripsi: "Program Transaksi & Perolehan Merchant QRIS BSI" }
    ]);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#e6f7f6] text-[#009688] rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Master Data Produk Program</h2>
            <p className="text-xs text-slate-500">
              {produkList.length} Kategori produk perbankan yang direkap pada tabel monitoring
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10 rounded-2xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#009688]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memuat data produk...</span>
            </div>
          </div>
        )}

        {produkList.map((prod) => (
          <div key={prod.kode} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-[#009688] bg-[#e6f7f6] px-3 py-1 rounded-lg">
                {prod.kode}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                prod.satuan.includes("Gram")
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : prod.satuan.includes("NOA")
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {prod.satuan.includes("Gram") ? (
                  <Scale className="w-3 h-3" />
                ) : prod.satuan.includes("NOA") ? (
                  <Hash className="w-3 h-3" />
                ) : (
                  <Banknote className="w-3 h-3" />
                )}
                <span>{prod.satuan}</span>
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 text-sm">{prod.nama}</h3>
              <p className="text-xs text-slate-500 mt-1">{prod.deskripsi}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

