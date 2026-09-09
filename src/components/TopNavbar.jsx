import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Building2, Bell, User, ChevronDown, LogOut } from "lucide-react";
import { useRole } from "../context/RoleContext";
import { useAuth } from "../context/AuthContext";

export default function TopNavbar({ sidebarOpen, setSidebarOpen, title }) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const { role } = useRole();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error(e);
    }
    navigate("/login");
  };

  const displayName = profile?.full_name || (role === "kabag" ? "Kepala Bagian" : "Pegawai BSI");
  const displayEmployeeId = profile?.employee_id ? ` (${profile.employee_id})` : "";
  const displayRoleLabel = (profile?.role || role) === "kabag" ? "Kepala Bagian" : "Pegawai";

  return (
    <header className="bg-white border-b border-slate-200 h-16 sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Hamburger & Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-hidden cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
          {title || (role === "kabag" ? "Dashboard Monitoring" : "Input Transaksi")}
        </h1>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center space-x-3 sm:space-x-5 text-xs sm:text-sm">
        {/* Branch Indicator */}
        <div className="relative">
          <button
            onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
            className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl cursor-pointer transition-colors text-slate-700 font-medium"
          >
            <Building2 className="w-4 h-4 text-[#00a0a0]" />
            <span className="hidden sm:inline">KC PEKANBARU SUDIRMAN 1</span>
            <span className="sm:hidden">KC PEKANBARU...</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {branchDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 text-xs">
              <div className="px-3 py-1.5 font-bold text-slate-400 uppercase text-[10px]">Cabang Operasional</div>
              <button className="w-full text-left px-3 py-2 text-[#00a0a0] font-bold bg-[#e6f5f5] flex items-center justify-between">
                <span>KC PEKANBARU SUDIRMAN 1</span>
                <span className="w-2 h-2 rounded-full bg-[#00a0a0]"></span>
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        {role === "pegawai" && (
          <button className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer" title="Notifikasi">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#f0b43c] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
              3
            </span>
          </button>
        )}

        {/* User Profile Info */}
        <div className="relative border-l border-slate-200 pl-3">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[#00a0a0]/10 border border-[#00a0a0]/30 text-[#00a0a0] flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="font-bold text-slate-800 text-xs truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {displayRoleLabel}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs space-y-1">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <div className="font-bold text-slate-800">
                  {displayName} {displayEmployeeId}
                </div>
                <div className="text-[11px] text-slate-500">KC PEKANBARU SUDIRMAN 1</div>
                <div className="mt-1">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#e6f5f5] text-[#00a0a0] text-[10px] font-bold">
                    {displayRoleLabel}
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold flex items-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
