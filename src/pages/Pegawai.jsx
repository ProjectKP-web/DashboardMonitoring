import React, { useState, useEffect } from "react";
import { Users, UserCheck, ShieldCheck, Search, Loader2, RefreshCw } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export default function Pegawai() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pegawaiList, setPegawaiList] = useState([]);

  const fetchPegawaiProfiles = async () => {
    if (!isSupabaseConfigured) {
      setPegawaiList([]);
      return;
    }

    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching profiles:", error);
        setPegawaiList([]);
      } else if (profiles) {
        const formatted = profiles.map((p) => {
          const nipVal = p.NIP || p.nip || p.employee_id || "-";
          const nameVal = (p.full_name || p.email?.split("@")[0] || "Pegawai").toUpperCase();
          const roleVal = p.role === "kabag" || p.role === "kepala_bagian" ? "Kepala Bagian" : "Pegawai";
          const emailVal = p.email || "-";

          return {
            id: p.id,
            nip: nipVal,
            nama: nameVal,
            email: emailVal,
            jabatan: roleVal,
            cabang: "KC PEKANBARU SUDIRMAN 1",
            status: "Aktif"
          };
        });

        setPegawaiList(formatted);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setPegawaiList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPegawaiProfiles();
  }, []);

  const filteredPegawai = pegawaiList.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.nama || "").toLowerCase().includes(term) ||
      (p.nip || "").toLowerCase().includes(term) ||
      (p.email || "").toLowerCase().includes(term) ||
      (p.jabatan || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-5">
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

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={fetchPegawaiProfiles}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#009688]" : ""}`} />
          </button>
          <div className="text-xs font-bold bg-[#e6f7f6] text-[#009688] px-3.5 py-2 rounded-xl border border-[#009688]/20">
            Total: {pegawaiList.length} Pegawai
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Cari pegawai, NIP, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009688] outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="text-slate-500 font-medium">
            Menampilkan: <strong className="text-slate-800">{filteredPegawai.length}</strong> data
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

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">NIP</th>
                <th className="py-3 px-4">Nama Referral</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Jabatan / Role</th>
                <th className="py-3 px-4">Kantor Cabang</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPegawai.length > 0 ? (
                filteredPegawai.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-600 font-mono">{p.nip}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.nama}</td>
                    <td className="py-3 px-4 text-slate-500">{p.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          p.jabatan.includes("Kepala")
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-teal-50 text-teal-700 border border-teal-200"
                        }`}
                      >
                        {p.jabatan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.cabang}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <UserCheck className="w-3 h-3" />
                        <span>{p.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                    Belum ada data pegawai terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
