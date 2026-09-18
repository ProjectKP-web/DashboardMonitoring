import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Loader2,
  RefreshCw,
  UserPlus,
  UserCheck,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export default function Pegawai() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pegawaiList, setPegawaiList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' | 'error'

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNama, setNewNama] = useState("");
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const showToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const fetchPegawaiFromDB = async () => {
    if (!isSupabaseConfigured) {
      setPegawaiList([
        { id: 26, nama: "BETHARI RESTUTI" },
        { id: 1, nama: "MUHAMMAD ARDIANSYAH" },
        { id: 2, nama: "OKTAVIANDA" },
        { id: 3, nama: "RENI FADHILA NOOR" },
        { id: 30, nama: "VANNY VANESSA" }
      ]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pegawai")
        .select("*")
        .order("nama", { ascending: true });

      if (error) {
        console.error("Error fetching pegawai from Supabase:", error);
        showToast("Gagal memuat data pegawai dari database.", "error");
        setPegawaiList([]);
      } else if (data) {
        setPegawaiList(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setPegawaiList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPegawaiFromDB();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle Create Pegawai
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newNama.trim();
    if (!trimmed) return;

    if (!isSupabaseConfigured) {
      const newObj = { id: Date.now(), nama: trimmed.toUpperCase() };
      setPegawaiList((prev) => [...prev, newObj].sort((a, b) => a.nama.localeCompare(b.nama)));
      showToast("Pegawai berhasil ditambahkan (Mode Demo).");
      setNewNama("");
      setIsAddModalOpen(false);
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const { error } = await supabase
        .from("pegawai")
        .insert([{ nama: trimmed.toUpperCase() }]);

      if (error) {
        console.error("Error adding pegawai:", error);
        showToast(`Gagal menambah pegawai: ${error.message}`, "error");
      } else {
        await fetchPegawaiFromDB();
        showToast(`Pegawai "${trimmed.toUpperCase()}" berhasil ditambahkan.`);
        setNewNama("");
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error("Add pegawai error:", err);
      showToast("Terjadi kesalahan saat menambah pegawai.", "error");
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Handle Edit Pegawai
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    const trimmed = editNama.trim();
    if (!trimmed) return;

    if (!isSupabaseConfigured) {
      setPegawaiList((prev) =>
        prev
          .map((item) => (item.id === editingItem.id ? { ...item, nama: trimmed.toUpperCase() } : item))
          .sort((a, b) => a.nama.localeCompare(b.nama))
      );
      showToast("Data pegawai berhasil diperbarui (Mode Demo).");
      setIsEditModalOpen(false);
      setEditingItem(null);
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const { error } = await supabase
        .from("pegawai")
        .update({ nama: trimmed.toUpperCase() })
        .eq("id", editingItem.id);

      if (error) {
        console.error("Error updating pegawai:", error);
        showToast(`Gagal memperbarui pegawai: ${error.message}`, "error");
      } else {
        await fetchPegawaiFromDB();
        showToast("Data pegawai berhasil diperbarui.");
        setIsEditModalOpen(false);
        setEditingItem(null);
      }
    } catch (err) {
      console.error("Edit pegawai error:", err);
      showToast("Terjadi kesalahan saat memperbarui pegawai.", "error");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete Pegawai
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    if (!isSupabaseConfigured) {
      setPegawaiList((prev) => prev.filter((item) => item.id !== deletingItem.id));
      showToast("Pegawai berhasil dihapus (Mode Demo).");
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
      return;
    }

    setIsSubmittingDelete(true);
    try {
      const { error } = await supabase
        .from("pegawai")
        .delete()
        .eq("id", deletingItem.id);

      if (error) {
        console.error("Error deleting pegawai:", error);
        if (error.code === "23503") {
          showToast(
            `Pegawai "${deletingItem.nama}" tidak dapat dihapus karena tercatat dalam transaksi/produk.`,
            "error"
          );
        } else {
          showToast(`Gagal menghapus pegawai: ${error.message}`, "error");
        }
      } else {
        await fetchPegawaiFromDB();
        showToast(`Pegawai "${deletingItem.nama}" berhasil dihapus.`);
      }
    } catch (err) {
      console.error("Delete pegawai error:", err);
      showToast("Terjadi kesalahan saat menghapus pegawai.", "error");
    } finally {
      setIsSubmittingDelete(false);
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    }
  };

  // Filtering
  const filteredPegawai = pegawaiList.filter((p) =>
    (p.nama || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredPegawai.length / itemsPerPage) || 1;
  const paginatedPegawai = filteredPegawai.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Master Data Pegawai Referral</h2>
            <p className="text-xs text-slate-500 font-medium">
              Data pegawai terdaftar KC PEKANBARU SUDIRMAN 1
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={fetchPegawaiFromDB}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#009688]" : ""}`} />
          </button>

          <button
            onClick={() => {
              setNewNama("");
              setIsAddModalOpen(true);
            }}
            className="bg-[#00a0a0] hover:bg-[#008888] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Pegawai</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        {/* Search Bar & Total Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Cari nama pegawai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009688] outline-hidden text-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="text-slate-500 font-medium">
            Total Ditemukan: <strong className="text-slate-800">{filteredPegawai.length}</strong> pegawai
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-xl relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#00a0a0]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memuat data pegawai...</span>
              </div>
            </div>
          )}

          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-16 text-center">No</th>
                <th className="py-3 px-4">Nama Pegawai</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedPegawai.length > 0 ? (
                paginatedPegawai.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-semibold text-slate-500">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.nama}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(p);
                            setEditNama(p.nama);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#009688] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Nama Pegawai"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingItem(p);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Pegawai"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-400 font-medium">
                    Belum ada data pegawai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Footer */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan <strong className="text-slate-800">{filteredPegawai.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> - <strong className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredPegawai.length)}</strong> dari <strong className="text-slate-800">{filteredPegawai.length}</strong> pegawai
          </div>

          {totalPages > 1 && (
            <div className="flex items-center space-x-1.5 self-end sm:self-auto">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentPage === page
                      ? "bg-[#00a0a0] text-white"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Tambah Pegawai */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-[#00a0a0]" />
                <span>Tambah Pegawai Baru</span>
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
                  Nama Pegawai / Referral <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Masukkan nama pegawai..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold uppercase text-slate-800 focus:ring-2 focus:ring-[#00a0a0] outline-hidden"
                  required
                  autoFocus
                />
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
                  <span>Simpan Pegawai</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Pegawai */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-[#00a0a0]" />
                <span>Edit Nama Pegawai</span>
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
                  Nama Pegawai / Referral <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  placeholder="Edit nama pegawai..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold uppercase text-slate-800 focus:ring-2 focus:ring-[#00a0a0] outline-hidden"
                  required
                  autoFocus
                />
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
                  <span>Perbarui</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus Pegawai Confirmation */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase">Hapus Pegawai</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus pegawai{" "}
                <strong className="text-slate-800">"{deletingItem.nama}"</strong> dari database?
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
