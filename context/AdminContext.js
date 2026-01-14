"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { account } from "@/lib/appwrite";

const AdminContext = createContext();

// Admin emails - add your admin emails here
export const ADMIN_EMAILS = ["admin@gayataridivine.com","ambujpandey742@gmail.com", "owner@gayataridivine.com"];

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    try {
      // Check if user is already logged in (from main auth or admin)
      const session = await account.get();
      if (session && ADMIN_EMAILS.includes(session.email)) {
        // User is logged in and is an admin - grant access automatically
        setAdmin(session);
      } else {
        setAdmin(null);
      }
    } catch (error) {
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-check session when called (useful after main auth login)
  const refreshAdminStatus = async () => {
    setIsLoading(true);
    await checkAdminSession();
  };

  const adminLogin = async (email, password) => {
    try {
      if (!ADMIN_EMAILS.includes(email)) {
        return { success: false, error: "Unauthorized access" };
      }
      
      // Try to get existing session first
      try {
        const existingSession = await account.get();
        if (existingSession && ADMIN_EMAILS.includes(existingSession.email)) {
          setAdmin(existingSession);
          return { success: true };
        }
        // If logged in with different account, log out first
        if (existingSession) {
          await account.deleteSession("current");
        }
      } catch (e) {
        // No existing session, continue with login
      }
      
      await account.createEmailPasswordSession(email, password);
      const session = await account.get();
      setAdmin(session);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const adminLogout = async () => {
    try {
      await account.deleteSession("current");
      setAdmin(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        isLoading,
        isAdmin: !!admin,
        adminLogin,
        adminLogout,
        refreshAdminStatus,
        ADMIN_EMAILS
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
