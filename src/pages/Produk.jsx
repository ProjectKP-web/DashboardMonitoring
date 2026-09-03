import React from "react";
import { Package, Banknote, Scale } from "lucide-react";

export default function Produk() {
  const produkList = [
    { kode: "RB", nama: "Tabungan RB (Rupiah)", satuan: "Nominal (Rp)", deskripsi: "Program Tabungan Rupiah Berhadiah / Regular" },
    { kode: "MAXI", nama: "Deposito MAXI", satuan: "Nominal (Rp)", deskripsi: "Program Deposito Berjangka Nisbah Kompetitif" },
    { kode: "ABATANA", nama: "Tabungan ABATANA", satuan: "Nominal (Rp)", deskripsi: "Program Simpanan Wadiah Abatana" },
    { kode: "TAB EMAS", nama: "Tabungan Emas BSI", satuan: "Gram", deskripsi: "Program Kepemilikan & Investasi Emas Syariah" },
    { kode: "TAB HAJI", nama: "Tabungan Haji BSI", satuan: "Nominal (Rp)", deskripsi: "Setoran Porsi Haji & Tabungan Haji Mabrur" },
    { kode: "PEMBIAYAAN", nama: "Pembiayaan BSI", satuan: "Nominal (Rp)", deskripsi: "Pencairan Pembiayaan Griya / OTO / Mitraguna" },
    { kode: "CILEM", nama: "Cicil Emas (CILEM)", satuan: "Gram", deskripsi: "Program Akad Murabahah Cicil Emas Batangan" }
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#e6f7f6] text-[#009688] rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Master Data Produk Program</h2>
            <p className="text-xs text-slate-500">7 Kategori produk perbankan yang direkap pada tabel monitoring</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {produkList.map((prod) => (
          <div key={prod.kode} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-[#009688] bg-[#e6f7f6] px-3 py-1 rounded-lg">
                {prod.kode}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                prod.satuan.includes("Gram")
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {prod.satuan.includes("Gram") ? <Scale className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
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
