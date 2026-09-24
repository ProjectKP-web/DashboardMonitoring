import React, { useState, useEffect } from "react";
import {
  Calendar,
  Search,
  FileSpreadsheet,
  FileText,
  Users,
  Banknote,
  Coins,
  Info,
  Loader2,
  Package
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ProductComparisonChart from "../components/ProductComparisonChart";

const getCurrentPeriode = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const formatPeriodeMonthYearUpper = (periodeStr) => {
  if (!periodeStr || !periodeStr.includes("-")) return (periodeStr || "").toUpperCase();
  const [y, m] = periodeStr.split("-");
  const monthNamesId = [
    "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
    "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
  ];
  const idx = parseInt(m, 10) - 1;
  const mName = monthNamesId[idx] || m;
  return `${mName} ${y}`;
};

export default function RekapBulanan({ showChart = false, showKpi = false, isPegawaiView = false }) {
  const { user, profile } = useAuth();

  const [periode, setPeriode] = useState(getCurrentPeriode);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const defaultMasterProducts = [
    { id: 1, code: "RB", name: "RB", unit: "nominal" },
    { id: 2, code: "MAXI", name: "MAXI", unit: "nominal" },
    { id: 3, code: "ABATANA", name: "ABATANA", unit: "nominal" },
    { id: 4, code: "TAB EMAS", name: "TAB EMAS", unit: "gram" },
    { id: 5, code: "TAB HAJI", name: "TAB HAJI", unit: "nominal" },
    { id: 6, code: "PEMBIAYAAN", name: "PEMBIAYAAN", unit: "nominal" },
    { id: 7, code: "CILEM", name: "CILEM", unit: "gram" },
    { id: 8, code: "QRIS", name: "QRIS", unit: "noa" }
  ];

  const [masterProducts, setMasterProducts] = useState(defaultMasterProducts);

  const [kpi, setKpi] = useState({
    totalPegawai: 0,
    totalProduk: 0,
    totalNoa: 0,
    totalNominal: 0,
    totalGram: 0
  });

  const [dataPegawai, setDataPegawai] = useState([]);
  const [grandProductStats, setGrandProductStats] = useState({});
  const [allTransactions, setAllTransactions] = useState([]);

  const fetchMonthlyRecap = async () => {
    // 1. Determine master products
    const saved = localStorage.getItem("bsi_custom_products");
    let currentMaster = defaultMasterProducts;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentMaster = parsed.map((p) => ({
            id: p.id,
            code: p.kode || p.code || p.name,
            name: p.kode || p.name || p.nama,
            unit: p.measurement_type || "nominal"
          }));
        }
      } catch (e) {
        console.warn("Parsing bsi_custom_products error:", e);
      }
    }

    if (!isSupabaseConfigured) {
      setMasterProducts(currentMaster);

      const demoEmployees = [
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

      const demoMatrix = {};
      const grandStats = {};

      currentMaster.forEach((p) => {
        grandStats[p.id] = { noa: 0, nominal: 0, gram: 0 };
      });

      let grandNoa = 0;
      let grandNominal = 0;
      let grandGram = 0;

      demoEmployees.forEach((emp) => {
        demoMatrix[emp.id] = {};
        currentMaster.forEach((p, idx) => {
          const sampleNoa = (emp.id + idx) % 5 + 1;
          const sampleNominal = ((emp.id * 2 + idx) % 8 + 1) * 5000000;
          const sampleGram = Number((((emp.id + idx) % 6 + 1) * 2.5).toFixed(2));

          const stats = {
            noa: sampleNoa,
            nominal: p.unit === "gram" || p.unit === "noa" ? 0 : sampleNominal,
            gram: p.unit === "gram" ? sampleGram : 0
          };

          demoMatrix[emp.id][p.id] = stats;
          grandStats[p.id].noa += stats.noa;
          grandStats[p.id].nominal += stats.nominal;
          grandStats[p.id].gram += stats.gram;

          grandNoa += stats.noa;
          grandNominal += stats.nominal;
          grandGram += stats.gram;
        });
      });

      const tableRows = demoEmployees.map((emp) => ({
        id: emp.id,
        nama: emp.nama,
        pStats: demoMatrix[emp.id] || {}
      }));

      setDataPegawai(tableRows);
      setGrandProductStats(grandStats);
      setKpi({
        totalPegawai: demoEmployees.length,
        totalProduk: currentMaster.length * 5,
        totalNoa: isPegawaiView ? 11 : grandNoa,
        totalNominal: isPegawaiView ? 75000000 : grandNominal,
        totalGram: isPegawaiView ? 30 : Number(grandGram.toFixed(2))
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch DB Products
      const { data: dbProds } = await supabase.from("products").select("*").order("id", { ascending: true });
      if (dbProds && dbProds.length > 0) {
        currentMaster = dbProds.map((p) => ({
          id: p.id,
          code: p.name,
          name: p.name,
          unit: p.measurement_type || "nominal"
        }));
      }
      setMasterProducts(currentMaster);

      // 2. Fetch DB Pegawai
      const { data: dbPegawai } = await supabase.from("pegawai").select("*").order("nama", { ascending: true });
      let employeeList = [];
      if (dbPegawai && dbPegawai.length > 0) {
        employeeList = dbPegawai.map((p) => ({
          id: p.id,
          dbIds: [p.id],
          nama: (p.nama || "PEGAWAI").toUpperCase()
        }));
      } else {
        employeeList = [
          { id: 1, dbIds: [1], nama: "VANNY" },
          { id: 2, dbIds: [2], nama: "BETHARI" },
          { id: 3, dbIds: [3], nama: "ZHARIF" },
          { id: 4, dbIds: [4], nama: "RIZKY" },
          { id: 5, dbIds: [5], nama: "LILI" },
          { id: 6, dbIds: [6], nama: "NISA" },
          { id: 7, dbIds: [7], nama: "ARDI" },
          { id: 8, dbIds: [8], nama: "OKTA" },
          { id: 9, dbIds: [9], nama: "HENDRA" },
          { id: 10, dbIds: [10], nama: "RICO" },
          { id: 11, dbIds: [11], nama: "RIAN" },
          { id: 12, dbIds: [12], nama: "SYAIFUL" },
          { id: 13, dbIds: [13], nama: "RAHMAD" },
          { id: 14, dbIds: [14], nama: "SUHADI" }
        ];
      }

      // 3. Fetch Transactions
      const txQuery = supabase.from("transactions").select("*, products(id, name, measurement_type)");
      const { data: txs } = await txQuery;
      setAllTransactions(txs || []);

      const filteredTxs = (txs || []).filter((item) => {
        const itemDate = item.transaction_date || "";
        return !periode || itemDate.startsWith(periode);
      });

      // 4. Build Matrix
      const matrix = {};
      employeeList.forEach((emp) => {
        matrix[emp.id] = {};
        currentMaster.forEach((p) => {
          matrix[emp.id][p.id] = { noa: 0, nominal: 0, gram: 0 };
        });
      });

      let grandNoa = 0;
      let grandNominal = 0;
      let grandGram = 0;

      const grandStats = {};
      currentMaster.forEach((p) => {
        grandStats[p.id] = { noa: 0, nominal: 0, gram: 0 };
      });

      filteredTxs.forEach((tx) => {
        const prodName = (tx.products?.name || "").toUpperCase();
        const matchProd = currentMaster.find(
          (p) => p.id === Number(tx.product_id) || p.code.toUpperCase() === prodName || p.name.toUpperCase() === prodName
        );
        const pid = matchProd ? matchProd.id : (currentMaster[0]?.id || 1);

        const targetEmp = employeeList.find(
          (e) => String(e.id) === String(tx.pegawai_id) || (e.dbIds && e.dbIds.includes(tx.pegawai_id))
        );

        const noa = Number(tx.noa) || 0;
        const nominal = Number(tx.nominal) || 0;
        const gram = Number(tx.gram) || 0;

        if (targetEmp && matrix[targetEmp.id] && matrix[targetEmp.id][pid]) {
          matrix[targetEmp.id][pid].noa += noa;
          matrix[targetEmp.id][pid].nominal += nominal;
          matrix[targetEmp.id][pid].gram += gram;
        }

        if (grandStats[pid]) {
          grandStats[pid].noa += noa;
          grandStats[pid].nominal += nominal;
          grandStats[pid].gram += gram;
        }

        grandNoa += noa;
        grandNominal += nominal;
        grandGram += gram;
      });

      const tableRows = employeeList.map((emp) => ({
        id: emp.id,
        nama: emp.nama,
        pStats: matrix[emp.id] || {}
      }));

      setDataPegawai(tableRows);
      setGrandProductStats(grandStats);
      setKpi({
        totalPegawai: employeeList.length,
        totalProduk: filteredTxs.length,
        totalNoa: grandNoa,
        totalNominal: grandNominal,
        totalGram: Number(grandGram.toFixed(2))
      });
    } catch (err) {
      console.error("Recap query error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyRecap();

    const handleProductsUpdated = () => {
      fetchMonthlyRecap();
    };

    window.addEventListener("bsi_products_updated", handleProductsUpdated);

    let channel = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel("realtime-rekap-bulanan-dynamic")
        .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => fetchMonthlyRecap())
        .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => fetchMonthlyRecap())
        .subscribe();
    }

    return () => {
      window.removeEventListener("bsi_products_updated", handleProductsUpdated);
      if (channel) supabase.removeChannel(channel);
    };
  }, [periode]);

  // Handle Export Excel dynamically based on masterProducts
  const handleExportExcel = () => {
    if (!dataPegawai || dataPegawai.length === 0) {
      alert("Tidak ada data rekap untuk di-export.");
      return;
    }

    const periodeText = formatPeriodeMonthYearUpper(periode);

    // Title Rows
    const titleRow1 = ["LAPORAN REKAP MONITORING BULANAN"];
    const titleRow2 = [`KANTOR CABANG: KC PEKANBARU SUDIRMAN 1   |   PERIODE: ${periodeText}`];
    const blankRow = [];

    // Row 1 & 2 Headers
    const headerRow1 = ["Nama Referral"];
    const headerRow2 = [""];

    masterProducts.forEach((p) => {
      headerRow1.push(p.name || p.code);
      if (p.unit === "noa") {
        headerRow2.push("NOA");
      } else if (p.unit === "gram") {
        headerRow1.push("");
        headerRow2.push("NOA", "Gram");
      } else {
        headerRow1.push("");
        headerRow2.push("NOA", "Nominal");
      }
    });

    // Data Rows
    const rows = dataPegawai.map((row) => {
      const r = [row.nama || ""];
      masterProducts.forEach((p) => {
        const stats = row.pStats?.[p.id] || { noa: 0, nominal: 0, gram: 0 };
        if (p.unit === "noa") {
          r.push(stats.noa || 0);
        } else if (p.unit === "gram") {
          r.push(stats.noa || 0);
          r.push(stats.gram ? Number(stats.gram).toFixed(2).replace(".", ",") : "0,00");
        } else {
          r.push(stats.noa || 0);
          r.push(stats.nominal ? Number(stats.nominal).toLocaleString("id-ID") : "0");
        }
      });
      return r;
    });

    // Total Row
    const totalLine = ["TOTAL"];
    masterProducts.forEach((p) => {
      const stats = grandProductStats[p.id] || { noa: 0, nominal: 0, gram: 0 };
      if (p.unit === "noa") {
        totalLine.push(stats.noa || 0);
      } else if (p.unit === "gram") {
        totalLine.push(stats.noa || 0);
        totalLine.push(stats.gram ? Number(stats.gram).toFixed(2).replace(".", ",") : "0,00");
      } else {
        totalLine.push(stats.noa || 0);
        totalLine.push(stats.nominal ? Number(stats.nominal).toLocaleString("id-ID") : "0");
      }
    });

    const sheetData = [titleRow1, titleRow2, blankRow, headerRow1, headerRow2, ...rows, totalLine];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Calculate Merges
    const totalCols = headerRow1.length;
    const merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
      { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } }
    ];

    let colIdx = 1;
    masterProducts.forEach((p) => {
      if (p.unit === "noa") {
        merges.push({ s: { r: 3, c: colIdx }, e: { r: 4, c: colIdx } });
        colIdx += 1;
      } else {
        merges.push({ s: { r: 3, c: colIdx }, e: { r: 3, c: colIdx + 1 } });
        colIdx += 2;
      }
    });

    ws["!merges"] = merges;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Bulanan");
    XLSX.writeFile(wb, `Rekap_Bulanan_KC_Pekanbaru_${periodeText.replace(/\s+/g, "_")}.xlsx`);
  };

  // Handle Export PDF dynamically based on masterProducts
  const handleExportPDF = () => {
    if (!dataPegawai || dataPegawai.length === 0) {
      alert("Tidak ada data rekap untuk di-export.");
      return;
    }

    const periodeText = formatPeriodeMonthYearUpper(periode);
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // Header Title
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 160, 160);
    doc.text("LAPORAN REKAP MONITORING BULANAN", 14, 12);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(`KANTOR CABANG: KC PEKANBARU SUDIRMAN 1   |   PERIODE: ${periodeText}`, 14, 17);

    // Dynamic Multi-level Header (2 rows)
    const headRow1 = [{ content: "NAMA REFERRAL", rowSpan: 2, styles: { halign: "left", valign: "middle" } }];
    const headRow2 = [];

    masterProducts.forEach((p) => {
      if (p.unit === "noa") {
        headRow1.push({ content: p.name || p.code, rowSpan: 2, styles: { halign: "center", valign: "middle" } });
      } else if (p.unit === "gram") {
        headRow1.push({ content: p.name || p.code, colSpan: 2, styles: { halign: "center" } });
        headRow2.push({ content: "NOA", styles: { halign: "center" } });
        headRow2.push({ content: "GRAM", styles: { halign: "right" } });
      } else {
        headRow1.push({ content: p.name || p.code, colSpan: 2, styles: { halign: "center" } });
        headRow2.push({ content: "NOA", styles: { halign: "center" } });
        headRow2.push({ content: "NOMINAL", styles: { halign: "right" } });
      }
    });

    const head = [headRow1, headRow2];

    // Data rows
    const body = dataPegawai.map((row) => {
      const r = [row.nama || ""];
      masterProducts.forEach((p) => {
        const stats = row.pStats?.[p.id] || { noa: 0, nominal: 0, gram: 0 };
        if (p.unit === "noa") {
          r.push(stats.noa || 0);
        } else if (p.unit === "gram") {
          r.push(stats.noa || 0);
          r.push(stats.gram ? Number(stats.gram).toFixed(2).replace(".", ",") : "0,00");
        } else {
          r.push(stats.noa || 0);
          r.push(stats.nominal ? Number(stats.nominal).toLocaleString("id-ID") : "0");
        }
      });
      return r;
    });

    // Total Row
    const totalLine = ["TOTAL"];
    masterProducts.forEach((p) => {
      const stats = grandProductStats[p.id] || { noa: 0, nominal: 0, gram: 0 };
      if (p.unit === "noa") {
        totalLine.push(stats.noa || 0);
      } else if (p.unit === "gram") {
        totalLine.push(stats.noa || 0);
        totalLine.push(stats.gram ? Number(stats.gram).toFixed(2).replace(".", ",") : "0,00");
      } else {
        totalLine.push(stats.noa || 0);
        totalLine.push(stats.nominal ? Number(stats.nominal).toLocaleString("id-ID") : "0");
      }
    });
    body.push(totalLine);

    // Dynamic Column Styles
    const columnStyles = {
      0: { halign: "left", fontStyle: "bold" }
    };
    let cIdx = 1;
    masterProducts.forEach((p) => {
      if (p.unit === "noa") {
        columnStyles[cIdx] = { halign: "center" };
        cIdx += 1;
      } else {
        columnStyles[cIdx] = { halign: "center" };
        columnStyles[cIdx + 1] = { halign: "right" };
        cIdx += 2;
      }
    });

    const calculatedFontSize = Math.max(4.5, Math.min(6.5, 90 / (cIdx + 1)));

    autoTable(doc, {
      startY: 21,
      head: head,
      body: body,
      theme: "grid",
      styles: {
        fontSize: calculatedFontSize,
        cellPadding: 1,
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [0, 160, 160],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      columnStyles: columnStyles,
      didParseCell: function (data) {
        if (data.section === "body" && data.row.index === body.length - 1) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = [15, 23, 42];
        }
      }
    });

    doc.save(`Rekap_Bulanan_KC_Pekanbaru_${periodeText.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="space-y-5">
      {/* Header Title & Filter Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            REKAP MONITORING PROGRAM
          </h2>
          <p className="text-sm font-semibold text-slate-500">
            KC PEKANBARU SUDIRMAN 1
          </p>
        </div>

        {/* Periode Filter */}
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 mb-1">Periode</span>
            <div className="relative flex items-center">
              <input
                type="month"
                value={periode}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                onChange={(e) => setPeriode(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg text-sm px-3 py-2 font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#009688] cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={fetchMonthlyRecap}
            disabled={loading}
            className="mt-5 bg-[#00a0a0] hover:bg-[#008888] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Tampilkan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      {showKpi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#e6f5f5] flex items-center justify-center text-[#00a0a0] shrink-0">
              {isPegawaiView ? <Package className="w-6 h-6" /> : <Users className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isPegawaiView ? "TOTAL PRODUK" : "TOTAL PEGAWAI AKTIF"}
              </div>
              {loading ? (
                <div className="h-7 w-16 bg-slate-200/70 animate-pulse rounded-md my-1"></div>
              ) : (
                <div className="text-2xl font-extrabold text-slate-800">
                  {isPegawaiView ? masterProducts.length : kpi.totalPegawai}
                </div>
              )}
              <div className="text-xs font-semibold text-[#00a0a0]">
                {isPegawaiView ? "Produk" : "Pegawai"}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#f0b43c] bg-amber-50 flex items-center justify-center text-[#f0b43c] shrink-0 font-bold text-xs">
              NOA
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                TOTAL NOA
              </div>
              {loading ? (
                <div className="h-7 w-16 bg-slate-200/70 animate-pulse rounded-md my-1"></div>
              ) : (
                <div className="text-2xl font-extrabold text-slate-800">{kpi.totalNoa}</div>
              )}
              <div className="text-xs font-semibold text-slate-500">NOA</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#e6f5f5] flex items-center justify-center text-[#00a0a0] shrink-0">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                TOTAL NOMINAL
              </div>
              {loading ? (
                <div className="h-7 w-32 bg-slate-200/70 animate-pulse rounded-md my-1"></div>
              ) : (
                <div className="text-xl font-extrabold text-slate-800">
                  Rp {Number(kpi.totalNominal).toLocaleString("id-ID")}
                </div>
              )}
              <div className="text-xs font-semibold text-[#00a0a0]">Nominal</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                TOTAL GRAM
              </div>
              {loading ? (
                <div className="h-7 w-20 bg-slate-200/70 animate-pulse rounded-md my-1"></div>
              ) : (
                <div className="text-2xl font-extrabold text-slate-800">
                  {Number(kpi.totalGram).toFixed(2).replace(".", ",")}
                </div>
              )}
              <div className="text-xs font-semibold text-amber-600">Gram</div>
            </div>
          </div>
        </div>
      )}

      {/* Product Comparison Chart */}
      {showChart && (
        <ProductComparisonChart
          masterProducts={masterProducts}
          allTransactions={allTransactions}
          periode={periode}
        />
      )}

      {/* Main Data Section: REKAP PER PEGAWAI */}
      <div className="bg-[#ffffff] rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#00a0a0]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memuat rekap bulanan...</span>
            </div>
          </div>
        )}

        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">
            REKAP PER PEGAWAI
          </h3>

          {/* Export Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportExcel}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Scrollable Dynamic Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              {/* Row 1 Header - Dynamic Products */}
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th
                  rowSpan={2}
                  className="py-3 px-4 text-left border-r border-slate-200 align-middle font-bold text-slate-700 whitespace-nowrap min-w-[240px]"
                >
                  Nama Referral
                </th>
                {masterProducts.map((p) => (
                  <th
                    key={p.id}
                    colSpan={p.unit === "noa" ? 1 : 2}
                    className="py-2.5 px-2 border-r border-slate-200 uppercase align-middle"
                  >
                    {p.name || p.code}
                  </th>
                ))}
              </tr>
              {/* Row 2 Sub-Header - Dynamic Units */}
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                {masterProducts.map((p) =>
                  p.unit === "noa" ? (
                    <th key={`${p.id}-sub`} className="py-2 px-2 border-r border-slate-200 min-w-[55px]">
                      NOA
                    </th>
                  ) : p.unit === "gram" ? (
                    <React.Fragment key={p.id}>
                      <th className="py-2 px-2 border-r border-slate-200 min-w-[50px]">NOA</th>
                      <th className="py-2 px-2 border-r border-slate-200 min-w-[85px]">Gram</th>
                    </React.Fragment>
                  ) : (
                    <React.Fragment key={p.id}>
                      <th className="py-2 px-2 border-r border-slate-200 min-w-[50px]">NOA</th>
                      <th className="py-2 px-2 border-r border-slate-200 min-w-[115px]">Nominal</th>
                    </React.Fragment>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {dataPegawai
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((row) => (
                  <tr
                    key={row.id || row.nama}
                    className="hover:bg-slate-50/80 transition-colors font-medium"
                  >
                    <td className="py-2.5 px-4 text-left font-bold text-slate-800 border-r border-slate-100 whitespace-nowrap">
                      {row.nama}
                    </td>
                    {masterProducts.map((p) => {
                      const stats = row.pStats?.[p.id] || {};
                      if (p.unit === "noa") {
                        return (
                          <td key={p.id} className="py-2.5 px-2 border-r border-slate-100 font-bold text-slate-800">
                            {stats.noa || "-"}
                          </td>
                        );
                      }
                      if (p.unit === "gram") {
                        return (
                          <React.Fragment key={p.id}>
                            <td className="py-2.5 px-2 border-r border-slate-100">{stats.noa || "-"}</td>
                            <td className="py-2.5 px-2 border-r border-slate-100">
                              {stats.gram ? Number(stats.gram).toFixed(2).replace(".", ",") : "-"}
                            </td>
                          </React.Fragment>
                        );
                      }
                      return (
                        <React.Fragment key={p.id}>
                          <td className="py-2.5 px-2 border-r border-slate-100">{stats.noa || "-"}</td>
                          <td className="py-2.5 px-2 border-r border-slate-100">
                            {stats.nominal ? Number(stats.nominal).toLocaleString("id-ID") : "-"}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}

              {/* DYNAMIC TOTAL ROW */}
              <tr className="bg-[#e6f5f5] font-extrabold text-[#008888] border-t-2 border-slate-200">
                <td className="py-3 px-4 text-left border-r border-slate-200 font-black">
                  TOTAL
                </td>
                {masterProducts.map((p) => {
                  const stats = grandProductStats[p.id] || {};
                  if (p.unit === "noa") {
                    return (
                      <td key={p.id} className="py-3 px-2 border-r border-slate-200 font-black">
                        {stats.noa || "-"}
                      </td>
                    );
                  }
                  if (p.unit === "gram") {
                    return (
                      <React.Fragment key={p.id}>
                        <td className="py-3 px-2 border-r border-slate-200">{stats.noa || "-"}</td>
                        <td className="py-3 px-2 border-r border-slate-200">
                          {stats.gram ? Number(stats.gram).toFixed(2).replace(".", ",") : "-"}
                        </td>
                      </React.Fragment>
                    );
                  }
                  return (
                    <React.Fragment key={p.id}>
                      <td className="py-3 px-2 border-r border-slate-200">{stats.noa || "-"}</td>
                      <td className="py-3 px-2 border-r border-slate-200">
                        {stats.nominal ? Number(stats.nominal).toLocaleString("id-ID") : "-"}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Disclaimer & Pagination */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Menampilkan <strong className="text-slate-800">{dataPegawai.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> - <strong className="text-slate-800">{Math.min(currentPage * itemsPerPage, dataPegawai.length)}</strong> dari <strong className="text-slate-800">{dataPegawai.length}</strong> pegawai
            </span>
          </div>

          {Math.ceil(dataPegawai.length / itemsPerPage) > 1 && (
            <div className="flex items-center space-x-1.5 self-end sm:self-auto">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Sebelumnya
              </button>
              {Array.from({ length: Math.ceil(dataPegawai.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(dataPegawai.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(dataPegawai.length / itemsPerPage)}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
