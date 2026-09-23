import React, { useState, useEffect } from "react";
import { History, Calendar, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ConfirmationModal from "../components/ConfirmationModal";
import EditTransactionModal from "../components/EditTransactionModal";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";

function formatDateForDisplay(dateStr) {
  if (!dateStr) return "";
  if (dateStr.includes("-")) {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
    }
  }
  return dateStr;
}

function formatDateForDB(dateStr) {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }
  return dateStr;
}

export default function RiwayatTransaksi() {
  const { user, profile } = useAuth();
  const { role } = useRole();

  const userRole = profile?.role || role;
  const isKabag = userRole === "kabag" || userRole === "kepala_bagian" || userRole === "kepala" || userRole === "admin" || userRole === "inputer";
  const currentUserId = user?.id || profile?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterProduk, setFilterProduk] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const defaultDaftarProduk = [
    { id: 1, code: "RB", name: "RB - Rekening BSI", unit: "nominal" },
    { id: 2, code: "MAXI", name: "MAXI - Tabungan Maxi", unit: "nominal" },
    { id: 3, code: "ABATANA", name: "ABATANA - Tabungan Abatana", unit: "nominal" },
    { id: 4, code: "TAB EMAS", name: "Tab Emas", unit: "gram" },
    { id: 5, code: "TAB HAJI", name: "Tab Haji - Tabungan Haji", unit: "nominal" },
    { id: 6, code: "PEMBIAYAAN", name: "Pembiayaan", unit: "nominal" },
    { id: 7, code: "CILEM", name: "CILEM - Cicil Emas", unit: "gram" },
    { id: 8, code: "QRIS", name: "QRIS - Merchant QRIS BSI", unit: "noa" }
  ];

  const [daftarProduk, setDaftarProduk] = useState(defaultDaftarProduk);

  const fetchProductsFromDB = async () => {
    const saved = localStorage.getItem("bsi_custom_products");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((p) => ({
            id: p.id,
            code: p.kode || p.code || p.name,
            name: p.name === "QRIS" ? "QRIS - Merchant QRIS BSI" : p.description ? `${p.kode || p.name} - ${p.description}` : p.nama || p.name,
            unit: p.measurement_type || "nominal"
          }));
          setDaftarProduk(formatted);
        }
      } catch (e) {
        console.warn("Error parsing local products in RiwayatTransaksi:", e);
      }
    }

    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });
      if (!error && data && data.length > 0) {
        const formatted = data.map((p) => ({
          id: p.id,
          code: p.name,
          name: p.name === "QRIS" ? "QRIS - Merchant QRIS BSI" : p.name,
          unit: p.measurement_type || "nominal"
        }));
        setDaftarProduk(formatted);
      }
    } catch (e) {
      console.error("Error fetching products in RiwayatTransaksi:", e);
    }
  };

  const [dataRiwayat, setDataRiwayat] = useState([]);

  const fetchTransactions = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    try {
      let query = supabase
        .from("transactions")
        .select("*, products(id, name, measurement_type)")
        .order("created_at", { ascending: false });

      const isValidUUID = (id) => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let targetUserId = user?.id;
      if (!isValidUUID(targetUserId)) {
        targetUserId = profile?.id;
      }

      if (isValidUUID(targetUserId)) {
        query = query.eq("user_id", targetUserId);
      } else {
        query = query.eq("user_id", "0c8cf587-370b-4ccb-969e-244685919156");
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching transactions:", error);
      } else if (data) {
        const { data: dbPegawai } = await supabase.from("pegawai").select("*");
        const activePegawai = dbPegawai || [];
        const pegawaiMap = {};
        (activePegawai || []).forEach((p) => {
          if (p.id) pegawaiMap[String(p.id)] = (p.nama || "").toUpperCase();
        });

        const formatted = data.map((item) => {
          const prodInfo = item.products || {};
          const prodCode = prodInfo.name || "RB";
          const matchMaster = daftarProduk.find(
            (p) => p.code.toUpperCase() === prodCode.toUpperCase() || p.id === item.product_id
          );

          const pegawaiNama = pegawaiMap[String(item.pegawai_id)] || (activePegawai.find((p) => String(p.id) === String(item.pegawai_id))?.nama || "").toUpperCase() || "-";

          return {
            id: item.id,
            user_id: item.user_id,
            product_id: item.product_id,
            pegawai_id: item.pegawai_id,
            pegawaiNama,
            tanggal: formatDateForDisplay(item.transaction_date),
            rawDate: item.transaction_date,
            produk: matchMaster?.name || prodCode,
            produkCode: matchMaster?.code || prodCode,
            noa: item.noa || 0,
            nominal: item.nominal !== null && item.nominal !== undefined ? Number(item.nominal).toLocaleString("id-ID") : "-",
            nominalRaw: item.nominal !== null && item.nominal !== undefined ? item.nominal.toString() : "",
            gram: item.gram !== null && item.gram !== undefined ? Number(item.gram).toFixed(2).replace(".", ",") : "-",
            gramRaw: item.gram !== null && item.gram !== undefined ? item.gram.toString() : "",
            status: "Tersimpan"
          };
        });
        setDataRiwayat(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsFromDB();
    if (isSupabaseConfigured) {
      fetchTransactions();
    } else {
      setDataRiwayat([
        { id: 1, tanggal: "03/09/2026", produk: "RB - Rekening BSI", produkCode: "RB", noa: 2, nominal: "20.000.000", gram: "-", status: "Tersimpan" },
        { id: 2, tanggal: "01/09/2026", produk: "MAXI - Tabungan Maxi", produkCode: "MAXI", noa: 1, nominal: "10.000.000", gram: "-", status: "Tersimpan" },
        { id: 3, tanggal: "31/08/2026", produk: "Tab Emas", produkCode: "TAB EMAS", noa: 2, nominal: "-", gram: "5,00", status: "Tersimpan" }
      ]);
    }
  }, [user, profile, role]);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    if (isSupabaseConfigured && itemToDelete.id) {
      try {
        const { error } = await supabase.from("transactions").delete().eq("id", itemToDelete.id);
        if (!error) await fetchTransactions();
      } catch (e) {
        console.error(e);
      }
    } else {
      setDataRiwayat(dataRiwayat.filter((i) => i.id !== itemToDelete.id));
    }
    setItemToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleEditSave = async (updated) => {
    if (isSupabaseConfigured && updated.id) {
      try {
        const selectedProd = daftarProduk.find(
          (p) => p.code === updated.produkCode || p.id === Number(updated.product_id)
        );
        const productId = selectedProd?.id || updated.product_id || 1;
        const isGramUnit = selectedProd?.unit === "gram";
        const isNominalUnit = selectedProd?.unit === "nominal";

        const dbDate = formatDateForDB(updated.tanggal);
        const numNominal = isNominalUnit && updated.nominalRaw ? parseFloat(updated.nominalRaw) : null;
        const numGram = isGramUnit && updated.gramRaw ? parseFloat(updated.gramRaw) : null;

        const { error } = await supabase
          .from("transactions")
          .update({
            product_id: productId,
            transaction_date: dbDate,
            noa: Number(updated.noa),
            nominal: numNominal,
            gram: numGram,
            updated_at: new Date().toISOString()
          })
          .eq("id", updated.id);

        if (!error) await fetchTransactions();
      } catch (e) {
        console.error(e);
      }
    } else {
      setDataRiwayat(dataRiwayat.map((i) => (i.id === updated.id ? updated : i)));
    }
    setEditModalOpen(false);
    setItemToEdit(null);
  };

  const filteredData = dataRiwayat.filter((i) => {
    const matchSearch =
      (i.tanggal || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.produk || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.pegawaiNama || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchProduct = filterProduk === "ALL" || i.produkCode === filterProduk;
    return matchSearch && matchProduct;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
        <div className="p-3 bg-[#e6f7f6] text-[#009688] rounded-xl">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">RIWAYAT INPUTAN</h2>
          <p className="text-xs text-slate-500 font-medium">Daftar seluruh riwayat inputan yang Anda lakukan</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009688] outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <select
              value={filterProduk}
              onChange={(e) => {
                setFilterProduk(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-hidden"
            >
              <option value="ALL">Semua Produk</option>
              {daftarProduk.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code}
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-500 font-medium">
            Total Data: <strong className="text-slate-800">{filteredData.length}</strong>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-xl relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#00a0a0]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memuat data...</span>
              </div>
            </div>
          )}

          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3 min-w-[40px]">No</th>
                <th className="py-3 px-3 min-w-[90px]">Tanggal</th>
                <th className="py-3 px-3 text-left min-w-[140px]">Nama Referral</th>
                <th className="py-3 px-3 text-left min-w-[120px]">Produk</th>
                <th className="py-3 px-3 min-w-[50px]">NOA</th>
                <th className="py-3 px-3 text-right min-w-[110px]">Nominal (Rp)</th>
                <th className="py-3 px-3 text-right min-w-[80px]">Gram</th>
                <th className="py-3 px-3 min-w-[80px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-slate-500 font-bold">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-3 px-3">{row.tanggal}</td>
                    <td className="py-3 px-3 text-left font-bold text-slate-900">{row.pegawaiNama || "-"}</td>
                    <td className="py-3 px-3 text-left font-bold text-slate-800">{row.produk}</td>
                    <td className="py-3 px-3 font-bold">{row.noa}</td>
                    <td className="py-3 px-3 text-right font-semibold">{row.nominal}</td>
                    <td className="py-3 px-3 text-right font-bold text-amber-600">{row.gram}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => { setItemToEdit(row); setEditModalOpen(true); }}
                          className="p-1.5 text-slate-500 hover:text-[#009688] hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setItemToDelete(row); setDeleteModalOpen(true); }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
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
                  <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">
                    Belum ada riwayat produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 pt-2 gap-3">
          <div>
            Menampilkan {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} produk
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-[#009688] text-white font-bold"
                    : "border border-slate-200 hover:bg-slate-50 font-medium"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemTitle={itemToDelete ? `Transaksi ${itemToDelete.produk}` : "transaksi"}
      />
      <EditTransactionModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        transaction={itemToEdit}
      />
    </div>
  );
}
