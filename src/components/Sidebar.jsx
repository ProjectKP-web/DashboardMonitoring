import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  FileEdit,
  History,
  CalendarCheck,
  Activity,
  FileDown,
  Settings,
  User,
  KeyRound,
  Headphones,
  X
} from "lucide-react";
import bsiLogo from "../assets/bsi.png";
import { useRole } from "../context/RoleContext";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { role } = useRole();

  // Pegawai Sidebar Menu (Foto 1)
  const pegawaiNavGroups = [
    {
      group: "DASHBOARD",
      items: [
        { label: "Dashboard Saya", path: "/dashboard-saya", icon: LayoutDashboard }
      ]
    },
    {
      group: "TRANSAKSI",
      items: [
        { label: "Input Transaksi", path: "/input-transaksi", icon: FileEdit },
        { label: "Riwayat Transaksi", path: "/riwayat-transaksi", icon: History }
      ]
    },
    {
      group: "LAPORAN",
      items: [
        { label: "Rekap Bulanan Saya", path: "/rekap-bulanan-saya", icon: CalendarCheck }
      ]
    },
    {
      group: "PENGATURAN",
      items: [
        { label: "Profil Saya", path: "/profil-saya", icon: User },
        { label: "Ubah Password", path: "/ubah-password", icon: KeyRound }
      ]
    }
  ];

  // Kepala Bagian Sidebar Menu (Foto 2)
  const kabagNavGroups = [
    {
      group: null,
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }
      ]
    },
    {
      group: "DATA MASTER",
      items: [
        { label: "Pegawai (Referral)", path: "/pegawai", icon: Users },
        { label: "Produk", path: "/produk", icon: Package }
      ]
    },
    {
      group: "TRANSAKSI",
      items: [
        { label: "Input Transaksi", path: "/input-transaksi", icon: FileEdit }
      ]
    },
    {
      group: "MONITORING",
      items: [
        { label: "Rekap Bulanan", path: "/rekap-bulanan", icon: CalendarCheck },
        { label: "Monitoring Harian", path: "/monitoring-harian", icon: Activity }
      ]
    },
    {
      group: "LAPORAN",
      items: [
        { label: "Export Laporan", path: "/export-laporan", icon: FileDown },
        { label: "Riwayat Export", path: "/riwayat-export", icon: History }
      ]
    },
    {
      group: "PENGATURAN",
      items: [
        { label: "Pengaturan", path: "/pengaturan", icon: Settings }
      ]
    }
  ];

  const currentNavGroups = role === "kabag" ? kabagNavGroups : pegawaiNavGroups;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="h-20 border-b border-slate-100 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={bsiLogo}
              alt="Bank Syariah Indonesia"
              className="h-10 sm:h-12 w-auto max-w-[200px] object-contain"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 focus:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar">
          {currentNavGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {group.group && (
                <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => {
                      const active =
                        isActive ||
                        (role === "pegawai" && item.path === "/dashboard-saya" && location.pathname === "/") ||
                        (role === "kabag" && item.path === "/dashboard" && location.pathname === "/");

                      return `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? "bg-[#00a0a0] text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`;
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Card Support Banner */}
        <div className="p-3 m-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center space-x-3">
          <div className="p-2.5 bg-slate-200/70 rounded-lg text-slate-700">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Butuh Bantuan?</div>
            <div className="text-[11px] text-slate-500">Hubungi IT Support</div>
          </div>
        </div>
      </aside>
    </>
  );
}
