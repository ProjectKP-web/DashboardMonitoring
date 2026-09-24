import React, { useState, useEffect } from "react";
import { User, Building2, ShieldCheck, Mail, Phone, Save, Loader2, CheckCircle2, KeyRound, Eye, EyeOff } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";

export default function ProfilSaya() {
  const { user, profile } = useAuth();
  const { role } = useRole();

  const [fullName, setFullName] = useState("");
  const [nip, setNip] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (profile || user) {
      const userMeta = user?.user_metadata || {};
      const detectedName = profile?.full_name || profile?.name || userMeta.full_name || (user?.email ? user.email.split("@")[0] : "");
      const detectedNip = profile?.NIP || profile?.nip || profile?.employee_id || userMeta.nip || userMeta.NIP || userMeta.employee_id || "-";
      const detectedEmail = profile?.email || user?.email || "";
      const detectedPhone = profile?.phone || profile?.no_hp || userMeta.phone || "081234567890";

      setFullName(detectedName);
      setNip(detectedNip);
      setEmail(detectedEmail);
      setPhone(detectedPhone);
    }
  }, [profile, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !user?.id) {
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      alert("Konfirmasi kata sandi baru tidak cocok. Silakan periksa kembali.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      alert("Kata sandi baru minimal harus 6 karakter.");
      return;
    }

    setIsSaving(true);
    try {
      const userRole = profile?.role || role || "pegawai";
      const passVal = newPassword && newPassword.trim() ? newPassword.trim() : (profile?.password || "123456");

      // Matches exact Supabase profiles schema: id, full_name, email, NIP, role, password
      const payload = {
        id: user.id,
        full_name: fullName,
        email: email,
        NIP: nip,
        role: userRole,
        password: passVal
      };

      let { error } = await supabase.from("profiles").upsert(payload);

      if (error && error.message?.includes("NIP")) {
        const altPayload = {
          id: user.id,
          full_name: fullName,
          email: email,
          nip: nip,
          role: userRole,
          password: passVal
        };
        const retry = await supabase.from("profiles").upsert(altPayload);
        error = retry.error;
      }

      if (error) {
        console.error("Error saving profile:", error);
        alert(`Gagal menyimpan profil: ${error.message}`);
      } else {
        // Synchronize with Supabase Auth (auth.users)
        const authUpdates = {};
        if (newPassword && newPassword.trim().length >= 6) {
          authUpdates.password = newPassword.trim();
        }
        if (email && email.trim() && email.trim() !== (user?.email || profile?.email)) {
          authUpdates.email = email.trim();
        }

        if (Object.keys(authUpdates).length > 0) {
          try {
            const { error: updateAuthErr } = await supabase.auth.updateUser(authUpdates);
            if (updateAuthErr) {
              console.warn("Supabase Auth update warning:", updateAuthErr.message);
            }
          } catch (authErr) {
            console.warn("Auth update note:", authErr.message);
          }
        }

        setNewPassword("");
        setConfirmPassword("");
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      }
    } catch (err) {
      console.error("Profile save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const initialLetter = fullName ? fullName.charAt(0).toUpperCase() : "P";
  const userRoleDisplay = role === "kabag" || profile?.role === "kepala_bagian" || profile?.role === "kabag"
    ? "Kepala Bagian (Kabag)"
    : "Pegawai";

  return (
    <div className="space-y-6">
      {showSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Profil Anda dan kata sandi berhasil diperbarui!</span>
        </div>
      )}

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
          <div className="w-16 h-16 rounded-full bg-[#00a0a0] text-white flex items-center justify-center font-bold text-2xl shadow-xs">
            {initialLetter}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{fullName || "Pengguna BSI"}</h3>
            <p className="text-xs font-semibold text-[#00a0a0]">{userRoleDisplay} (NIP: {nip})</p>
            <p className="text-xs text-slate-500">KC PEKANBARU SUDIRMAN 1</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-[#00a0a0]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIP Pegawai</label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-[#00a0a0]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Corporate</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#00a0a0]"
              />
            </div>
          </div>

          {/* Section: Ubah Kata Sandi */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex items-center space-x-2 text-slate-800 font-bold">
              <KeyRound className="w-4 h-4 text-[#00a0a0]" />
              <span>Ubah Kata Sandi (Password)</span>
            </div>
            <p className="text-slate-500 text-xs">Isi bidang di bawah ini jika Anda ingin mengganti kata sandi akun Anda.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#00a0a0]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    tabIndex={-1}
                    aria-label={showNewPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#00a0a0]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#00a0a0] hover:bg-[#008888] text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Profil & Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
