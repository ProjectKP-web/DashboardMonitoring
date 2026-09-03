import React from "react";
import { Users, UserCheck, ShieldCheck } from "lucide-react";

export default function Pegawai() {
  const pegawaiList = [
    { nip: "BSI-801", nama: "VANNY", jabatan: "Sales Officer", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" },
    { nip: "BSI-802", nama: "BETHARI", jabatan: "Customer Service", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" },
    { nip: "BSI-803", nama: "ZHARIF", jabatan: "Relationship Manager", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" },
    { nip: "BSI-804", nama: "RIZKY", jabatan: "Sales Officer", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" },
    { nip: "BSI-805", nama: "LILI", jabatan: "Customer Service", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" },
    { nip: "BSI-806", nama: "NISA", jabatan: "Teller", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" },
    { nip: "BSI-807", nama: "ARDI", jabatan: "Sales Officer", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" },
    { nip: "BSI-808", nama: "OKTA", jabatan: "Relationship Manager", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" },
    { nip: "BSI-809", nama: "HENDRA", jabatan: "Account Officer", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" },
    { nip: "BSI-810", nama: "RICO", jabatan: "Sales Officer", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" },
    { nip: "BSI-811", nama: "RIAN", jabatan: "Account Officer", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" },
    { nip: "BSI-812", nama: "SYAIFUL", jabatan: "Customer Service", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" },
    { nip: "BSI-813", nama: "RAHMAD", jabatan: "Sales Officer", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" },
    { nip: "BSI-814", nama: "SUHADI", jabatan: "Relationship Manager", cabang: "KC PEKANBARU SUDIRMAN 1", status: "Aktif" }
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#e6f7f6] text-[#009688] rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Master Data Pegawai Referral</h2>
            <p className="text-xs text-slate-500">Daftar 14 pegawai aktif KC PEKANBARU SUDIRMAN 1</p>
          </div>
        </div>
        <div className="text-xs font-bold bg-[#e6f7f6] text-[#009688] px-3 py-1.5 rounded-lg">
          Total: 14 Pegawai
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">NIP</th>
                <th className="py-3 px-4">Nama Referral</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Kantor Cabang</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {pegawaiList.map((p) => (
                <tr key={p.nip} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500 font-mono">{p.nip}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{p.nama}</td>
                  <td className="py-3 px-4">{p.jabatan}</td>
                  <td className="py-3 px-4 text-slate-600">{p.cabang}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <UserCheck className="w-3 h-3" />
                      <span>{p.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
