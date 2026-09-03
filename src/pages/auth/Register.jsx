import React from "react";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Daftar Akun Baru</h2>
        <p className="text-xs text-slate-500">Dashboard Monitoring BSI</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            placeholder="Masukkan Nama Lengkap"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            NIP / Username
          </label>
          <input
            type="text"
            placeholder="Masukkan NIP"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kata Sandi
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0]"
          />
        </div>

        <Link
          to="/login"
          className="w-full block text-center bg-[#00a0a0] hover:bg-[#008888] text-white py-2.5 rounded-lg text-sm font-bold shadow-xs transition-colors"
        >
          Daftar Akun
        </Link>

        <div className="text-center pt-3 text-xs text-slate-600 border-t border-slate-100">
          Sudah memiliki akun?{" "}
          <Link to="/login" className="text-[#00a0a0] font-bold hover:underline">
            Masuk ke Akun
          </Link>
        </div>
      </form>
    </div>
  );
}
