// src/pages/admin-dev-showcase.tsx
import React from "react";
import SecureManagementPortal from "./secure-management-portal";
import { AuthContext } from "@/hooks/use-auth";

// Fake "admin" user to satisfy your portal's auth checks
const fakeAdmin = {
  id: "dev",
  email: "dev@local",
  roles: ["admin"],
  isVerified: true,
};

const fakeAuthValue: any = {
  user: fakeAdmin,
  isLoading: false,
  login: async () => {},
  logout: async () => {},
};

export default function DevAdminShowcase() {
  console.log("🔑 [DevAdminShowcase] mounting REAL SecureManagementPortal");
  return (
    <AuthContext.Provider value={fakeAuthValue}>
      <SecureManagementPortal />
    </AuthContext.Provider>
  );
}