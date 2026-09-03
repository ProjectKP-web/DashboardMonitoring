import React, { createContext, useContext, useState } from "react";

const RoleContext = createContext();

export function RoleProvider({ children }) {
  // Default role can be "pegawai" (Foto 1) or "kabag" (Foto 2)
  const [role, setRole] = useState("pegawai");

  const toggleRole = (newRole) => {
    if (newRole) {
      setRole(newRole);
    } else {
      setRole((prev) => (prev === "pegawai" ? "kabag" : "pegawai"));
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole, toggleRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
