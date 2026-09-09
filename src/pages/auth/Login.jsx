import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2, AlertCircle, Info, ArrowRight } from "lucide-react";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isNetworkError, setIsNetworkError] = useState(false);

  const { signIn, loginAsDemo, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg("Silakan masukkan NIP / Email dan Kata Sandi.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setIsNetworkError(false);

      const { profile } = await signIn({ identifier, password });

      // Check role from profile and redirect automatically to Dashboard
      if (profile?.role === "kabag") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard-saya");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.message?.includes("NETWORK_ERROR") || err.message === "Failed to fetch") {
        setIsNetworkError(true);
        setErrorMsg(
          "Domain URL Supabase di .env tidak terdaftar / tidak valid di internet (ENOTFOUND). Periksa kembali VITE_SUPABASE_URL Anda di Supabase Settings > API."
        );
      } else {
        setErrorMsg(
          err.message || "Gagal masuk. Periksa kembali NIP/Email dan Kata Sandi Anda."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    loginAsDemo(role, role === "kabag" ? "Kepala Bagian BSI" : "Pegawai BSI", identifier || "BSI-801");
    if (role === "kabag") {
      navigate("/dashboard");
    } else {
      navigate("/dashboard-saya");
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Masuk ke Dashboard</h2>
        <p className="text-xs text-slate-500">Dashboard Monitoring BSI</p>
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
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-2">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>

          {isNetworkError && (
            <div className="pt-2 border-t border-rose-200/80 space-y-1.5">
              <p className="font-semibold text-[11px] text-rose-900">
                Uji Coba Tampilan Langsung (Mode Demo):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin("pegawai")}
                  className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <span>Role Pegawai</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin("kabag")}
                  className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <span>Role Kabag</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kata Sandi
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0]"
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center text-slate-600 cursor-pointer">
            <input type="checkbox" className="mr-1.5 rounded-sm text-[#00a0a0]" />
            Ingat saya
          </label>
          <Link to="/forgot" className="text-[#00a0a0] font-semibold hover:underline">
            Lupa Kata Sandi?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center bg-[#00a0a0] hover:bg-[#008888] text-white py-2.5 rounded-lg text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Memproses...
            </>
          ) : (
            "Masuk Sekarang"
          )}
        </button>

        <div className="text-center pt-3 text-xs text-slate-600 border-t border-slate-100">
          Belum memiliki akun?{" "}
          <Link to="/register" className="text-[#00a0a0] font-bold hover:underline">
            Daftar Akun Pegawai
          </Link>
        </div>
      </form>
    </div>
  );
}
