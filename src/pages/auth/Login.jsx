import React from "react";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Masuk ke Dashboard</h2>
        <p className="text-xs text-slate-500">Dashboard Monitoring BSI</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            NIP / Username
          </label>
          <input
            type="text"
            placeholder="Masukkan NIP Anda"
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

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center text-slate-600">
            <input type="checkbox" className="mr-1.5 rounded-sm text-[#00a0a0]" />
            Ingat saya
          </label>
          <Link to="/forgot" className="text-[#00a0a0] font-semibold hover:underline">
            Lupa Kata Sandi?
          </Link>
        </div>

        <Link
          to="/input-transaksi"
          className="w-full block text-center bg-[#00a0a0] hover:bg-[#008888] text-white py-2.5 rounded-lg text-sm font-bold shadow-xs transition-colors"
        >
          Masuk Sekarang
        </Link>

        <div className="text-center pt-3 text-xs text-slate-600 border-t border-slate-100">
          Belum memiliki akun?{" "}
          <Link to="/register" className="text-[#00a0a0] font-bold hover:underline">
            Daftar Akun Baru
          </Link>
        </div>
      </form>
    </div>
  );
}
