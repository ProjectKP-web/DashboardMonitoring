import React, { useState, useEffect } from "react";
import { X, Save, Calendar, Hash, Banknote, Scale, Package } from "lucide-react";

export default function EditTransactionModal({ isOpen, onClose, onSave, transaction }) {
  const [tanggal, setTanggal] = useState("");
  const [produk, setProduk] = useState("RB");
  const [noa, setNoa] = useState(1);
  const [nominal, setNominal] = useState("");
  const [gram, setGram] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const daftarProduk = [
    { id: 1, code: "RB", name: "RB - Rekening BSI", unit: "nominal" },
    { id: 2, code: "MAXI", name: "MAXI - Tabungan Maxi", unit: "nominal" },
    { id: 3, code: "ABATANA", name: "ABATANA - Tabungan Abatana", unit: "nominal" },
    { id: 4, code: "TAB EMAS", name: "Tab Emas", unit: "gram" },
    { id: 5, code: "TAB HAJI", name: "Tab Haji - Tabungan Haji", unit: "nominal" },
    { id: 6, code: "PEMBIAYAAN", name: "Pembiayaan", unit: "nominal" },
    { id: 7, code: "CILEM", name: "CILEM - Cicil Emas", unit: "gram" }
  ];

  useEffect(() => {
    if (transaction) {
      setTanggal(transaction.tanggal || "");
      setProduk(transaction.produkCode || transaction.produk || "RB");
      setNoa(transaction.noa || 1);
      setNominal(transaction.nominalRaw !== undefined && transaction.nominalRaw !== null ? transaction.nominalRaw : "");
      setGram(transaction.gramRaw !== undefined && transaction.gramRaw !== null ? transaction.gramRaw : "");
      setKeterangan(transaction.keterangan || "");
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const selectedProd = daftarProduk.find((p) => p.code === produk);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedProd = daftarProduk.find((p) => p.code === produk || p.id === Number(produk));
    onSave({
      ...transaction,
      tanggal,
      product_id: selectedProd?.id || transaction.product_id || 1,
      produk: selectedProd?.name || produk,
      produkCode: selectedProd?.code || produk,
      noa: Number(noa),
      nominal: selectedProd?.unit === "nominal" && nominal ? Number(nominal).toLocaleString("id-ID") : "-",
      nominalRaw: nominal,
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
                type="text"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#009688] outline-hidden"
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
                  type="number"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#009688] outline-hidden"
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
