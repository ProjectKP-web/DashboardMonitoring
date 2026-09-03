import React from "react";
import { Link } from "react-router-dom";

export default function Forgot() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Lupa Kata Sandi</h2>
        <p className="text-xs text-slate-500">Masukkan NIP Anda untuk mengatur ulang kata sandi</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            NIP / Email Terdaftar
          </label>
          <input
            type="text"
            placeholder="Masukkan NIP atau Email"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0]"
          />
        </div>

        <button
          type="button"
          className="w-full bg-[#00a0a0] hover:bg-[#008888] text-white py-2.5 rounded-lg text-sm font-bold shadow-xs transition-colors cursor-pointer"
        >
          Kirim Insttruksi Reset
        </button>

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-[#00a0a0] font-semibold hover:underline">
            Kembali ke Halaman Login
          </Link>
        </div>
      </form>
    </div>
  );
}
