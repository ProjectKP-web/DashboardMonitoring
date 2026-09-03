import React, { useState } from "react";
import { KeyRound, CheckCircle2, Save } from "lucide-react";

export default function UbahPassword() {
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passwordLama || !passwordBaru || passwordBaru !== konfirmasiPassword) return;
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setPasswordLama("");
    setPasswordBaru("");
    setKonfirmasiPassword("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
        <div className="p-3 bg-[#e6f5f5] text-[#00a0a0] rounded-xl">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Ubah Password</h2>
          <p className="text-xs text-slate-500">Perbarui kata sandi akun pegawai Anda demi keamanan</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Password berhasil diperbarui!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Password Lama</label>
          <input
            type="password"
            value={passwordLama}
            onChange={(e) => setPasswordLama(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#00a0a0]"
            required
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Password Baru</label>
          <input
            type="password"
            value={passwordBaru}
            onChange={(e) => setPasswordBaru(e.target.value)}
            placeholder="Minimal 8 karakter"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#00a0a0]"
            required
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Konfirmasi Password Baru</label>
          <input
            type="password"
            value={konfirmasiPassword}
            onChange={(e) => setKonfirmasiPassword(e.target.value)}
            placeholder="Ulangi password baru"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#00a0a0]"
            required
          />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="bg-[#00a0a0] hover:bg-[#008888] text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer">
            <Save className="w-4 h-4" />
            <span>Update Password</span>
          </button>
        </div>
      </form>
    </div>
  );
}
