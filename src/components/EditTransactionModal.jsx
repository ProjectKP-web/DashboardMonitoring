import React, { useState, useEffect } from "react";
import { X, Save, Calendar, Hash, Banknote, Scale, Package } from "lucide-react";

import { supabase, isSupabaseConfigured } from "../lib/supabase";

export default function EditTransactionModal({ isOpen, onClose, onSave, transaction }) {
  const [tanggal, setTanggal] = useState("");
  const [produk, setProduk] = useState("RB");
  const [noa, setNoa] = useState(1);
  const [nominal, setNominal] = useState("");
  const [gram, setGram] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const defaultDaftarProduk = [
    { id: 1, code: "RB", name: "RB", unit: "nominal" },
    { id: 2, code: "MAXI", name: "MAXI", unit: "nominal" },
    { id: 3, code: "ABATANA", name: "ABATANA", unit: "nominal" },
    { id: 4, code: "TAB EMAS", name: "TAB EMAS", unit: "gram" },
    { id: 5, code: "TAB HAJI", name: "TAB HAJI", unit: "nominal" },
    { id: 6, code: "PEMBIAYAAN", name: "PEMBIAYAAN", unit: "nominal" },
    { id: 7, code: "CILEM", name: "CILEM", unit: "gram" },
    { id: 8, code: "QRIS", name: "QRIS", unit: "noa" }
  ];

  const [daftarProduk, setDaftarProduk] = useState(defaultDaftarProduk);

  useEffect(() => {
    const loadProducts = () => {
      const saved = localStorage.getItem("bsi_custom_products");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const formatted = parsed.map((p) => {
              const code = (p.kode || p.code || p.name || "").toUpperCase();
              return {
                id: p.id,
                code: code,
                name: code,
                unit: p.measurement_type || "nominal"
              };
            });
            setDaftarProduk(formatted);
          }
        } catch (e) {
          console.warn("Error parsing local products in EditTransactionModal:", e);
        }
      }

      if (isSupabaseConfigured) {
        supabase.from("products").select("*").order("id", { ascending: true }).then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const formatted = data.map((p) => {
              const code = (p.name || "").toUpperCase();
              return {
                id: p.id,
                code: code,
                name: code,
                unit: p.measurement_type || "nominal"
              };
            });
            setDaftarProduk(formatted);
          }
        });
      }
    };

    loadProducts();
    window.addEventListener("bsi_products_updated", loadProducts);
    return () => {
      window.removeEventListener("bsi_products_updated", loadProducts);
    };
  }, []);

  useEffect(() => {
    if (transaction) {
      let isoDate = transaction.rawDate;
      if (!isoDate && transaction.tanggal) {
        if (transaction.tanggal.includes("/")) {
          const parts = transaction.tanggal.split("/");
          if (parts.length === 3) {
            isoDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
          }
        } else {
          isoDate = transaction.tanggal;
        }
      }
      setTanggal(isoDate || new Date().toISOString().split("T")[0]);
      setProduk(transaction.produkCode || transaction.produk || "RB");
      setNoa(transaction.noa || 1);
      const rawNom = transaction.nominalRaw !== undefined && transaction.nominalRaw !== null ? String(transaction.nominalRaw).replace(/[^0-9]/g, "") : "";
      setNominal(rawNom ? Number(rawNom).toLocaleString("id-ID") : "");
      setGram(transaction.gramRaw !== undefined && transaction.gramRaw !== null ? transaction.gramRaw : "");
      setKeterangan(transaction.keterangan || "");
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const selectedProd = daftarProduk.find((p) => p.code === produk);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedProd = daftarProduk.find((p) => p.code === produk || p.id === Number(produk));
    const rawNomStr = nominal ? nominal.toString().replace(/\./g, "") : "";
    onSave({
      ...transaction,
      tanggal,
      product_id: selectedProd?.id || transaction.product_id || 1,
      produk: selectedProd?.name || produk,
      produkCode: selectedProd?.code || produk,
      noa: Number(noa),
      nominal: selectedProd?.unit === "nominal" && rawNomStr ? Number(rawNomStr).toLocaleString("id-ID") : "-",
      nominalRaw: rawNomStr,
      gram: selectedProd?.unit === "gram" && gram ? Number(gram).toFixed(2).replace(".", ",") : "-",
      gramRaw: gram,
      keterangan
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-sm">Edit Data Transaksi</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Transaksi</label>
              <input
                type="date"
                value={tanggal}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#009688] outline-hidden cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Produk</label>
              <select
                value={produk}
                onChange={(e) => setProduk(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#009688] outline-hidden"
              >
                {daftarProduk.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">NOA (Jumlah)</label>
              <input
                type="number"
                min="1"
                value={noa}
                onChange={(e) => setNoa(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#009688] outline-hidden"
              />
            </div>

            {selectedProd?.unit === "nominal" && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={nominal}
                  onChange={(e) => {
                    const rawVal = e.target.value.replace(/[^0-9]/g, "");
                    if (!rawVal) {
                      setNominal("");
                    } else {
                      setNominal(Number(rawVal).toLocaleString("id-ID"));
                    }
                  }}
                  placeholder="Contoh: 20.000.000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-[#009688] outline-hidden"
                />
              </div>
            )}

            {selectedProd?.unit === "gram" && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gram</label>
                <input
                  type="number"
                  step="0.01"
                  value={gram}
                  onChange={(e) => setGram(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#009688] outline-hidden"
                />
              </div>
            )}
          </div>



          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#009688] hover:bg-[#00897b] text-white shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
