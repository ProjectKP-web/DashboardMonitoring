import React, { useState, useEffect } from "react";
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
  Search,
  Loader2
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ConfirmationModal from "../components/ConfirmationModal";
import EditTransactionModal from "../components/EditTransactionModal";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";

// Helper functions for date formatting
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

function getTodayISO() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${y}-${m}-${d}`;
}

export default function InputTransaksi() {
  const { user, profile } = useAuth();
  const { role } = useRole();

  const userRole = profile?.role || role;
  const isKabag = userRole === "kabag" || userRole === "kepala_bagian" || userRole === "kepala" || userRole === "admin" || userRole === "inputer";
  const currentUserId = user?.id || profile?.id;

  // Form State
  const [tanggal, setTanggal] = useState(getTodayISO());
  const [produk, setProduk] = useState("RB");
  const [noa, setNoa] = useState(1);
  const [nominal, setNominal] = useState("");
  const [gram, setGram] = useState("");
  const [keterangan, setKeterangan] = useState("");

  // Loading & Submitting State
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notifications & Modals State
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProduk, setFilterProduk] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Default Master Product Dictionary including QRIS
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

  // Default Master Employee List for Dropdown
  const defaultPegawai = [
    { id: 1, nama: "VANNY" },
    { id: 2, nama: "BETHARI" },
    { id: 3, nama: "ZHARIF" },
    { id: 4, nama: "RIZKY" },
    { id: 5, nama: "LILI" },
    { id: 6, nama: "NISA" },
    { id: 7, nama: "ARDI" },
    { id: 8, nama: "OKTA" },
    { id: 9, nama: "HENDRA" },
    { id: 10, nama: "RICO" },
    { id: 11, nama: "RIAN" },
    { id: 12, nama: "SYAIFUL" },
    { id: 13, nama: "RAHMAD" },
    { id: 14, nama: "SUHADI" }
  ];

  const [daftarPegawai, setDaftarPegawai] = useState(defaultPegawai);
  const [selectedPegawaiId, setSelectedPegawaiId] = useState("");

  const fetchPegawaiFromDB = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase.from("pegawai").select("*").order("nama", { ascending: true });
      if (!error && data && data.length > 0) {
        setDaftarPegawai(data);
      }
    } catch (e) {
      console.error("Error fetching pegawai in InputTransaksi:", e);
    }
  };

  const fetchProductsFromDB = async () => {
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
        console.warn("Error parsing local custom products in InputTransaksi:", e);
      }
    }

    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });
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
    } catch (e) {
      console.error("Error fetching products in InputTransaksi:", e);
    }
  };

  // Transactions list state
  const [riwayat, setRiwayat] = useState([]);

  // Fetch transactions from Supabase
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
        console.error("Error fetching transactions from Supabase:", error);
      } else if (data) {
        const { data: dbPegawai } = await supabase.from("pegawai").select("*");
        const activePegawai = dbPegawai && dbPegawai.length > 0 ? dbPegawai : daftarPegawai;
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
            keterangan: matchMaster?.name || prodCode,
            status: "Tersimpan"
          };
        });
        setRiwayat(formatted);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsFromDB();
    if (isSupabaseConfigured) {
      fetchPegawaiFromDB();
      fetchTransactions();
    } else {
      setRiwayat([
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
        }
      ]);
    }

    const handleProductsUpdated = () => {
      fetchProductsFromDB();
    };

    window.addEventListener("bsi_products_updated", handleProductsUpdated);
    window.addEventListener("storage", handleProductsUpdated);

    return () => {
      window.removeEventListener("bsi_products_updated", handleProductsUpdated);
      window.removeEventListener("storage", handleProductsUpdated);
    };
  }, [user, profile, role]);

  const selectedProductObj = daftarProduk.find((p) => p.code === produk);

  // Form Reset
  const handleReset = () => {
    setSelectedPegawaiId("");
    setTanggal(getTodayISO());
    setProduk("RB");
    setNoa(1);
    setNominal("");
    setGram("");
    setKeterangan("");
  };

  // Form Submit to Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPegawaiId) {
      alert("Silakan pilih Nama Pegawai terlebih dahulu.");
      return;
    }
    if (!tanggal || !produk || !noa || noa <= 0) return;

    const prodInfo = daftarProduk.find((p) => p.code === produk);
    const productId = prodInfo?.id || 1;
    const isGramUnit = prodInfo?.unit === "gram";
    const isNominalUnit = prodInfo?.unit === "nominal";

    const dbDate = formatDateForDB(tanggal);
    const rawNomStr = nominal ? nominal.toString().replace(/\./g, "") : "";
    const numNominal = isNominalUnit && rawNomStr ? parseFloat(rawNomStr) : null;
    const numGram = isGramUnit && gram ? parseFloat(gram) : null;

    // Helper to validate UUID format
    const isValidUUID = (id) => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Resolve valid user_id to satisfy FK constraint (transactions_user_id_fkey)
    let validUserId = user?.id;
    if (!isValidUUID(validUserId)) {
      validUserId = profile?.id;
    }
    if (!isValidUUID(validUserId)) {
      validUserId = "0c8cf587-370b-4ccb-969e-244685919156"; // Fallback to valid profile UUID in Supabase
    }

    if (isSupabaseConfigured) {
      setIsSubmitting(true);
      try {
        const payload = {
          user_id: validUserId,
          product_id: productId,
          pegawai_id: selectedPegawaiId || null,
          transaction_date: dbDate,
          noa: Number(noa),
          nominal: numNominal,
          gram: numGram,
        };

        const { data, error } = await supabase
          .from("transactions")
          .insert([payload])
          .select("*, products(id, name, measurement_type)");

        if (error) {
          console.error("Error inserting transaction into Supabase:", error);
          alert(`Gagal menyimpan transaksi: ${error.message}`);
        } else {
          await fetchTransactions();
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 4000);
          handleReset();
        }
      } catch (err) {
        console.error("Submit error:", err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const formattedNominal = !isGramUnit && nominal ? Number(nominal).toLocaleString("id-ID") : "-";
      const formattedGram = isGramUnit && gram ? Number(gram).toFixed(2).replace(".", ",") : "-";

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
      handleReset();
    }
  };

  // Delete Action in Supabase
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    if (isSupabaseConfigured && itemToDelete.id) {
      try {
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", itemToDelete.id);

        if (error) {
          console.error("Error deleting transaction:", error);
          alert(`Gagal menghapus transaksi: ${error.message}`);
        } else {
          await fetchTransactions();
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    } else {
      setRiwayat(riwayat.filter((item) => item.id !== itemToDelete.id));
    }
    setItemToDelete(null);
    setDeleteModalOpen(false);
  };

  // Edit Save Action in Supabase
  const handleEditSave = async (updatedItem) => {
    if (isSupabaseConfigured && updatedItem.id) {
      try {
        const selectedProd = daftarProduk.find(
          (p) => p.code === updatedItem.produkCode || p.id === Number(updatedItem.product_id)
        );
        const productId = selectedProd?.id || updatedItem.product_id || 1;
        const isGramUnit = selectedProd?.unit === "gram";

        const dbDate = formatDateForDB(updatedItem.tanggal);
        const numNominal = !isGramUnit && updatedItem.nominalRaw ? parseFloat(updatedItem.nominalRaw) : null;
        const numGram = isGramUnit && updatedItem.gramRaw ? parseFloat(updatedItem.gramRaw) : null;

        const { error } = await supabase
          .from("transactions")
          .update({
            product_id: productId,
            transaction_date: dbDate,
            noa: Number(updatedItem.noa),
            nominal: numNominal,
            gram: numGram,
            updated_at: new Date().toISOString()
          })
          .eq("id", updatedItem.id);

        if (error) {
          console.error("Error updating transaction:", error);
          alert(`Gagal memperbarui transaksi: ${error.message}`);
        } else {
          await fetchTransactions();
        }
      } catch (err) {
        console.error("Edit error:", err);
      }
    } else {
      setRiwayat(riwayat.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    }
    setEditModalOpen(false);
    setItemToEdit(null);
  };

  // Filtered dataset
  const filteredRiwayat = riwayat.filter((item) => {
    const matchSearch =
      (item.keterangan || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.produk || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.pegawaiNama || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchProduct = filterProduk === "ALL" || item.produkCode === filterProduk;
    return matchSearch && matchProduct;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredRiwayat.length / itemsPerPage) || 1;
  const paginatedRiwayat = filteredRiwayat.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl shadow-xs flex items-center space-x-3 text-emerald-800 text-sm font-semibold animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Produk berhasil disimpan ke Riwayat Produk Saya.</span>
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
                FORM INPUTAN
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Masukkan data produk yang Anda lakukan
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-400 self-start sm:self-center">
            Dashboard &gt; <span className="text-[#00a0a0]">Input Produk</span>
          </div>
        </div>

        {/* Input Form Grid */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* 1. Nama Referral / Pegawai */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Nama Referral (Pegawai) <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedPegawaiId}
                onChange={(e) => setSelectedPegawaiId(e.target.value)}
                required
                className={`w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0] ${
                  !selectedPegawaiId ? "text-slate-400" : "text-slate-800"
                }`}
              >
                <option value="" disabled hidden>
                  -- Pilih Nama Pegawai --
                </option>
                {daftarPegawai.map((p) => (
                  <option key={p.id} value={p.id} className="text-slate-800">
                    {p.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Tanggal Produk */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Tanggal Produk <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={tanggal}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0] cursor-pointer"
                  required
                />
              </div>
            </div>

            {/* 3. Produk */}
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
                type="text"
                inputMode="numeric"
                value={noa}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setNoa(val);
                }}
                placeholder="1"
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
                disabled={selectedProductObj?.unit !== "nominal"}
                placeholder={selectedProductObj?.unit === "nominal" ? "Contoh: 20.000.000" : "Hanya untuk produk Rupiah"}
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
                placeholder={selectedProductObj?.unit === "gram" ? "Masukkan gram (misal 5.00)" : "Tidak memerlukan gram"}
                className={`w-full px-3.5 py-2.5 border rounded-xl font-bold ${
                  selectedProductObj?.unit === "gram"
                    ? "bg-amber-50/60 border-[#f0b43c] text-amber-900 focus:ring-2 focus:ring-[#f0b43c]"
                    : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              />
            </div>

            {selectedProductObj?.unit === "noa" && (
              <div className="md:col-span-3 bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center space-x-2 text-xs text-purple-700 font-semibold">
                <Info className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Produk <strong>{selectedProductObj?.code}</strong> bersifat <em>NOA Only</em> (hanya memerlukan akumulasi NOA/Jumlah Account, tanpa Nominal Rp atau Gram).</span>
              </div>
            )}

          </div>


          {/* Form Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#00a0a0] hover:bg-[#008888] text-white text-xs font-bold shadow-xs flex items-center space-x-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Transaksi</span>
                </>
              )}
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
              RIWAYAT INPUTAN SAYA
            </h3>
          </div>

          {/* Filters & Actions */}
          <div className="flex items-center space-x-3 self-start md:self-auto">
            <select
              value={filterProduk}
              onChange={(e) => {
                setFilterProduk(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold focus:outline-hidden"
            >
              <option value="ALL">Semua Produk</option>
              {daftarProduk.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Cari produk atau pegawai..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009688] outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="text-slate-500 font-medium">
            Total Data: <strong className="text-slate-800">{filteredRiwayat.length}</strong>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-xl relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#00a0a0]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memuat data produk...</span>
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
                <th className="py-3 px-3 min-w-[110px]">Status</th>
                {isKabag && <th className="py-3 px-3 min-w-[80px]">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRiwayat.length > 0 ? (
                paginatedRiwayat.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 font-medium transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-500">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-3 px-3">{row.tanggal}</td>
                    <td className="py-3 px-3 text-left font-bold text-slate-900">{row.pegawaiNama || "-"}</td>
                    <td className="py-3 px-3 text-left font-bold text-slate-800">{row.produk}</td>
                    <td className="py-3 px-3 font-bold">{row.noa}</td>
                    <td className="py-3 px-3 text-right font-semibold">{row.nominal}</td>
                    <td className="py-3 px-3 text-right font-bold text-amber-600">{row.gram}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={row.status} />
                    </td>
                    {isKabag && (
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
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isKabag ? 9 : 8} className="py-8 text-center text-slate-400 font-medium">
                    Tidak ada data produk yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 pt-2 gap-3">
          <div>
            Menampilkan {filteredRiwayat.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredRiwayat.length)} dari {filteredRiwayat.length} produk
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
