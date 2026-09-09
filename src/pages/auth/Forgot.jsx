import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function Forgot() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { resetPassword, isConfigured } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg("Silakan masukkan NIP atau Email terdaftar Anda.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      await resetPassword(identifier);

      setSuccessMsg(
        "Instruksi pengatursetingan ulang kata sandi telah dikirim ke email terdaftar Anda."
      );
    } catch (err) {
      console.error("Forgot password error:", err);
      setErrorMsg(
        err.message || "Gagal mengizinkan permintaan reset password. Pastikan NIP/Email terdaftar."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Lupa Kata Sandi</h2>
        <p className="text-xs text-slate-500">
          Masukkan NIP atau Email Anda untuk mengatur ulang kata sandi
        </p>
      </div>

      {!isConfigured && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Petunjuk Supabase (.env)</span>
            Kredensial Supabase belum diisi di file <code className="bg-amber-100 px-1 rounded text-amber-900 font-mono">.env</code>.
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            NIP / Email Terdaftar
          </label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Masukkan NIP atau Email Anda"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center bg-[#00a0a0] hover:bg-[#008888] text-white py-2.5 rounded-lg text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Mengirim...
            </>
          ) : (
            "Kirim Instruksi Reset"
          )}
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
