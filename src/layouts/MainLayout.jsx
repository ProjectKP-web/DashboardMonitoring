import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Get active page title dynamically
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard-saya":
      case "/dashboard":
        return "Dashboard Saya";
      case "/input-transaksi":
        return "Input Transaksi";
      case "/riwayat-transaksi":
        return "Riwayat Transaksi Saya";
      case "/rekap-bulanan-saya":
        return "Rekap Bulanan Saya";
      case "/rekap-bulanan":
        return "Rekap Monitoring Program (Kabag)";
      case "/pegawai":
        return "Master Data Pegawai";
      case "/produk":
        return "Master Data Produk";
      case "/profil-saya":
        return "Profil Saya";
      case "/ubah-password":
        return "Ubah Password";
      default:
        return "Dashboard Monitoring";
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col antialiased text-slate-800">
      {/* Top Navbar */}
      <TopNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        title={getPageTitle()}
      />

      <div className="flex flex-1 relative">
        {/* Modular Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content View */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
