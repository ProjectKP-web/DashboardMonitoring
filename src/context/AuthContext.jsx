import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useRole } from "./RoleContext";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { setRole } = useRole();

  // Helper to fetch user profile from profiles or users table
  const fetchUserProfile = async (userId, userEmail = "") => {
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

      if (data) {
        // Normalisasikan bidang nip / employee_id
        const normalizedProfile = {
          ...data,
          nip: data.nip || data.employee_id || "-",
          employee_id: data.employee_id || data.nip || "-",
        };
        setProfile(normalizedProfile);
        if (data.role) {
          setRole(data.role); // Sync role to RoleContext
        }
        return normalizedProfile;
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }

    // Default profile fallback if DB fetch returns empty
    const fallbackProfile = {
      id: userId,
      email: userEmail,
      full_name: userEmail ? userEmail.split("@")[0] : "Pengguna",
      nip: "-",
      employee_id: "-",
      role: "pegawai",
    };
    setProfile(fallbackProfile);
    setRole("pegawai");
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
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id, session.user.email);
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
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email);
      } else {
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
    const demoProf = {
      id: "demo-user-id",
      full_name: name,
      email: `${nip.toLowerCase()}@bankbsi.co.id`,
      nip: nip,
      employee_id: nip,
      role: userRole,
    };
    setUser({ id: "demo-user-id", email: demoProf.email });
    setProfile(demoProf);
    setRole(userRole);
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

      // Direct insert profile into profiles table (or users table)
      if (data.user) {
        const profileData = {
          id: data.user.id,
          full_name,
          email,
          nip: nipVal,
          employee_id: nipVal,
          password: password,
          role: "pegawai",
        };

        try {
          // Try profiles table first
          const { error: profileErr } = await supabase
            .from("profiles")
            .insert([profileData]);

          if (profileErr) {
            // Try users table if profiles table fails
            await supabase.from("users").insert([profileData]);
          }
        } catch (e) {
          console.warn("Autocreate profile table insert skipped:", e);
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

        // Cari berdasarkan nip atau employee_id di tabel profiles
        const { data: profileByNip } = await supabase
          .from("profiles")
          .select("email")
          .or(`nip.eq.${targetEmail},employee_id.eq.${targetEmail}`)
          .maybeSingle();

        if (profileByNip?.email) {
          foundEmail = profileByNip.email;
        } else {
          // Coba di tabel users
          const { data: userByNip } = await supabase
            .from("users")
            .select("email")
            .or(`nip.eq.${targetEmail},employee_id.eq.${targetEmail}`)
            .maybeSingle();

          if (userByNip?.email) {
            foundEmail = userByNip.email;
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
