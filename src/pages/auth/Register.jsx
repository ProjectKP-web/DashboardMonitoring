import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2, AlertCircle, CheckCircle2, Info, ArrowRight } from "lucide-react";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { signUp, loginAsDemo, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !employeeId.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Semua bidang formulir wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Kata Sandi minimal harus 6 karakter.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setIsNetworkError(false);
      setSuccessMsg("");

      await signUp({
        full_name: fullName.trim(),
        employee_id: employeeId.trim(),
        nip: employeeId.trim(),
        email: email.trim(),
        password,
      });

      setSuccessMsg(
        "Pendaftaran akun pegawai berhasil! Silakan masuk dengan NIP/Email dan Kata Sandi Anda."
      );
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Register error:", err);
      if (err.message?.includes("email rate limit exceeded")) {
        setErrorMsg(
          "Batas kuota kirim email Supabase terlampaui (email rate limit exceeded). Silakan nonaktifkan 'Confirm email' di Supabase Dashboard > Authentication > Providers > Email, atau gunakan email lain untuk mendaftar."
        );
      } else if (err.message?.includes("NETWORK_ERROR") || err.message === "Failed to fetch") {
        setIsNetworkError(true);
        setErrorMsg(
          "Domain URL Supabase di file .env tidak ditemukan di internet. Periksa kembali VITE_SUPABASE_URL Anda di Supabase Settings > API."
        );
      } else {
        setErrorMsg(err.message || "Pendaftaran gagal. Silakan periksa kembali data Anda.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    loginAsDemo("pegawai", fullName || "Pegawai BSI", employeeId || "BSI-801");
    navigate("/input-transaksi");
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Daftar Akun Pegawai</h2>
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
            <div className="pt-2 border-t border-rose-200/80">
              <p className="font-semibold mb-1 text-[11px] text-rose-900">
                Ingin langsung mencoba antarmuka dashboard?
              </p>
              <button
                type="button"
                onClick={handleDemoAccess}
                className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
              >
                <span>Masuk Mode Demo Pegawai</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
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
            Nama Lengkap
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Contoh: Vanny Meliyana"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            NIP / Username
          </label>
          <input
            type="text"
            required
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Contoh: BSI-801"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Terdaftar
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@bankbsi.co.id"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00a0a0]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kata Sandi <span className="text-slate-400 font-normal">(Min. 6 karakter)</span>
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
              Mendaftarkan...
            </>
          ) : (
            "Daftar Akun Pegawai"
          )}
        </button>

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
