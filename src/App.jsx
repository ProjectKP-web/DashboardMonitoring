import "./assets/tailwind.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "./components/Loading";
import { RoleProvider } from "./context/RoleContext";

function App() {
  // Pegawai Portal Pages
  const DashboardSaya = lazy(() => import("./pages/DashboardSaya"));
  const InputTransaksi = lazy(() => import("./pages/InputTransaksi"));
  const RiwayatTransaksi = lazy(() => import("./pages/RiwayatTransaksi"));
  const RekapBulananSaya = lazy(() => import("./pages/RekapBulananSaya"));
  const ProfilSaya = lazy(() => import("./pages/ProfilSaya"));
  const UbahPassword = lazy(() => import("./pages/UbahPassword"));

  // Kabag / Overview Pages
  const Dashboard = lazy(() => import("./pages/Dashboard"));
  const RekapBulanan = lazy(() => import("./pages/RekapBulanan"));
  const MonitoringHarian = lazy(() => import("./pages/MonitoringHarian"));
  const Pegawai = lazy(() => import("./pages/Pegawai"));
  const Produk = lazy(() => import("./pages/Produk"));
  const ExportLaporan = lazy(() => import("./pages/ExportLaporan"));
  const RiwayatExport = lazy(() => import("./pages/RiwayatExport"));
  const Pengaturan = lazy(() => import("./pages/Pengaturan"));

  // Portal & Error pages
  const Guest = lazy(() => import("./pages/Guest"));
  const Member = lazy(() => import("./pages/Member"));
  const NotFound = lazy(() => import("./pages/NotFound"));
  const Error400 = lazy(() => import("./pages/Error400"));
  const Error401 = lazy(() => import("./pages/Error401"));
  const Error403 = lazy(() => import("./pages/Error403"));

  // Layouts
  const MainLayout = lazy(() => import("./layouts/MainLayout"));
  const AuthLayout = lazy(() => import("./layouts/AuthLayout"));

  // Auth pages
  const Login = lazy(() => import("./pages/auth/Login"));
  const Register = lazy(() => import("./pages/auth/Register"));
  const Forgot = lazy(() => import("./pages/auth/Forgot"));

  return (
    <RoleProvider>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Entry routes */}
          <Route path="/" element={<Navigate to="/input-transaksi" replace />} />
          <Route path="/guest" element={<Guest />} />
          <Route path="/member" element={<Member />} />

          {/* Main Dashboard Layout */}
          <Route element={<MainLayout />}>
            {/* Pegawai Portal Routes */}
            <Route path="/dashboard-saya" element={<DashboardSaya />} />
            <Route path="/input-transaksi" element={<InputTransaksi />} />
            <Route path="/riwayat-transaksi" element={<RiwayatTransaksi />} />
            <Route path="/rekap-bulanan-saya" element={<RekapBulananSaya />} />
            <Route path="/profil-saya" element={<ProfilSaya />} />
            <Route path="/ubah-password" element={<UbahPassword />} />

            {/* Monitoring Kabag Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rekap-bulanan" element={<RekapBulanan />} />
            <Route path="/monitoring-harian" element={<MonitoringHarian />} />
            <Route path="/pegawai" element={<Pegawai />} />
            <Route path="/produk" element={<Produk />} />
            <Route path="/export-laporan" element={<ExportLaporan />} />
            <Route path="/riwayat-export" element={<RiwayatExport />} />
            <Route path="/pengaturan" element={<Pengaturan />} />

            {/* Error pages */}
            <Route path="/400" element={<Error400 />} />
            <Route path="/401" element={<Error401 />} />
            <Route path="/403" element={<Error403 />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Auth Layout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<Forgot />} />
          </Route>
        </Routes>
      </Suspense>
    </RoleProvider>
  );
}

export default App;
