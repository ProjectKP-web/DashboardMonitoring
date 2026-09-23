import { useState, useEffect } from "react";
import {
  Package,
  Banknote,
  Scale,
  Hash,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";

export default function Produk() {
  const { profile } = useAuth();
  const { role } = useRole();

  const userRole = profile?.role || role;
  const isKabag =
    userRole === "kabag" ||
    userRole === "kepala_bagian" ||
    userRole === "kepala" ||
    userRole === "admin" ||
    userRole === "inputer";

  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKode, setNewKode] = useState("");
  const [newDeskripsi, setNewDeskripsi] = useState("");
  const [newSatuan, setNewSatuan] = useState("nominal");
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editKode, setEditKode] = useState("");
  const [editDeskripsi, setEditDeskripsi] = useState("");
  const [editSatuan, setEditSatuan] = useState("nominal");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

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

  const showToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const defaultFallback = [
    { id: 1, kode: "RB", nama: "RB - Rekening BSI", satuan: "Nominal (Rp)", measurement_type: "nominal", deskripsi: "Program Tabungan Rupiah Berhadiah / Regular" },
    { id: 2, kode: "MAXI", nama: "MAXI - Tabungan Maxi", satuan: "Nominal (Rp)", measurement_type: "nominal", deskripsi: "Program Deposito Berjangka Nisbah Kompetitif" },
    { id: 3, kode: "ABATANA", nama: "ABATANA - Tabungan Abatana", satuan: "Nominal (Rp)", measurement_type: "nominal", deskripsi: "Program Simpanan Wadiah Abatana" },
    { id: 4, kode: "TAB EMAS", nama: "Tab Emas", satuan: "Gram", measurement_type: "gram", deskripsi: "Program Kepemilikan & Investasi Emas Syariah" },
    { id: 5, kode: "TAB HAJI", nama: "Tab Haji - Tabungan Haji", satuan: "Nominal (Rp)", measurement_type: "nominal", deskripsi: "Setoran Porsi Haji & Tabungan Haji Mabrur" },
    { id: 6, kode: "PEMBIAYAAN", nama: "Pembiayaan", satuan: "Nominal (Rp)", measurement_type: "nominal", deskripsi: "Pencairan Pembiayaan Griya / OTO / Mitraguna" },
    { id: 7, kode: "CILEM", nama: "CILEM - Cicil Emas", satuan: "Gram", measurement_type: "gram", deskripsi: "Program Akad Murabahah Cicil Emas Batangan" },
    { id: 8, kode: "QRIS", nama: "QRIS - Merchant QRIS BSI", satuan: "NOA Only", measurement_type: "noa", deskripsi: "Program Transaksi & Perolehan Merchant QRIS BSI" }
  ];

  const saveLocalProducts = (list) => {
    setProdukList(list);
    try {
      localStorage.setItem("bsi_custom_products", JSON.stringify(list));
      window.dispatchEvent(new Event("bsi_products_updated"));
    } catch (e) {
      console.warn("Failed to write products to localStorage:", e);
    }
  };

  const useFallback = () => {
    const saved = localStorage.getItem("bsi_custom_products");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProdukList(parsed);
          return;
        }
      } catch (e) {
        console.warn("Error parsing local products:", e);
      }
    }
    saveLocalProducts(defaultFallback);
  };

  const fetchProducts = async () => {
    if (!isSupabaseConfigured) {
      useFallback();
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error || !data || data.length === 0) {
        useFallback();
      } else {
        const savedDescriptions = JSON.parse(localStorage.getItem("bsi_custom_descriptions") || "{}");

        const formatted = data.map((item) => {
          let unitLabel = "Nominal (Rp)";
          if (item.measurement_type === "gram") unitLabel = "Gram";
          else if (item.measurement_type === "noa") unitLabel = "NOA Only";

          const desc = item.description || savedDescriptions[item.name] || productDescriptions[item.name] || `Program Transaksi ${item.name}`;

          return {
            id: item.id,
            kode: item.name,
            nama: item.name === "QRIS" ? "Merchant QRIS BSI" : desc || item.name,
            satuan: unitLabel,
            measurement_type: item.measurement_type || "nominal",
            deskripsi: desc
          };
        });
        setProdukList(formatted);
        // Sync local storage cache as well
        try {
          localStorage.setItem("bsi_custom_products", JSON.stringify(formatted));
          window.dispatchEvent(new Event("bsi_products_updated"));
        } catch (e) {
          console.warn("Failed caching products to localStorage:", e);
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      useFallback();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const handleUpdate = () => fetchProducts();
    window.addEventListener("bsi_products_updated", handleUpdate);
    return () => {
      window.removeEventListener("bsi_products_updated", handleUpdate);
    };
  }, []);

  // Safe Helper for Insert
  const safeInsertProduct = async (name, measurement_type, description) => {
    // 1. Try insert with description column first
    const { data, error } = await supabase
      .from("products")
      .insert([{ name, description, measurement_type }])
      .select();

    if (error && (error.message.includes("description") || error.code === "PGRST204" || error.code === "42703")) {
      // 2. Retry without description column if description column doesn't exist in Supabase schema
      return await supabase
        .from("products")
        .insert([{ name, measurement_type }])
        .select();
    }
    return { data, error };
  };

  // Safe Helper for Update
  const safeUpdateProduct = async (id, name, measurement_type, description) => {
    // 1. Try update with description column first
    const { error } = await supabase
      .from("products")
      .update({ name, description, measurement_type })
      .eq("id", id);

    if (error && (error.message.includes("description") || error.code === "PGRST204" || error.code === "42703")) {
      // 2. Retry without description column if description column doesn't exist in Supabase schema
      return await supabase
        .from("products")
        .update({ name, measurement_type })
        .eq("id", id);
    }
    return { error };
  };

  // Handle Add Product
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const trimmedKode = newKode.trim().toUpperCase();
    const trimmedDeskripsi = newDeskripsi.trim();
    if (!trimmedKode) return;

    let unitLabel = "Nominal (Rp)";
    if (newSatuan === "gram") unitLabel = "Gram";
    else if (newSatuan === "noa") unitLabel = "NOA Only";

    // Save description to local descriptions map
    try {
      const savedDescriptions = JSON.parse(localStorage.getItem("bsi_custom_descriptions") || "{}");
      savedDescriptions[trimmedKode] = trimmedDeskripsi || `Program Transaksi ${trimmedKode}`;
      localStorage.setItem("bsi_custom_descriptions", JSON.stringify(savedDescriptions));
    } catch (err) {}

    if (!isSupabaseConfigured) {
      const newObj = {
        id: Date.now(),
        kode: trimmedKode,
        nama: trimmedKode,
        satuan: unitLabel,
        measurement_type: newSatuan,
        deskripsi: trimmedDeskripsi || `Program ${trimmedKode}`
      };
      saveLocalProducts([...produkList, newObj]);
      showToast(`Produk "${trimmedKode}" berhasil ditambahkan (Mode Demo).`);
      setNewKode("");
      setNewDeskripsi("");
      setNewSatuan("nominal");
      setIsAddModalOpen(false);
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const { error } = await safeInsertProduct(
        trimmedKode,
        newSatuan,
        trimmedDeskripsi || `Program ${trimmedKode}`
      );

      if (error) {
        console.error("Error adding product:", error);
        showToast(`Gagal menambah produk: ${error.message}`, "error");
      } else {
        await fetchProducts();
        showToast(`Produk "${trimmedKode}" berhasil ditambahkan.`);
        setNewKode("");
        setNewDeskripsi("");
        setNewSatuan("nominal");
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error("Add product error:", err);
      showToast("Terjadi kesalahan saat menambah produk.", "error");
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Handle Edit Product
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    const trimmedKode = editKode.trim().toUpperCase();
    const trimmedDeskripsi = editDeskripsi.trim();
    if (!trimmedKode) return;

    let unitLabel = "Nominal (Rp)";
    if (editSatuan === "gram") unitLabel = "Gram";
    else if (editSatuan === "noa") unitLabel = "NOA Only";

    // Save description to local descriptions map
    try {
      const savedDescriptions = JSON.parse(localStorage.getItem("bsi_custom_descriptions") || "{}");
      savedDescriptions[trimmedKode] = trimmedDeskripsi || `Program Transaksi ${trimmedKode}`;
      localStorage.setItem("bsi_custom_descriptions", JSON.stringify(savedDescriptions));
    } catch (err) {}

    if (!isSupabaseConfigured) {
      const updatedList = produkList.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              kode: trimmedKode,
              nama: trimmedKode,
              satuan: unitLabel,
              measurement_type: editSatuan,
              deskripsi: trimmedDeskripsi || `Program ${trimmedKode}`
            }
          : item
      );
      saveLocalProducts(updatedList);
      showToast(`Produk "${trimmedKode}" berhasil diperbarui (Mode Demo).`);
      setIsEditModalOpen(false);
      setEditingItem(null);
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const { error } = await safeUpdateProduct(
        editingItem.id,
        trimmedKode,
        editSatuan,
        trimmedDeskripsi || `Program ${trimmedKode}`
      );

      if (error) {
        console.error("Error updating product:", error);
        showToast(`Gagal memperbarui produk: ${error.message}`, "error");
      } else {
        await fetchProducts();
        showToast(`Produk "${trimmedKode}" berhasil diperbarui.`);
        setIsEditModalOpen(false);
        setEditingItem(null);
      }
    } catch (err) {
      console.error("Edit product error:", err);
      showToast("Terjadi kesalahan saat memperbarui produk.", "error");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete Product Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    if (!isSupabaseConfigured) {
      const updatedList = produkList.filter((item) => item.id !== deletingItem.id);
      saveLocalProducts(updatedList);
      showToast(`Produk "${deletingItem.kode}" berhasil dihapus (Mode Demo).`);
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
      return;
    }

    setIsSubmittingDelete(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", deletingItem.id);

      if (error) {
        console.error("Error deleting product:", error);
        if (error.code === "23503") {
          showToast(
            `Produk "${deletingItem.kode}" tidak dapat dihapus karena tercatat pada data transaksi.`,
            "error"
          );
        } else {
          showToast(`Gagal menghapus produk: ${error.message}`, "error");
        }
      } else {
        await fetchProducts();
        showToast(`Produk "${deletingItem.kode}" berhasil dihapus.`);
      }
    } catch (err) {
      console.error("Delete product error:", err);
      showToast("Terjadi kesalahan saat menghapus produk.", "error");
    } finally {
      setIsSubmittingDelete(false);
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl shadow-xs flex items-center space-x-3 text-xs font-bold animate-in fade-in duration-300 border ${
            toastType === "error"
              ? "bg-rose-50 border-rose-300 text-rose-800"
              : "bg-emerald-50 border-emerald-300 text-emerald-800"
          }`}
        >
          {toastType === "error" ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        {/* Action Controls */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#009688]" : ""}`} />
          </button>

          {isKabag && (
            <button
              onClick={() => {
                setNewKode("");
                setNewDeskripsi("");
                setNewSatuan("nominal");
                setIsAddModalOpen(true);
              }}
              className="bg-[#00a0a0] hover:bg-[#008888] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
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
          <div
            key={prod.id || prod.kode}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-[#009688] bg-[#e6f7f6] px-3 py-1 rounded-lg">
                  {prod.kode}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                    prod.satuan.includes("Gram")
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : prod.satuan.includes("NOA")
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
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

            {/* Kabag Edit / Delete Actions */}
            {isKabag && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditingItem(prod);
                    setEditKode(prod.kode);
                    setEditDeskripsi(prod.deskripsi);
                    setEditSatuan(prod.measurement_type || (prod.satuan.includes("Gram") ? "gram" : prod.satuan.includes("NOA") ? "noa" : "nominal"));
                    setIsEditModalOpen(true);
                  }}
                  className="p-1.5 text-slate-500 hover:text-[#009688] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 text-xs font-medium"
                  title="Edit Produk"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setDeletingItem(prod);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 text-xs font-medium"
                  title="Hapus Produk"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Tambah Produk */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center space-x-2">
                <Plus className="w-4 h-4 text-[#00a0a0]" />
                <span>Tambah Produk Baru</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kode Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newKode}
                  onChange={(e) => setNewKode(e.target.value)}
                  placeholder="Contoh: TAB_PENSEN, DEPOSITO_SYARIAH"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold uppercase text-slate-800 focus:ring-2 focus:ring-[#00a0a0] outline-hidden"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Produk
                </label>
                <input
                  type="text"
                  value={newDeskripsi}
                  onChange={(e) => setNewDeskripsi(e.target.value)}
                  placeholder="Contoh: Program Tabungan Pensiun BSI Syariah"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#00a0a0] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tipe Satuan / Pengukuran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newSatuan}
                  onChange={(e) => setNewSatuan(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-[#00a0a0] outline-hidden bg-white"
                >
                  <option value="nominal">Nominal (Rp) - Menggunakan Nilai Rupiah</option>
                  <option value="gram">Gram - Menggunakan Berat Emas (Gram)</option>
                  <option value="noa">NOA Only - Akumulasi Jumlah Account Sahaja</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmittingAdd}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-4 py-2 rounded-xl bg-[#00a0a0] hover:bg-[#008888] text-white font-bold cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isSubmittingAdd && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Produk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Produk */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-[#00a0a0]" />
                <span>Edit Data Produk</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kode Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editKode}
                  onChange={(e) => setEditKode(e.target.value)}
                  placeholder="Kode Produk..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold uppercase text-slate-800 focus:ring-2 focus:ring-[#00a0a0] outline-hidden"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi Produk
                </label>
                <input
                  type="text"
                  value={editDeskripsi}
                  onChange={(e) => setEditDeskripsi(e.target.value)}
                  placeholder="Deskripsi produk..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#00a0a0] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tipe Satuan / Pengukuran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editSatuan}
                  onChange={(e) => setEditSatuan(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-[#00a0a0] outline-hidden bg-white"
                >
                  <option value="nominal">Nominal (Rp) - Menggunakan Nilai Rupiah</option>
                  <option value="gram">Gram - Menggunakan Berat Emas (Gram)</option>
                  <option value="noa">NOA Only - Akumulasi Jumlah Account Sahaja</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 rounded-xl bg-[#00a0a0] hover:bg-[#008888] text-white font-bold cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isSubmittingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Perbarui Produk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus Produk Confirmation */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase">Hapus Produk</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus produk{" "}
                <strong className="text-slate-800">"{deletingItem.kode}"</strong> dari database?
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmittingDelete}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmittingDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                {isSubmittingDelete && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
