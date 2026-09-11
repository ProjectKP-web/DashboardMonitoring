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

    let timer;

    const performAutoLogout = async () => {
      console.warn("🔒 Auto logout triggered due to inactivity (15 mins idle)");
      await signOut();
      setIdleExpired(true);
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(performAutoLogout, IDLE_TIMEOUT_MS);
    };

    // Events to track user activity
    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart", "wheel"];

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetTimer, { passive: true });
    });

    // Start timer on initial mount/login
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetTimer);
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
        const isKabagRole = rawRole === "kepala_bagian" || rawRole === "kabag" || rawRole === "kepala";
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
    const isKabagRole = rawRole === "kepala_bagian" || rawRole === "kabag" || rawRole === "kepala";
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

  // Register Akun Pegawai Baru
  const signUp = async ({ email, password, full_name, employee_id, nip }) => {
    const nipVal = nip || employee_id;

    if (!isSupabaseConfigured) {
      return loginAsDemo("pegawai", full_name, nipVal);
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            nip: nipVal,
            employee_id: nipVal,
            role: "pegawai",
          },
        },
      });

      if (error) throw error;

      // Direct insert profile into profiles table
      if (data.user) {
        const profileData = {
          id: data.user.id,
          full_name,
          email,
          NIP: nipVal,
          role: "pegawai",
          password: password,
        };

        const { error: profileErr } = await supabase
          .from("profiles")
          .insert([profileData]);

        if (profileErr) {
          console.warn("Retrying profile insert with lowercase nip:", profileErr.message);
          const fallbackProfileData = {
            id: data.user.id,
            full_name,
            email,
            nip: nipVal,
            role: "pegawai",
            password: password,
          };
          await supabase.from("profiles").insert([fallbackProfileData]);
        }
      }

      return data;
    } catch (err) {
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        throw new Error(
          "NETWORK_ERROR: Domain Supabase (VITE_SUPABASE_URL) di file .env tidak ditemukan/valid di internet. Silakan periksa kembali VITE_SUPABASE_URL Anda di Supabase Settings > API."
        );
      }
      throw err;
    }
  };

  // Login (Support Login dengan Email atau NIP)
  const signIn = async ({ identifier, password }) => {
    if (!isSupabaseConfigured) {
      const isKabag = identifier.toLowerCase().includes("kabag") || identifier.toLowerCase().includes("kepala");
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) throw error;

      let userProf = null;
      if (data.user) {
        userProf = await fetchUserProfile(data.user.id, data.user.email);
      }

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

  // Reset / Lupa Kata Sandi
  const resetPassword = async (identifier) => {
    if (!isSupabaseConfigured) {
      return true;
    }

    let targetEmail = identifier.trim();

    try {
      if (!targetEmail.includes("@")) {
        const { data: profileByNip } = await supabase
          .from("profiles")
          .select("email")
          .or(`nip.eq.${targetEmail},employee_id.eq.${targetEmail}`)
          .maybeSingle();

        if (profileByNip?.email) {
          targetEmail = profileByNip.email;
        } else {
          const { data: userByNip } = await supabase
            .from("users")
            .select("email")
            .or(`nip.eq.${targetEmail},employee_id.eq.${targetEmail}`)
            .maybeSingle();

          if (userByNip?.email) {
            targetEmail = userByNip.email;
          }
        }
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(
        targetEmail,
        {
          redirectTo: `${window.location.origin}/login`,
        }
      );

      if (error) throw error;
      return data;
    } catch (err) {
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        throw new Error(
          "NETWORK_ERROR: Domain Supabase (VITE_SUPABASE_URL) di file .env tidak terhubung."
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
        signUp,
        signIn,
        resetPassword,
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
