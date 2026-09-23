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
  User,
  Headphones,
  X
} from "lucide-react";
import bsiLogo from "../assets/bsi.png";
import { useRole } from "../context/RoleContext";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { role } = useRole();

  // Pegawai Sidebar Menu
  const pegawaiNavGroups = [
    {
      group: "DASHBOARD",
      items: [
        { label: "Dashboard", path: "/dashboard-saya", icon: LayoutDashboard }
      ]
    },
    {
      group: "PRODUK",
      items: [
        { label: "Input Produk", path: "/input-transaksi", icon: FileEdit },
        { label: "Riwayat Produk", path: "/riwayat-transaksi", icon: History }
      ]
    },
    {  
      group: "LAPORAN",
      items: [
        { label: "Rekap Bulanan", path: "/rekap-bulanan-saya", icon: CalendarCheck }
      ]
    },
    {
      group: "PENGATURAN",
      items: [
        { label: "Profil", path: "/profil-saya", icon: User }
      ]
    }
  ];

  // Kepala Bagian Sidebar Menu
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
      group: "PRODUK",
      items: [
        { label: "Input Produk", path: "/input-transaksi", icon: FileEdit }
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
      group: "PENGATURAN",
      items: [
        { label: "Profil Saya", path: "/profil-saya", icon: User }
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
        className={`fixed lg:sticky top-0 lg:top-16 left-0 bottom-0 lg:bottom-auto z-50 lg:z-20 w-64 min-w-[16rem] max-w-[16rem] h-full lg:h-[calc(100vh-4rem)] shrink-0 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 border-b border-slate-100 px-4 flex items-center justify-between shrink-0">
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

        
      </aside>
    </>
  );
}
