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
  Loader2
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import * as XLSX from "xlsx";

const getCurrentPeriode = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export default function RekapBulanan() {
  const [periode, setPeriode] = useState(getCurrentPeriode);
  const [loading, setLoading] = useState(false);

  const masterProducts = [
    { id: 1, code: "RB", name: "RB", unit: "nominal" },
    { id: 2, code: "MAXI", name: "MAXI", unit: "nominal" },
    { id: 3, code: "ABATANA", name: "ABATANA", unit: "nominal" },
    { id: 4, code: "TAB EMAS", name: "TAB EMAS", unit: "gram" },
    { id: 5, code: "TAB HAJI", name: "TAB HAJI", unit: "nominal" },
    { id: 6, code: "PEMBIAYAAN", name: "PEMBIAYAAN", unit: "nominal" },
    { id: 7, code: "CILEM", name: "CILEM", unit: "gram" }
  ];

  const [kpi, setKpi] = useState({
    totalPegawai: 14,
    totalNoa: 185,
    totalNominal: 1248500000,
    totalGram: 236.5
  });

  const [dataPegawai, setDataPegawai] = useState([]);

  const [totalRow, setTotalRow] = useState({
    nama: "TOTAL",
    rbNoa: 0,
    rbNom: "0",
    maxiNoa: 0,
    maxiNom: "0",
    abatanaNoa: 0,
    abatanaNom: "0",
    emasNoa: 0,
    emasGram: "0,00",
    hajiNoa: 0,
    hajiNom: "0",
    pembiayaanNoa: 0,
    pembiayaanNom: "0",
    cilemNoa: 0,
    cilemGram: "0,00"
  });

  const fetchMonthlyRecap = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    try {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: txs } = await supabase.from("transactions").select("*, products(id, name, measurement_type)");

      const filteredTxs = (txs || []).filter((item) => {
        const itemDate = item.transaction_date || "";
        return !periode || itemDate.startsWith(periode);
      });

      // Build employee list directly from database profiles
      let employeeList = [];
      if (profiles && profiles.length > 0) {
        employeeList = profiles.map((p) => ({
          id: p.id,
          dbIds: [p.id],
          nama: (p.full_name || p.email?.split("@")[0] || "PEGAWAI").toUpperCase()
        }));
      } else {
        employeeList = [
          { id: "vanny", dbIds: ["0c8cf587-370b-4ccb-969e-244685919156", "demo-user-id"], nama: "VANNY" },
          { id: "bethari", dbIds: [], nama: "BETHARI" },
          { id: "zharif", dbIds: [], nama: "ZHARIF" },
          { id: "rizky", dbIds: [], nama: "RIZKY" },
          { id: "lili", dbIds: [], nama: "LILI" },
          { id: "nisa", dbIds: [], nama: "NISA" },
          { id: "ardi", dbIds: [], nama: "ARDI" },
          { id: "okta", dbIds: [], nama: "OKTA" },
          { id: "hendra", dbIds: [], nama: "HENDRA" },
          { id: "rico", dbIds: [], nama: "RICO" },
          { id: "rian", dbIds: [], nama: "RIAN" },
          { id: "syaiful", dbIds: [], nama: "SYAIFUL" },
          { id: "rahmad", dbIds: [], nama: "RAHMAD" },
          { id: "suhadi", dbIds: [], nama: "SUHADI" }
        ];
      }

      // Matrix: employee.id -> product.id -> { noa, nominal, gram }
      const matrix = {};
      employeeList.forEach((emp) => {
        matrix[emp.id] = {};
        masterProducts.forEach((p) => {
          matrix[emp.id][p.id] = { noa: 0, nominal: 0, gram: 0 };
        });
      });

      let grandNoa = 0;
      let grandNominal = 0;
      let grandGram = 0;

      const grandProductStats = {};
      masterProducts.forEach((p) => {
        grandProductStats[p.id] = { noa: 0, nominal: 0, gram: 0 };
      });

      filteredTxs.forEach((tx) => {
        const prodName = (tx.products?.name || "").toUpperCase();
        const matchProd = masterProducts.find(
          (p) => p.id === Number(tx.product_id) || p.code.toUpperCase() === prodName
        );
        const pid = matchProd ? matchProd.id : 1;

        // Target employee row
        let targetEmp = employeeList.find((e) => e.dbIds.includes(tx.user_id));
        if (!targetEmp) {
          const empName = `PEGAWAI (${tx.user_id ? tx.user_id.slice(0, 6) : "UNKNOWN"})`;
          targetEmp = { id: tx.user_id || "unknown", dbIds: [tx.user_id], nama: empName };
          employeeList.push(targetEmp);
          matrix[targetEmp.id] = {};
          masterProducts.forEach((p) => {
            matrix[targetEmp.id][p.id] = { noa: 0, nominal: 0, gram: 0 };
          });
        }

        const noa = Number(tx.noa) || 0;
        const nominal = Number(tx.nominal) || 0;
        const gram = Number(tx.gram) || 0;

        if (matrix[targetEmp.id] && matrix[targetEmp.id][pid]) {
          matrix[targetEmp.id][pid].noa += noa;
          matrix[targetEmp.id][pid].nominal += nominal;
          matrix[targetEmp.id][pid].gram += gram;
        }

        if (grandProductStats[pid]) {
          grandProductStats[pid].noa += noa;
          grandProductStats[pid].nominal += nominal;
          grandProductStats[pid].gram += gram;
        }

        grandNoa += noa;
        grandNominal += nominal;
        grandGram += gram;
      });

      const tableRows = employeeList.map((emp) => {
        const pStats = matrix[emp.id] || {};
        return {
          nama: emp.nama,
          rbNoa: pStats[1]?.noa ? pStats[1].noa : "-",
          rbNom: pStats[1]?.nominal ? Number(pStats[1].nominal).toLocaleString("id-ID") : "-",
          maxiNoa: pStats[2]?.noa ? pStats[2].noa : "-",
          maxiNom: pStats[2]?.nominal ? Number(pStats[2].nominal).toLocaleString("id-ID") : "-",
          abatanaNoa: pStats[3]?.noa ? pStats[3].noa : "-",
          abatanaNom: pStats[3]?.nominal ? Number(pStats[3].nominal).toLocaleString("id-ID") : "-",
          emasNoa: pStats[4]?.noa ? pStats[4].noa : "-",
          emasGram: pStats[4]?.gram ? Number(pStats[4].gram).toFixed(2).replace(".", ",") : "-",
          hajiNoa: pStats[5]?.noa ? pStats[5].noa : "-",
          hajiNom: pStats[5]?.nominal ? Number(pStats[5].nominal).toLocaleString("id-ID") : "-",
          pembiayaanNoa: pStats[6]?.noa ? pStats[6].noa : "-",
          pembiayaanNom: pStats[6]?.nominal ? Number(pStats[6].nominal).toLocaleString("id-ID") : "-",
          cilemNoa: pStats[7]?.noa ? pStats[7].noa : "-",
          cilemGram: pStats[7]?.gram ? Number(pStats[7].gram).toFixed(2).replace(".", ",") : "-"
        };
      });

      setDataPegawai(tableRows);

      setTotalRow({
        nama: "TOTAL",
        rbNoa: grandProductStats[1].noa || "-",
        rbNom: grandProductStats[1].nominal ? Number(grandProductStats[1].nominal).toLocaleString("id-ID") : "-",
        maxiNoa: grandProductStats[2].noa || "-",
        maxiNom: grandProductStats[2].nominal ? Number(grandProductStats[2].nominal).toLocaleString("id-ID") : "-",
        abatanaNoa: grandProductStats[3].noa || "-",
        abatanaNom: grandProductStats[3].nominal ? Number(grandProductStats[3].nominal).toLocaleString("id-ID") : "-",
        emasNoa: grandProductStats[4].noa || "-",
        emasGram: grandProductStats[4].gram ? Number(grandProductStats[4].gram).toFixed(2).replace(".", ",") : "-",
        hajiNoa: grandProductStats[5].noa || "-",
        hajiNom: grandProductStats[5].nominal ? Number(grandProductStats[5].nominal).toLocaleString("id-ID") : "-",
        pembiayaanNoa: grandProductStats[6].noa || "-",
        pembiayaanNom: grandProductStats[6].nominal ? Number(grandProductStats[6].nominal).toLocaleString("id-ID") : "-",
        cilemNoa: grandProductStats[7].noa || "-",
        cilemGram: grandProductStats[7].gram ? Number(grandProductStats[7].gram).toFixed(2).replace(".", ",") : "-"
      });

      setKpi({
        totalPegawai: employeeList.length,
        totalNoa: grandNoa,
        totalNominal: grandNominal,
        totalGram: grandGram
      });
    } catch (err) {
      console.error("Recap query error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchMonthlyRecap();
    } else {
      setDataPegawai([
        { nama: "VANNY", rbNoa: 5, rbNom: "50.000.000", maxiNoa: 3, maxiNom: "20.000.000", abatanaNoa: 2, abatanaNom: "15.000.000", emasNoa: 4, emasGram: "10,00", hajiNoa: 2, hajiNom: "20.000.000", pembiayaanNoa: 3, pembiayaanNom: "30.000.000", cilemNoa: 2, cilemGram: "5,00" },
        { nama: "BETHARI", rbNoa: 3, rbNom: "30.000.000", maxiNoa: 2, maxiNom: "15.000.000", abatanaNoa: 1, abatanaNom: "10.000.000", emasNoa: 3, emasGram: "7,00", hajiNoa: 1, hajiNom: "10.000.000", pembiayaanNoa: 2, pembiayaanNom: "20.000.000", cilemNoa: 1, cilemGram: "2,00" },
        { nama: "ZHARIF", rbNoa: 4, rbNom: "40.000.000", maxiNoa: 3, maxiNom: "25.000.000", abatanaNoa: 2, abatanaNom: "20.000.000", emasNoa: 5, emasGram: "12,00", hajiNoa: 2, hajiNom: "15.000.000", pembiayaanNoa: 4, pembiayaanNom: "40.000.000", cilemNoa: 3, cilemGram: "8,00" }
      ]);
      setTotalRow({
        nama: "TOTAL",
        rbNoa: 12, rbNom: "120.000.000", maxiNoa: 8, maxiNom: "60.000.000", abatanaNoa: 5, abatanaNom: "45.000.000",
        emasNoa: 12, emasGram: "29,00", hajiNoa: 5, hajiNom: "45.000.000", pembiayaanNoa: 9, pembiayaanNom: "90.000.000",
        cilemNoa: 6, cilemGram: "15,00"
      });
      setKpi({
        totalPegawai: 14,
        totalNoa: 185,
        totalNominal: 1248500000,
        totalGram: 236.5
      });
    }
  }, [periode]);

  const handleExportExcel = () => {
    if (!dataPegawai || dataPegawai.length === 0) {
      alert("Tidak ada data rekap untuk di-export.");
      return;
    }

    // Row 1: Main Product Headers
    const headerRow1 = [
      "Nama Referral",
      "RB", "",
      "MAXI", "",
      "ABATANA", "",
      "TAB EMAS", "",
      "TAB HAJI", "",
      "PEMBIAYAAN", "",
      "CILEM", ""
    ];

    // Row 2: Sub Headers
    const headerRow2 = [
      "",
      "NOA", "Nominal",
      "NOA", "Nominal",
      "NOA", "Nominal",
      "NOA", "Gram",
      "NOA", "Nominal",
      "NOA", "Nominal",
      "NOA", "Gram"
    ];

    // Data Rows
    const rows = dataPegawai.map((row) => [
      row.nama || "",
      row.rbNoa || 0, row.rbNom || "0",
      row.maxiNoa || 0, row.maxiNom || "0",
      row.abatanaNoa || 0, row.abatanaNom || "0",
      row.emasNoa || 0, row.emasGram || "0,00",
      row.hajiNoa || 0, row.hajiNom || "0",
      row.pembiayaanNoa || 0, row.pembiayaanNom || "0",
      row.cilemNoa || 0, row.cilemGram || "0,00"
    ]);

    // Total Row
    const totalLine = [
      "TOTAL",
      totalRow.rbNoa || 0, totalRow.rbNom || "0",
      totalRow.maxiNoa || 0, totalRow.maxiNom || "0",
      totalRow.abatanaNoa || 0, totalRow.abatanaNom || "0",
      totalRow.emasNoa || 0, totalRow.emasGram || "0,00",
      totalRow.hajiNoa || 0, totalRow.hajiNom || "0",
      totalRow.pembiayaanNoa || 0, totalRow.pembiayaanNom || "0",
      totalRow.cilemNoa || 0, totalRow.cilemGram || "0,00"
    ];

    const sheetData = [headerRow1, headerRow2, ...rows, totalLine];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Merge product headers
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } },
      { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } },
      { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } },
      { s: { r: 0, c: 7 }, e: { r: 0, c: 8 } },
      { s: { r: 0, c: 9 }, e: { r: 0, c: 10 } },
      { s: { r: 0, c: 11 }, e: { r: 0, c: 12 } },
      { s: { r: 0, c: 13 }, e: { r: 0, c: 14 } }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Bulanan");
    XLSX.writeFile(wb, `Rekap_Bulanan_KC_Pekanbaru_${periode}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!dataPegawai || dataPegawai.length === 0) {
      alert("Tidak ada data rekap untuk di-export.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1100,height=800");
    if (!printWindow) {
      alert("Pop-up diblokir oleh browser. Izinkan pop-up untuk mengunduh PDF.");
      return;
    }

    let rowsHtml = dataPegawai.map((row) => `
      <tr>
        <td style="text-align: left; font-weight: bold;">${row.nama || ''}</td>
        <td>${row.rbNoa || 0}</td><td style="text-align: right;">${row.rbNom || '0'}</td>
        <td>${row.maxiNoa || 0}</td><td style="text-align: right;">${row.maxiNom || '0'}</td>
        <td>${row.abatanaNoa || 0}</td><td style="text-align: right;">${row.abatanaNom || '0'}</td>
        <td>${row.emasNoa || 0}</td><td style="text-align: right;">${row.emasGram || '0,00'}</td>
        <td>${row.hajiNoa || 0}</td><td style="text-align: right;">${row.hajiNom || '0'}</td>
        <td>${row.pembiayaanNoa || 0}</td><td style="text-align: right;">${row.pembiayaanNom || '0'}</td>
        <td>${row.cilemNoa || 0}</td><td style="text-align: right;">${row.cilemGram || '0,00'}</td>
      </tr>
    `).join("");

    const totalHtml = `
      <tr style="background-color: #f1f5f9; font-weight: bold;">
        <td style="text-align: left;">TOTAL</td>
        <td>${totalRow.rbNoa || 0}</td><td style="text-align: right;">${totalRow.rbNom || '0'}</td>
        <td>${totalRow.maxiNoa || 0}</td><td style="text-align: right;">${totalRow.maxiNom || '0'}</td>
        <td>${totalRow.abatanaNoa || 0}</td><td style="text-align: right;">${totalRow.abatanaNom || '0'}</td>
        <td>${totalRow.emasNoa || 0}</td><td style="text-align: right;">${totalRow.emasGram || '0,00'}</td>
        <td>${totalRow.hajiNoa || 0}</td><td style="text-align: right;">${totalRow.hajiNom || '0'}</td>
        <td>${totalRow.pembiayaanNoa || 0}</td><td style="text-align: right;">${totalRow.pembiayaanNom || '0'}</td>
        <td>${totalRow.cilemNoa || 0}</td><td style="text-align: right;">${totalRow.cilemGram || '0,00'}</td>
      </tr>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rekap_Bulanan_KC_Pekanbaru_${periode}.pdf</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #1e293b; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #00a0a0; padding-bottom: 10px; }
          .header h1 { font-size: 16px; margin: 0; color: #00a0a0; text-transform: uppercase; }
          .header p { font-size: 11px; margin: 4px 0 0 0; color: #64748b; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; }
          th { background-color: #00a0a0; color: white; font-weight: bold; text-transform: uppercase; font-size: 9px; }
          .sub-th { background-color: #e6f5f5; color: #008888; font-weight: bold; }
          .footer-note { margin-top: 20px; font-size: 9px; color: #94a3b8; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN REKAP MONITORING PROGRAM BULANAN</h1>
          <p>KANTOR CABANG: KC PEKANBARU SUDIRMAN 1 | PERIODE: ${periode}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th rowspan="2" style="text-align: left;">NAMA REFERRAL</th>
              <th colspan="2">RB</th>
              <th colspan="2">MAXI</th>
              <th colspan="2">ABATANA</th>
              <th colspan="2">TAB EMAS</th>
              <th colspan="2">TAB HAJI</th>
              <th colspan="2">PEMBIAYAAN</th>
              <th colspan="2">CILEM</th>
            </tr>
            <tr class="sub-th">
              <th>NOA</th><th>NOMINAL</th>
              <th>NOA</th><th>NOMINAL</th>
              <th>NOA</th><th>NOMINAL</th>
              <th>NOA</th><th>GRAM</th>
              <th>NOA</th><th>NOMINAL</th>
              <th>NOA</th><th>NOMINAL</th>
              <th>NOA</th><th>GRAM</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            ${totalHtml}
          </tbody>
        </table>
        <div class="footer-note">Dicetak otomatis dari Dashboard Monitoring BSI - ${new Date().toLocaleDateString('id-ID')}</div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
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
                onChange={(e) => setPeriode(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg text-sm px-3 py-2 font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#009688]"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL PEGAWAI AKTIF */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[#e6f5f5] flex items-center justify-center text-[#00a0a0] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL PEGAWAI AKTIF
            </div>
            <div className="text-2xl font-extrabold text-slate-800">{kpi.totalPegawai}</div>
            <div className="text-xs font-semibold text-[#00a0a0]">Pegawai</div>
          </div>
        </div>

        {/* Card 2: TOTAL NOA */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#f0b43c] bg-amber-50 flex items-center justify-center text-[#f0b43c] shrink-0 font-bold text-xs">
            NOA
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL NOA
            </div>
            <div className="text-2xl font-extrabold text-slate-800">{kpi.totalNoa}</div>
            <div className="text-xs font-semibold text-slate-500">NOA</div>
          </div>
        </div>

        {/* Card 3: TOTAL NOMINAL */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-[#e6f5f5] flex items-center justify-center text-[#00a0a0] shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL NOMINAL
            </div>
            <div className="text-xl font-extrabold text-slate-800">
              Rp {Number(kpi.totalNominal).toLocaleString("id-ID")}
            </div>
            <div className="text-xs font-semibold text-[#00a0a0]">Nominal</div>
          </div>
        </div>

        {/* Card 4: TOTAL GRAM */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL GRAM
            </div>
            <div className="text-2xl font-extrabold text-slate-800">
              {Number(kpi.totalGram).toFixed(2).replace(".", ",")}
            </div>
            <div className="text-xs font-semibold text-amber-600">Gram</div>
          </div>
        </div>
      </div>

      {/* Main Data Section: REKAP PER PEGAWAI */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative">
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

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              {/* Row 1 Header */}
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4 text-left border-r border-slate-200 min-w-[140px]">
                  Nama Referral
                </th>
                <th colSpan="2" className="py-2 px-2 border-r border-slate-200">RB</th>
                <th colSpan="2" className="py-2 px-2 border-r border-slate-200">MAXI</th>
                <th colSpan="2" className="py-2 px-2 border-r border-slate-200">ABATANA</th>
                <th colSpan="2" className="py-2 px-2 border-r border-slate-200">TAB EMAS</th>
                <th colSpan="2" className="py-2 px-2 border-r border-slate-200">TAB HAJI</th>
                <th colSpan="2" className="py-2 px-2 border-r border-slate-200">PEMBIAYAAN</th>
                <th colSpan="2" className="py-2 px-2">CILEM</th>
              </tr>
              {/* Row 2 Sub-Header */}
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="border-r border-slate-200"></th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2 border-r border-slate-200">Nominal</th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2 border-r border-slate-200">Nominal</th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2 border-r border-slate-200">Nominal</th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2 border-r border-slate-200">Gram</th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2 border-r border-slate-200">Nominal</th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2 border-r border-slate-200">Nominal</th>
                <th className="py-2 px-2 border-r border-slate-200">NOA</th>
                <th className="py-2 px-2">Gram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {dataPegawai.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/80 transition-colors font-medium"
                >
                  <td className="py-2.5 px-4 text-left font-bold text-slate-800 border-r border-slate-100">
                    {row.nama}
                  </td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.rbNoa}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.rbNom}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.maxiNoa}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.maxiNom}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.abatanaNoa}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.abatanaNom}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.emasNoa}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.emasGram}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.hajiNoa}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.hajiNom}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.pembiayaanNoa}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.pembiayaanNom}</td>
                  <td className="py-2.5 px-2 border-r border-slate-100">{row.cilemNoa}</td>
                  <td className="py-2.5 px-2">{row.cilemGram}</td>
                </tr>
              ))}

              {/* TOTAL ROW */}
              <tr className="bg-[#e6f5f5] font-extrabold text-[#008888] border-t-2 border-slate-200">
                <td className="py-3 px-4 text-left border-r border-slate-200 font-black">
                  {totalRow.nama}
                </td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.rbNoa}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.rbNom}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.maxiNoa}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.maxiNom}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.abatanaNoa}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.abatanaNom}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.emasNoa}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.emasGram}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.hajiNoa}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.hajiNom}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.pembiayaanNoa}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.pembiayaanNom}</td>
                <td className="py-3 px-2 border-r border-slate-200">{totalRow.cilemNoa}</td>
                <td className="py-3 px-2">{totalRow.cilemGram}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Disclaimer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Data diambil dari transaksi yang telah diinput pada periode 01 September 2026 - 30 September 2026
          </span>
        </div>
      </div>
    </div>
  );
}
