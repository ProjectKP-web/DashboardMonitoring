import React, { useState } from "react";
import {
  FileEdit,
  RotateCcw,
  Save,
  Calendar,
  Info,
  Filter,
  CheckCircle2,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ConfirmationModal from "../components/ConfirmationModal";
import EditTransactionModal from "../components/EditTransactionModal";

export default function InputTransaksi() {
  // Today's date default
  const [tanggal, setTanggal] = useState("03/09/2026");
  const [produk, setProduk] = useState("RB");
  const [noa, setNoa] = useState(2);
  const [nominal, setNominal] = useState("20000000");
  const [gram, setGram] = useState("");
  const [keterangan, setKeterangan] = useState("Pembukaan rekening baru");

  // Notifications & Modals state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProduk, setFilterProduk] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Master product dictionary
  const daftarProduk = [
    { code: "RB", name: "RB - Rekening BSI", unit: "nominal" },
    { code: "MAXI", name: "MAXI - Tabungan Maxi", unit: "nominal" },
    { code: "ABATANA", name: "ABATANA - Tabungan Abatana", unit: "nominal" },
    { code: "TAB EMAS", name: "Tab Emas", unit: "gram" },
    { code: "TAB HAJI", name: "Tab Haji - Tabungan Haji", unit: "nominal" },
    { code: "PEMBIAYAAN", name: "Pembiayaan", unit: "nominal" },
    { code: "CILEM", name: "CILEM", unit: "gram" }
  ];

  // Sample transactions dataset matching user prompt and screenshot
  const [riwayat, setRiwayat] = useState([
    {
      id: 1,
      tanggal: "03/09/2026",
      produk: "RB - Rekening BSI",
      produkCode: "RB",
      noa: 2,
      nominal: "20.000.000",
      nominalRaw: "20000000",
      gram: "-",
      gramRaw: "",
      keterangan: "Pembukaan rekening baru",
      status: "Tersimpan"
    },
    {
      id: 2,
      tanggal: "01/09/2026",
      produk: "MAXI - Tabungan Maxi",
      produkCode: "MAXI",
      noa: 1,
      nominal: "10.000.000",
      nominalRaw: "10000000",
      gram: "-",
      gramRaw: "",
      keterangan: "Setoran awal",
      status: "Tersimpan"
    },
    {
      id: 3,
      tanggal: "31/08/2026",
      produk: "Tab Emas",
      produkCode: "TAB EMAS",
      noa: 2,
      nominal: "-",
      nominalRaw: "",
      gram: "5,00",
      gramRaw: "5.00",
      keterangan: "Pembelian tab emas",
      status: "Tersimpan"
    },
    {
      id: 4,
      tanggal: "30/08/2026",
      produk: "Pembiayaan",
      produkCode: "PEMBIAYAAN",
      noa: 1,
      nominal: "15.000.000",
      nominalRaw: "15000000",
      gram: "-",
      gramRaw: "",
      keterangan: "Pembiayaan multiguna",
      status: "Tersimpan"
    },
    {
      id: 5,
      tanggal: "29/08/2026",
      produk: "CILEM",
      produkCode: "CILEM",
      noa: 1,
      nominal: "-",
      nominalRaw: "",
      gram: "2,00",
      gramRaw: "2.00",
      keterangan: "CICIL EMAS",
      status: "Tersimpan"
    }
  ]);

  const selectedProductObj = daftarProduk.find((p) => p.code === produk);

  // Form Reset
  const handleReset = () => {
    setTanggal("03/09/2026");
    setProduk("RB");
    setNoa(1);
    setNominal("");
    setGram("");
    setKeterangan("");
  };

  // Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tanggal || !produk || !noa || noa <= 0) return;

    const prodInfo = daftarProduk.find((p) => p.code === produk);
    const formattedNominal =
      prodInfo?.unit === "nominal" && nominal
        ? Number(nominal).toLocaleString("id-ID")
        : "-";
    const formattedGram =
      prodInfo?.unit === "gram" && gram
        ? Number(gram).toFixed(2).replace(".", ",")
        : "-";

    const newTransaction = {
      id: Date.now(),
      tanggal,
      produk: prodInfo?.name || produk,
      produkCode: produk,
      noa: Number(noa),
      nominal: formattedNominal,
      nominalRaw: nominal,
      gram: formattedGram,
      gramRaw: gram,
      keterangan: keterangan || "-",
      status: "Tersimpan"
    };

    setRiwayat([newTransaction, ...riwayat]);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);

    // Reset Form to Default
    setNominal("");
    setGram("");
    setKeterangan("");
  };

  // Delete Action
  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setRiwayat(riwayat.filter((item) => item.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  // Edit Save Action
  const handleEditSave = (updatedItem) => {
    setRiwayat(riwayat.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  // Filtered dataset
  const filteredRiwayat = riwayat.filter((item) => {
    const matchSearch =
      item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.produk.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProduct = filterProduk === "ALL" || item.produkCode === filterProduk;
    return matchSearch && matchProduct;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl shadow-xs flex items-center space-x-3 text-emerald-800 text-sm font-semibold animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Transaksi berhasil disimpan ke Riwayat Transaksi Saya.</span>
        </div>
      )}

      {/* Main Input Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-6">
        {/* Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-[#00a0a0] text-white rounded-xl shadow-xs">
              <FileEdit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">
                FORM INPUT TRANSAKSI
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Masukkan data transaksi program yang Anda lakukan
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-400 self-start sm:self-center">
            Dashboard &gt; <span className="text-[#00a0a0]">Input Transaksi</span>
          </div>
        </div>

        {/* Input Form Grid */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* 1. Tanggal Transaksi */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Tanggal Transaksi <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0]"
                  required
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
              </div>
            </div>

            {/* 2. Produk */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Produk <span className="text-rose-500">*</span>
              </label>
              <select
                value={produk}
                onChange={(e) => {
                  setProduk(e.target.value);
                  setNominal("");
                  setGram("");
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0]"
              >
                {daftarProduk.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. NOA */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                NOA (Jumlah) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={noa}
                onChange={(e) => setNoa(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0]"
                required
              />
            </div>

            {/* 4. Nominal (Rp) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Nominal (Rp) {selectedProductObj?.unit === "nominal" && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="number"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                disabled={selectedProductObj?.unit !== "nominal"}
                placeholder={selectedProductObj?.unit === "nominal" ? "20.000.000" : "Hanya untuk produk Rupiah"}
                className={`w-full px-3.5 py-2.5 border rounded-xl font-bold ${
                  selectedProductObj?.unit === "nominal"
                    ? "bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-[#00a0a0]"
                    : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              />
            </div>

            {/* 5. Gram */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Gram {selectedProductObj?.unit === "gram" && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="number"
                step="0.01"
                value={gram}
                onChange={(e) => setGram(e.target.value)}
                disabled={selectedProductObj?.unit !== "gram"}
                placeholder={selectedProductObj?.unit === "gram" ? "Masukkan gram (misal 5.00)" : "Masukkan gram (jika ada)"}
                className={`w-full px-3.5 py-2.5 border rounded-xl font-bold ${
                  selectedProductObj?.unit === "gram"
                    ? "bg-amber-50/60 border-[#f0b43c] text-amber-900 focus:ring-2 focus:ring-[#f0b43c]"
                    : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              />
            </div>

            {/* 6. Keterangan */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Keterangan (Opsional)
              </label>
              <textarea
                rows="1"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Pembukaan rekening baru"
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0]"
              />
            </div>
          </div>

          {/* Informational Alert */}
          <div className="bg-[#e6f5f5] border border-[#00a0a0]/20 p-4 rounded-xl text-xs text-slate-700 flex items-start space-x-3">
            <Info className="w-4 h-4 text-[#00a0a0] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#00a0a0]">Catatan:</span>
              <ul className="list-disc list-inside text-[#008888] space-y-0.5 font-medium">
                <li>Isi Nominal untuk produk dengan satuan Rupiah (RB, MAXI, ABATANA, TAB HAJI, PEMBIAYAAN)</li>
                <li>Isi Gram untuk produk dengan satuan Gram (TAB EMAS, CILEM)</li>
              </ul>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#00a0a0] hover:bg-[#008888] text-white text-xs font-bold shadow-xs flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      </div>

      {/* Card: RIWAYAT TRANSAKSI SAYA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">
              RIWAYAT TRANSAKSI SAYA
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Daftar transaksi yang telah Anda input pada periode September 2026
            </p>
          </div>

          {/* Filters & Actions */}
          <div className="flex items-center space-x-3 self-start md:self-auto">
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
              <span>Periode: September 2026</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <button className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009688] outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="text-slate-500 font-medium">
            Total Data: <strong className="text-slate-800">{filteredRiwayat.length}</strong>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-xl">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3 min-w-[40px]">No</th>
                <th className="py-3 px-3 min-w-[90px]">Tanggal</th>
                <th className="py-3 px-3 text-left min-w-[140px]">Produk</th>
                <th className="py-3 px-3 min-w-[50px]">NOA</th>
                <th className="py-3 px-3 text-right min-w-[110px]">Nominal (Rp)</th>
                <th className="py-3 px-3 text-right min-w-[80px]">Gram</th>
                <th className="py-3 px-3 text-left min-w-[180px]">Keterangan</th>
                <th className="py-3 px-3 min-w-[110px]">Status</th>
                <th className="py-3 px-3 min-w-[80px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRiwayat.length > 0 ? (
                filteredRiwayat.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 font-medium transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3">{row.tanggal}</td>
                    <td className="py-3 px-3 text-left font-bold text-slate-800">{row.produk}</td>
                    <td className="py-3 px-3 font-bold">{row.noa}</td>
                    <td className="py-3 px-3 text-right font-semibold">{row.nominal}</td>
                    <td className="py-3 px-3 text-right font-bold text-amber-600">{row.gram}</td>
                    <td className="py-3 px-3 text-left text-slate-600">{row.keterangan}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setItemToEdit(row);
                            setEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#009688] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(row);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400 font-medium">
                    Tidak ada data transaksi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 pt-2 gap-3">
          <div>
            Menampilkan 1 - {filteredRiwayat.length} dari 15 transaksi
          </div>

          <div className="flex items-center space-x-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-[#009688] text-white font-bold cursor-pointer">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium cursor-pointer">
              2
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium cursor-pointer">
              3
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Delete Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemTitle={itemToDelete ? `Transaksi ${itemToDelete.produk} Tanggal ${itemToDelete.tanggal}` : "transaksi"}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        transaction={itemToEdit}
      />
    </div>
  );
}
