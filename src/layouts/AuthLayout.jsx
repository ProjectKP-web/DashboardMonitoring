import React from "react";
import { Outlet } from "react-router-dom";
import bsiLogo from "../assets/bsi.png";
import { ShieldCheck, Building2 } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#003838] via-[#006666] to-[#00a0a0] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {/* Decorative Ambient Glowing Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#f0b43c]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#00a0a0]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Top Subtitle Header */}
      <div className="relative z-10 text-center mb-6 text-white space-y-1">
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-200">
          <Building2 className="w-3.5 h-3.5 text-[#f0b43c]" />
          <span>KC PEKANBARU SUDIRMAN 1</span>
        </div>
      </div>

      {/* Floating Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-7 sm:p-9 space-y-6">
        {/* Logo Header */}
        <div className="flex justify-center border-b border-slate-100 pb-5">
          <img
            src={bsiLogo}
            alt="Bank Syariah Indonesia"
            className="h-14 sm:h-16 w-auto max-w-[260px] object-contain drop-shadow-xs"
          />
        </div>

        {/* Page Content Outlet */}
        <Outlet />
      </div>

      {/* Corporate Footer */}
      <div className="relative z-10 text-center mt-8 text-xs text-white/70 space-y-1 font-medium">
        <p>© 2026 PT Bank Syariah Indonesia Tbk. All rights reserved.</p>
        <p className="text-[11px] text-amber-200/80 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#f0b43c]" />
          <span>Sistem Monitoring Harian Program Pegawai</span>
        </p>
      </div>
    </div>
  );
}
