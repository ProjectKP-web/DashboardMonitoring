import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useRole } from "./RoleContext";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("bsi_demo_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(() => {
    const saved = sessionStorage.getItem("bsi_demo_profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return sessionStorage.getItem("bsi_demo_mode") === "true";
  });
  const [idleExpired, setIdleExpired] = useState(false);
  const { setRole } = useRole();

  // Inactivity / Idle Logout Timer (Default: 15 Menit = 900,000 ms)
  const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

  useEffect(() => {
    // Only run idle timer if user is logged in
    if (!user && !profile && !isDemoMode) return;

    // Initialize last activity timestamp if not set
    if (!localStorage.getItem("bsi_last_activity")) {
      localStorage.setItem("bsi_last_activity", Date.now().toString());
    }

    let isLoggingOut = false;

    const performAutoLogout = async () => {
      if (isLoggingOut) return;
      isLoggingOut = true;
      console.warn("🔒 Auto logout triggered due to inactivity (15 mins idle)");
      await signOut();
      setIdleExpired(true);
    };

    const checkInactivity = () => {
      const lastActivity = parseInt(localStorage.getItem("bsi_last_activity") || "0", 10);
      if (lastActivity > 0 && Date.now() - lastActivity >= IDLE_TIMEOUT_MS) {
        performAutoLogout();
      }
    };

    let lastUpdate = 0;
    const updateActivity = () => {
      const now = Date.now();
      // Throttle localStorage updates to at most once per 2 seconds
      if (now - lastUpdate > 2000) {
        lastUpdate = now;
        localStorage.setItem("bsi_last_activity", now.toString());
      }
    };

    const handleUserActivity = () => {
      const lastActivity = parseInt(localStorage.getItem("bsi_last_activity") || "0", 10);
      if (lastActivity > 0 && Date.now() - lastActivity >= IDLE_TIMEOUT_MS) {
        performAutoLogout();
        return;
      }
      updateActivity();
    };

    // Events to track active user interactions
    const activityEvents = ["click", "keydown", "scroll", "touchstart", "mousemove", "wheel"];

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Check on tab focus and visibility change immediately
    window.addEventListener("focus", checkInactivity);
    document.addEventListener("visibilitychange", checkInactivity);

    // Periodic background check every 5 seconds
    const interval = setInterval(checkInactivity, 5000);

    // Initial check on mount
    checkInactivity();

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkInactivity);
      document.removeEventListener("visibilitychange", checkInactivity);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [user, profile, isDemoMode]);

  // Helper to fetch user profile from profiles or users table
  const fetchUserProfile = async (userId, userEmail = "", userMeta = {}) => {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      // Try 'profiles' table first
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) {
        // Fallback to 'users' table if 'profiles' returned nothing
        const usersRes = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        if (!usersRes.error && usersRes.data) {
          data = usersRes.data;
        }
      }

      const metaNip = userMeta?.nip || userMeta?.NIP || userMeta?.employee_id;
      const metaName = userMeta?.full_name;

      if (data) {
        // Normalisasikan bidang nip / NIP / employee_id & role
        const nipVal = data.NIP || data.nip || data.employee_id || metaNip || "-";
        const rawRole = data.role || userMeta?.role || "pegawai";
        const isKabagRole = rawRole === "kepala_bagian" || rawRole === "kabag" || rawRole === "kepala" || rawRole === "admin" || rawRole === "inputer";
        const normalizedRole = isKabagRole ? "kabag" : rawRole;

        const normalizedProfile = {
          ...data,
          role: normalizedRole,
          nip: nipVal,
          NIP: nipVal,
          employee_id: nipVal,
          full_name: data.full_name || metaName || (userEmail ? userEmail.split("@")[0] : "Pengguna"),
        };
        setProfile(normalizedProfile);
        setRole(normalizedRole); // Sync role to RoleContext
        return normalizedProfile;
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }

    // Default profile fallback if DB fetch returns empty
    const nipVal = userMeta?.nip || userMeta?.NIP || userMeta?.employee_id || "-";
    const rawRole = userMeta?.role || "pegawai";
    const isKabagRole = rawRole === "kepala_bagian" || rawRole === "kabag" || rawRole === "kepala" || rawRole === "admin" || rawRole === "inputer";
    const normalizedRole = isKabagRole ? "kabag" : rawRole;

    const fallbackProfile = {
      id: userId,
      email: userEmail,
      full_name: userMeta?.full_name || (userEmail ? userEmail.split("@")[0] : "Pengguna"),
      nip: nipVal,
      NIP: nipVal,
      employee_id: nipVal,
      role: normalizedRole,
    };
    setProfile(fallbackProfile);
    setRole(normalizedRole);
    return fallbackProfile;
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          setUser(session.user);
          fetchUserProfile(session.user.id, session.user.email, session.user.user_metadata);
        } else if (!isDemoMode) {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else if (!sessionStorage.getItem("bsi_demo_mode")) {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Demo Login Helper
  const loginAsDemo = (userRole = "pegawai", name = "Pegawai BSI", nip = "123456789") => {
    setIsDemoMode(true);
    sessionStorage.setItem("bsi_demo_mode", "true");
    localStorage.setItem("bsi_last_activity", Date.now().toString());
    const demoProf = {
      id: "demo-user-id",
      full_name: name,
      email: `${nip.toLowerCase()}@bankbsi.co.id`,
      nip: nip,
      employee_id: nip,
      role: userRole,
    };
    const demoUser = { id: "demo-user-id", email: demoProf.email };
    setUser(demoUser);
    setProfile(demoProf);
    setRole(userRole);
    sessionStorage.setItem("bsi_demo_user", JSON.stringify(demoUser));
    sessionStorage.setItem("bsi_demo_profile", JSON.stringify(demoProf));
    return demoProf;
  };

  // Login (Support Login dengan Email atau NIP)
  const signIn = async ({ identifier, password }) => {
    if (!isSupabaseConfigured) {
      const isKabag = identifier.toLowerCase().includes("kabag") || identifier.toLowerCase().includes("kepala") || identifier.toLowerCase().includes("admin");
      const role = isKabag ? "kabag" : "pegawai";
      const name = isKabag ? "Kepala Bagian BSI" : "Pegawai BSI";
      const prof = loginAsDemo(role, name, identifier);
      return { user: { id: prof.id, email: prof.email }, profile: prof };
    }

    let targetEmail = identifier.trim();

    try {
      // Jika identifier tidak mengandung '@', diasumsikan sebagai NIP
      if (!targetEmail.includes("@")) {
        let foundEmail = null;

        // 1. Cari di tabel profiles berdasarkan NIP (kapital)
        try {
          const { data: pData } = await supabase
            .from("profiles")
            .select("email")
            .eq("NIP", targetEmail)
            .maybeSingle();
          if (pData?.email) foundEmail = pData.email;
        } catch (e) {
          console.warn("NIP lookup error:", e);
        }

        // 2. Fallback cari berdasarkan nip (kecil)
        if (!foundEmail) {
          try {
            const { data: pDataLower } = await supabase
              .from("profiles")
              .select("email")
              .eq("nip", targetEmail)
              .maybeSingle();
            if (pDataLower?.email) foundEmail = pDataLower.email;
          } catch (e) {
            console.warn("nip lookup error:", e);
          }
        }

        if (foundEmail) {
          targetEmail = foundEmail;
        }
      }

      let { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) {
        // Smart Sync Fallback: Cari di tabel profiles berdasarkan email atau NIP
        let profileRecord = null;
        try {
          const { data: pByEmail } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", targetEmail)
            .maybeSingle();
          profileRecord = pByEmail;
        } catch (e) {}

        if (!profileRecord) {
          try {
            const { data: pByNip } = await supabase
              .from("profiles")
              .select("*")
              .eq("NIP", targetEmail)
              .maybeSingle();
            profileRecord = pByNip;
          } catch (e) {}
        }

        if (profileRecord) {
          const profilePass = profileRecord.password || "";
          if (profilePass && profilePass === password) {
            // Check if profileRecord.email can sign in
            if (profileRecord.email && profileRecord.email !== targetEmail) {
              const altSignIn = await supabase.auth.signInWithPassword({
                email: profileRecord.email,
                password: password,
              });
              if (altSignIn.data?.user) {
                const userProf = await fetchUserProfile(altSignIn.data.user.id, altSignIn.data.user.email);
                localStorage.setItem("bsi_last_activity", Date.now().toString());
                return { user: altSignIn.data.user, profile: userProf };
              }
            }

            // Daftarkan akun secara otomatis ke Supabase Auth jika belum ada
            const { data: autoSignUp, error: autoSignUpErr } = await supabase.auth.signUp({
              email: profileRecord.email || targetEmail,
              password: password,
              options: {
                data: {
                  full_name: profileRecord.full_name || "Admin",
                  nip: profileRecord.NIP || "-",
                  role: profileRecord.role || "kabag",
                },
              },
            });

            if (!autoSignUpErr && autoSignUp?.user) {
              await supabase
                .from("profiles")
                .update({ id: autoSignUp.user.id })
                .eq("email", profileRecord.email || targetEmail);

              const retrySignIn = await supabase.auth.signInWithPassword({
                email: profileRecord.email || targetEmail,
                password: password,
              });

              if (retrySignIn.data?.user) {
                const userProf = await fetchUserProfile(retrySignIn.data.user.id, retrySignIn.data.user.email);
                localStorage.setItem("bsi_last_activity", Date.now().toString());
                return { user: retrySignIn.data.user, profile: userProf };
              }
            }

            // Direct profile auth fallback session if Auth signup exists or is blocked
            const isKabagRole = profileRecord.role === "kabag" || profileRecord.role === "kepala_bagian" || profileRecord.role === "admin";
            const normalizedProf = {
              ...profileRecord,
              role: isKabagRole ? "kabag" : profileRecord.role || "pegawai"
            };
            setProfile(normalizedProf);
            setUser({ id: profileRecord.id, email: profileRecord.email || targetEmail });
            setRole(normalizedProf.role);
            localStorage.setItem("bsi_last_activity", Date.now().toString());
            return { user: { id: profileRecord.id, email: profileRecord.email || targetEmail }, profile: normalizedProf };
          }
        }

        throw error;
      }

      let userProf = null;
      if (data.user) {
        userProf = await fetchUserProfile(data.user.id, data.user.email);
      }

      localStorage.setItem("bsi_last_activity", Date.now().toString());
      return { user: data.user, profile: userProf };
    } catch (err) {
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        throw new Error(
          "NETWORK_ERROR: Domain Supabase (VITE_SUPABASE_URL) di file .env tidak ditemukan/valid di internet. Silakan periksa kembali VITE_SUPABASE_URL Anda di Supabase Settings > API."
        );
      }
      throw err;
    }
  };

  // Sign Out
  const signOut = async () => {
    sessionStorage.removeItem("bsi_demo_mode");
    sessionStorage.removeItem("bsi_demo_user");
    sessionStorage.removeItem("bsi_demo_profile");
    localStorage.removeItem("bsi_last_activity");
    if (isSupabaseConfigured && !isDemoMode) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsDemoMode(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signOut,
        loginAsDemo,
        isDemoMode,
        idleExpired,
        clearIdleNotice: () => setIdleExpired(false),
        isConfigured: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}
