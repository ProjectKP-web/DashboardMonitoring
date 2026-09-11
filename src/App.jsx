import "./assets/tailwind.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "./components/Loading";
import { RoleProvider } from "./context/RoleContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useRole } from "./context/RoleContext";

// Auth Guard component for protected pages
function ProtectedRoute({ children }) {
  const { user, profile, loading, isDemoMode } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user && !profile && !isDemoMode) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Role Guard for Kabag-only pages
function KabagRoute({ children }) {
  const { profile } = useAuth();
  const { role } = useRole();

  const userRole = profile?.role || role;
  const isKabagUser = userRole === "kabag" || userRole === "kepala_bagian";

  if (!isKabagUser) {
    return <Navigate to="/dashboard-saya" replace />;
  }

  return children;
}

// Role Guard for Pegawai-only pages
function PegawaiRoute({ children }) {
  const { profile } = useAuth();
  const { role } = useRole();

  const userRole = profile?.role || role;
  const isKabagUser = userRole === "kabag" || userRole === "kepala_bagian";

  if (isKabagUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Public Guard component for login/register pages
function PublicRoute({ children }) {
  const { user, profile, loading, isDemoMode } = useAuth();
  const { role } = useRole();

  if (loading) {
    return <Loading />;
  }

  if (user || profile || isDemoMode) {
    const isKabagUser = role === "kabag" || profile?.role === "kepala_bagian" || profile?.role === "kabag";
    return <Navigate to={isKabagUser ? "/dashboard" : "/dashboard-saya"} replace />;
  }

  return children;
}

function App() {
  // Pegawai Portal Pages
  const DashboardSaya = lazy(() => import("./pages/DashboardSaya"));
  const InputTransaksi = lazy(() => import("./pages/InputTransaksi"));
  const RiwayatTransaksi = lazy(() => import("./pages/RiwayatTransaksi"));
  const RekapBulananSaya = lazy(() => import("./pages/RekapBulananSaya"));
  const ProfilSaya = lazy(() => import("./pages/ProfilSaya"));

  // Kabag / Overview Pages
  const Dashboard = lazy(() => import("./pages/Dashboard"));
  const RekapBulanan = lazy(() => import("./pages/RekapBulanan"));
  const MonitoringHarian = lazy(() => import("./pages/MonitoringHarian"));
  const Pegawai = lazy(() => import("./pages/Pegawai"));
  const Produk = lazy(() => import("./pages/Produk"));

  // Error pages
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
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Default root entry route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/guest" element={<Guest />} />
            <Route path="/member" element={<Member />} />

            {/* Protected Main Dashboard Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Pegawai Routes */}
              <Route path="/dashboard-saya" element={<PegawaiRoute><DashboardSaya /></PegawaiRoute>} />
              <Route path="/input-transaksi" element={<PegawaiRoute><InputTransaksi /></PegawaiRoute>} />
              <Route path="/riwayat-transaksi" element={<PegawaiRoute><RiwayatTransaksi /></PegawaiRoute>} />
              <Route path="/rekap-bulanan-saya" element={<PegawaiRoute><RekapBulananSaya /></PegawaiRoute>} />
              <Route path="/profil-saya" element={<ProfilSaya />} />
              <Route path="/ubah-password" element={<Navigate to="/profil-saya" replace />} />

              {/* Kabag Routes */}
              <Route path="/dashboard" element={<KabagRoute><Dashboard /></KabagRoute>} />
              <Route path="/rekap-bulanan" element={<KabagRoute><RekapBulanan /></KabagRoute>} />
              <Route path="/monitoring-harian" element={<KabagRoute><MonitoringHarian /></KabagRoute>} />
              <Route path="/pegawai" element={<KabagRoute><Pegawai /></KabagRoute>} />
              <Route path="/produk" element={<KabagRoute><Produk /></KabagRoute>} />

              {/* Error pages */}
              <Route path="/400" element={<Error400 />} />
              <Route path="/401" element={<Error401 />} />
              <Route path="/403" element={<Error403 />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Public Auth Layout */}
            <Route
              element={
                <PublicRoute>
                  <AuthLayout />
                </PublicRoute>
              }
            >
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot" element={<Forgot />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </RoleProvider>
  );
}

export default App;
