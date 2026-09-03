import React, { useState } from "react";
import { History, Calendar, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import ConfirmationModal from "../components/ConfirmationModal";
import EditTransactionModal from "../components/EditTransactionModal";

export default function RiwayatTransaksi() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const [dataRiwayat, setDataRiwayat] = useState([
    { id: 1, tanggal: "03/09/2026", produk: "RB - Rekening BSI", produkCode: "RB", noa: 2, nominal: "20.000.000", gram: "-", keterangan: "Pembukaan rekening baru", status: "Tersimpan" },
    { id: 2, tanggal: "01/09/2026", produk: "MAXI - Tabungan Maxi", produkCode: "MAXI", noa: 1, nominal: "10.000.000", gram: "-", keterangan: "Setoran awal", status: "Tersimpan" },
    { id: 3, tanggal: "31/08/2026", produk: "Tab Emas", produkCode: "TAB EMAS", noa: 2, nominal: "-", gram: "5,00", keterangan: "Pembelian tab emas", status: "Tersimpan" },
    { id: 4, tanggal: "30/08/2026", produk: "Pembiayaan", produkCode: "PEMBIAYAAN", noa: 1, nominal: "15.000.000", gram: "-", keterangan: "Pembiayaan multiguna", status: "Tersimpan" },
    { id: 5, tanggal: "29/08/2026", produk: "CILEM", produkCode: "CILEM", noa: 1, nominal: "-", gram: "2,00", keterangan: "CICIL EMAS", status: "Tersimpan" }
  ]);

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      setDataRiwayat(dataRiwayat.filter((i) => i.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  const handleEditSave = (updated) => {
    setDataRiwayat(dataRiwayat.map((i) => (i.id === updated.id ? updated : i)));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#e6f7f6] text-[#009688] rounded-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">RIWAYAT TRANSAKSI SAYA</h2>
            <p className="text-xs text-slate-500">Seluruh catatan transaksi harian yang telah diinput pada akun Vanny</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-[#009688]" />
          <span>Periode: September 2026</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009688] outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <button className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Advance</span>
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-xl">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3 text-left">Produk</th>
                <th className="py-3 px-3">NOA</th>
                <th className="py-3 px-3 text-right">Nominal (Rp)</th>
                <th className="py-3 px-3 text-right">Gram</th>
                <th className="py-3 px-3 text-left">Keterangan</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {dataRiwayat.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 text-slate-500 font-bold">{idx + 1}</td>
                  <td className="py-3 px-3">{row.tanggal}</td>
                  <td className="py-3 px-3 text-left font-bold text-slate-800">{row.produk}</td>
                  <td className="py-3 px-3 font-bold">{row.noa}</td>
                  <td className="py-3 px-3 text-right font-semibold">{row.nominal}</td>
                  <td className="py-3 px-3 text-right font-bold text-amber-600">{row.gram}</td>
                  <td className="py-3 px-3 text-left text-slate-600">{row.keterangan}</td>
                  <td className="py-3 px-3"><StatusBadge status={row.status} /></td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => { setItemToEdit(row); setEditModalOpen(true); }}
                        className="p-1.5 text-slate-500 hover:text-[#009688] hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setItemToDelete(row); setDeleteModalOpen(true); }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 pt-2 gap-3">
          <div>Menampilkan 1 - 5 dari 15 transaksi</div>
          <div className="flex items-center space-x-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
            <button className="px-3 py-1.5 rounded-lg bg-[#009688] text-white font-bold">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200">2</button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200">3</button>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
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
