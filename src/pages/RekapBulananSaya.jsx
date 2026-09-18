import React, { useState, useEffect } from "react";
import {
  Calendar,
  Search,
  Eye,
  X,
  Banknote,
  Scale,
  Hash,
  Calculator,
  Loader2,
  User,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const getCurrentPeriode = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

function formatPeriodeLabel(periodeStr) {
  if (!periodeStr || !periodeStr.includes("-")) return "";
  const [y, m] = periodeStr.split("-");
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const idx = parseInt(m, 10) - 1;
  return `${monthNames[idx] || m} ${y}`;
}

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

export default function RekapBulananSaya() {
  const { user, profile } = useAuth();
  const [periode, setPeriode] = useState(getCurrentPeriode);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Employee Modal State
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const defaultMasterProducts = [
    { id: 1, code: "RB", name: "RB - Rekening BSI", unit: "nominal" },
    { id: 2, code: "MAXI", name: "MAXI - Tabungan Maxi", unit: "nominal" },
    { id: 3, code: "ABATANA", name: "ABATANA - Tabungan Abatana", unit: "nominal" },
    { id: 4, code: "TAB EMAS", name: "Tab Emas", unit: "gram" },
    { id: 5, code: "TAB HAJI", name: "Tab Haji - Tabungan Haji", unit: "nominal" },
    { id: 6, code: "PEMBIAYAAN", name: "Pembiayaan", unit: "nominal" },
    { id: 7, code: "CILEM", name: "CILEM - Cicil Emas", unit: "gram" },
    { id: 8, code: "QRIS", name: "QRIS - Merchant QRIS BSI", unit: "noa" }
  ];

  const defaultPegawai = [
    { id: 1, nama: "ARDI" },
    { id: 2, nama: "BETHARI" },
    { id: 3, nama: "HENDRA" },
    { id: 4, nama: "LILI" },
    { id: 5, nama: "NISA" },
    { id: 6, nama: "OKTA" },
    { id: 7, nama: "RAHMAD" },
    { id: 8, nama: "RIAN" },
    { id: 9, nama: "RICO" },
    { id: 10, nama: "RIZKY" },
    { id: 11, nama: "SUHADI" },
    { id: 12, nama: "SYAIFUL" },
    { id: 13, nama: "VANNY" },
    { id: 14, nama: "ZHARIF" }
  ];

  const [masterProducts, setMasterProducts] = useState(defaultMasterProducts);
  const [rekapPegawaiList, setRekapPegawaiList] = useState([]);

  const fetchRecapData = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    try {
      // 1. Fetch products
      const { data: dbProds } = await supabase.from("products").select("*").order("id", { ascending: true });
      let currentMaster = defaultMasterProducts;
      if (dbProds && dbProds.length > 0) {
        currentMaster = dbProds.map((p) => ({
          id: p.id,
          code: p.name,
          name: p.name === "QRIS" ? "QRIS - Merchant QRIS BSI" : p.name,
          unit: p.measurement_type || "nominal"
        }));
        setMasterProducts(currentMaster);
      }

      // 2. Fetch pegawai (A-Z)
      const { data: dbPegawai } = await supabase.from("pegawai").select("*").order("nama", { ascending: true });
      let currentPegawai = defaultPegawai;
      if (dbPegawai && dbPegawai.length > 0) {
        currentPegawai = dbPegawai.map((p) => ({
          id: p.id,
          nama: (p.nama || "").toUpperCase()
        }));
      }

      // 3. Fetch transactions
      const { data: txs } = await supabase
        .from("transactions")
        .select("*, products(id, name, measurement_type), pegawai(id, nama)")
        .order("transaction_date", { ascending: false });

      const filteredTxs = (txs || []).filter((item) => {
        const itemDate = item.transaction_date || "";
        return !periode || itemDate.startsWith(periode);
      });

      // Build employee aggregation
      const list = currentPegawai.map((emp) => {
        const empTxs = filteredTxs.filter(
          (tx) => String(tx.pegawai_id) === String(emp.id)
        );

        let totalNoa = 0;
        let totalNominal = 0;
        let totalGram = 0;

        // Initialize product breakdown map
        const productMap = {};
        currentMaster.forEach((p) => {
          productMap[p.code] = {
            id: p.id,
            code: p.code,
            name: p.name,
            unit: p.unit,
            noa: 0,
            nominal: 0,
            gram: 0
          };
        });

        const transactionsList = [];

        empTxs.forEach((tx) => {
          const noa = Number(tx.noa) || 0;
          const nominal = Number(tx.nominal) || 0;
          const gram = Number(tx.gram) || 0;

          totalNoa += noa;
          totalNominal += nominal;
          totalGram += gram;

          const prodName = (tx.products?.name || "").toUpperCase();
          const matchProd = currentMaster.find(
            (p) => p.id === Number(tx.product_id) || p.code.toUpperCase() === prodName
          );
          const pCode = matchProd?.code || prodName || "RB";

          if (productMap[pCode]) {
            productMap[pCode].noa += noa;
            productMap[pCode].nominal += nominal;
            productMap[pCode].gram += gram;
          }

          transactionsList.push({
            id: tx.id,
            tanggal: formatDateForDisplay(tx.transaction_date),
            rawDate: tx.transaction_date,
            produk: matchProd?.name || prodName,
            produkCode: pCode,
            noa,
            nominal: tx.nominal !== null && tx.nominal !== undefined ? Number(tx.nominal).toLocaleString("id-ID") : "-",
            nominalRaw: tx.nominal,
            gram: tx.gram !== null && tx.gram !== undefined ? Number(tx.gram).toFixed(2).replace(".", ",") : "-",
            gramRaw: tx.gram,
            unit: matchProd?.unit || "nominal"
          });
        });

        return {
          id: emp.id,
          nama: emp.nama,
          totalNoa,
          totalNominal,
          totalGram,
          productMap,
          transactionsList
        };
      });

      setRekapPegawaiList(list);
    } catch (err) {
      console.error("Fetch recap error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchRecapData();
    } else {
      // Offline fallback with mock employee list sorted A-Z
      const offlineList = defaultPegawai.map((emp) => ({
        id: emp.id,
        nama: emp.nama,
        totalNoa: Math.floor(Math.random() * 10) + 1,
        totalNominal: Math.floor(Math.random() * 50) * 1000000,
        totalGram: (Math.random() * 10).toFixed(2),
        productMap: {
          RB: { code: "RB", name: "RB - Rekening BSI", noa: 2, nominal: 20000000, gram: 0, unit: "nominal" },
          MAXI: { code: "MAXI", name: "MAXI - Tabungan Maxi", noa: 1, nominal: 10000000, gram: 0, unit: "nominal" },
          ABATANA: { code: "ABATANA", name: "ABATANA - Tabungan Abatana", noa: 1, nominal: 5000000, gram: 0, unit: "nominal" },
          "TAB EMAS": { code: "TAB EMAS", name: "Tab Emas", noa: 2, nominal: 0, gram: 5.0, unit: "gram" },
          "TAB HAJI": { code: "TAB HAJI", name: "Tab Haji - Tabungan Haji", noa: 1, nominal: 10000000, gram: 0, unit: "nominal" },
          PEMBIAYAAN: { code: "PEMBIAYAAN", name: "Pembiayaan", noa: 1, nominal: 15000000, gram: 0, unit: "nominal" },
          CILEM: { code: "CILEM", name: "CILEM - Cicil Emas", noa: 1, nominal: 0, gram: 2.5, unit: "gram" },
          QRIS: { code: "QRIS", name: "QRIS - Merchant QRIS BSI", noa: 3, nominal: 0, gram: 0, unit: "noa" }
        },
        transactionsList: [
          { id: 1, tanggal: "03/09/2026", produk: "RB - Rekening BSI", produkCode: "RB", noa: 2, nominal: "20.000.000", gram: "-", unit: "nominal" },
          { id: 2, tanggal: "01/09/2026", produk: "MAXI - Tabungan Maxi", produkCode: "MAXI", noa: 1, nominal: "10.000.000", gram: "-", unit: "nominal" }
        ]
      }));
      setRekapPegawaiList(offlineList);
    }
  }, [user, profile, periode]);

  // Filter & Search
  const filteredList = rekapPegawaiList.filter((emp) =>
    emp.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Totals
  const grandTotalNoa = rekapPegawaiList.reduce((acc, curr) => acc + curr.totalNoa, 0);
  const grandTotalNominal = rekapPegawaiList.reduce((acc, curr) => acc + curr.totalNominal, 0);
  const grandTotalGram = rekapPegawaiList.reduce((acc, curr) => acc + Number(curr.totalGram || 0), 0);

  const handleOpenDetail = (emp) => {
    setSelectedEmp(emp);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#e6f5f5] text-[#00a0a0] rounded-xl">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">REKAP BULANAN</h2>
            <p className="text-xs text-slate-500 font-medium">
              Capaian total per pegawai periode {formatPeriodeLabel(periode)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama pegawai..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0] w-full sm:w-48"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-[#00a0a0]" />
            <span>Periode:</span>
            <input
              type="month"
              value={periode}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              onChange={(e) => setPeriode(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#00a0a0]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memuat data rekap pegawai...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Pegawai</th>
                <th className="py-3.5 px-4 text-center">Total NOA</th>
                <th className="py-3.5 px-4 text-right">Total Nominal (Rp)</th>
                <th className="py-3.5 px-4 text-right">Total Gram</th>
                <th className="py-3.5 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                    {searchTerm ? "Tidak ada pegawai yang cocok dengan pencarian." : "Belum ada data pegawai."}
                  </td>
                </tr>
              ) : (
                paginatedList.map((emp, index) => {
                  const noIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => handleOpenDetail(emp)}
                      className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">{noIndex}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 group-hover:text-[#00a0a0] transition-colors flex items-center space-x-2">
                        <User className="w-4 h-4 text-slate-400 group-hover:text-[#00a0a0]" />
                        <span>{emp.nama}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">{emp.totalNoa}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700">
                        {emp.totalNominal > 0 ? `Rp ${emp.totalNominal.toLocaleString("id-ID")}` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-amber-700">
                        {Number(emp.totalGram) > 0 ? `${Number(emp.totalGram).toFixed(2).replace(".", ",")} Gram` : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenDetail(emp)}
                          className="px-2.5 py-1 bg-[#e6f5f5] hover:bg-[#00a0a0] text-[#00a0a0] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 mx-auto cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer Summary */}
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 text-xs font-bold text-slate-800">
              <tr>
                <td colSpan={2} className="py-3.5 px-4 text-left uppercase tracking-wider font-extrabold">
                  TOTAL SELURUH PEGAWAI:
                </td>
                <td className="py-3.5 px-4 text-center text-[#00a0a0] font-black text-sm">{grandTotalNoa}</td>
                <td className="py-3.5 px-4 text-right text-emerald-800 font-black text-sm">
                  {grandTotalNominal > 0 ? `Rp ${grandTotalNominal.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="py-3.5 px-4 text-right text-amber-800 font-black text-sm">
                  {grandTotalGram > 0 ? `${grandTotalGram.toFixed(2).replace(".", ",")} Gram` : "-"}
                </td>
                <td className="py-3.5 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>
            Menampilkan {filteredList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} hingga{" "}
            {Math.min(currentPage * itemsPerPage, filteredList.length)} dari {filteredList.length} Pegawai
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Halaman {currentPage} dari {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Produk Pegawai */}
      {detailModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#00a0a0] text-white rounded-xl shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    DETAIL PRODUK INPUTAN: <span className="text-[#00a0a0]">{selectedEmp.nama}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Periode: <strong className="text-slate-700">{formatPeriodeLabel(periode)}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Product Cards Summary Grid */}
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-tight mb-3 text-xs flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#00a0a0]" />
                  <span>Ringkasan Produk per Kategori</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {masterProducts.map((p) => {
                    const stats = selectedEmp.productMap?.[p.code] || { noa: 0, nominal: 0, gram: 0 };
                    const hasData = stats.noa > 0 || stats.nominal > 0 || stats.gram > 0;
                    return (
                      <div
                        key={p.code}
                        className={`p-2.5 rounded-lg border transition-all ${
                          hasData
                            ? "bg-white border-[#00a0a0]/30 shadow-2xs"
                            : "bg-slate-50/70 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-[10px] text-[#00a0a0] bg-[#e6f5f5] px-1.5 py-0.5 rounded-md">
                            {p.code}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            NOA: <strong className="text-slate-800">{stats.noa}</strong>
                          </span>
                        </div>
                        <div className="font-semibold text-slate-600 text-[10px] truncate mb-0.5">{p.name}</div>
                        {p.unit === "nominal" ? (
                          <div className="font-extrabold text-emerald-700 text-[11px]">
                            {stats.nominal > 0 ? `Rp ${Number(stats.nominal).toLocaleString("id-ID")}` : "-"}
                          </div>
                        ) : p.unit === "gram" ? (
                          <div className="font-extrabold text-amber-700 text-[11px]">
                            {stats.gram > 0 ? `${Number(stats.gram).toFixed(2).replace(".", ",")} Gram` : "-"}
                          </div>
                        ) : (
                          <div className="font-extrabold text-purple-700 text-[11px]">
                            {stats.noa > 0 ? `${stats.noa} Account` : "-"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transactions List Table */}
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-tight mb-3 text-xs flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-[#00a0a0]" />
                  <span>Daftar Transaksi Inputan ({selectedEmp.transactionsList?.length || 0})</span>
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                        <th className="py-2.5 px-3.5 w-10 text-center">No</th>
                        <th className="py-2.5 px-3.5">Tanggal</th>
                        <th className="py-2.5 px-3.5">Produk</th>
                        <th className="py-2.5 px-3.5 text-center">NOA</th>
                        <th className="py-2.5 px-3.5 text-right">Nominal / Gram</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {!selectedEmp.transactionsList || selectedEmp.transactionsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 font-semibold">
                            Belum ada rincian transaksi yang diinput untuk pegawai ini pada periode ini.
                          </td>
                        </tr>
                      ) : (
                        selectedEmp.transactionsList.map((tx, idx) => (
                          <tr key={tx.id || idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3.5 text-center text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3.5 font-semibold text-slate-800">{tx.tanggal}</td>
                            <td className="py-2.5 px-3.5 font-bold text-[#00a0a0]">{tx.produk}</td>
                            <td className="py-2.5 px-3.5 text-center font-bold text-slate-800">{tx.noa}</td>
                            <td className="py-2.5 px-3.5 text-right font-bold">
                              {tx.unit === "gram" ? (
                                <span className="text-amber-700">{tx.gram} Gram</span>
                              ) : tx.unit === "noa" ? (
                                <span className="text-purple-700">{tx.noa} Account</span>
                              ) : (
                                <span className="text-emerald-700">Rp {tx.nominal}</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/80">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

