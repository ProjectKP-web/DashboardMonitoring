import React from "react";
import { User, Building2, ShieldCheck, Mail, Phone, Save } from "lucide-react";

export default function ProfilSaya() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
        <div className="p-3 bg-[#e6f5f5] text-[#00a0a0] rounded-xl">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Profil Saya</h2>
          <p className="text-xs text-slate-500">Informasi akun pegawai terautentikasi sistem BSI</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center space-x-4 border-b border-slate-100 pb-5">
          <div className="w-16 h-16 rounded-full bg-[#00a0a0] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            V
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Vanny</h3>
            <p className="text-xs font-semibold text-[#00a0a0]">Sales Officer (NIP: BSI-801)</p>
            <p className="text-xs text-slate-500">KC PEKANBARU SUDIRMAN 1</p>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
              <input type="text" value="Vanny" readOnly className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800" />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIP Pegawai</label>
              <input type="text" value="BSI-801" readOnly className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800" />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Corporate</label>
              <input type="email" value="vanny@bankbsi.co.id" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#00a0a0]" />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Telepon</label>
              <input type="text" value="081234567890" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#00a0a0]" />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button type="submit" className="bg-[#00a0a0] hover:bg-[#008888] text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer">
              <Save className="w-4 h-4" />
              <span>Simpan Profil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
