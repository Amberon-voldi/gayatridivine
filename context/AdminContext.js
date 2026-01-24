"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { account, client, OAuthProvider } from "@/lib/appwrite";

const AdminContext = createContext();

// Fallback admin emails (used if settings fail to load)
export const ADMIN_EMAILS = [
  "admin@gayatridivine.com",
  "ambujpandey742@gmail.com",
  "owner@gayataridivine.com",
];

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allowedEmails, setAllowedEmails] = useState(ADMIN_EMAILS);

  useEffect(() => {
    (async () => {
      const emails = await loadAllowedEmails();
      await checkAdminSession(emails);
    })();
  }, []);

  const loadAllowedEmails = async () => {
    let merged = ADMIN_EMAILS;
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const json = await res.json();
      const fromSettings = json?.settings?.admin?.adminEmails;
      if (Array.isArray(fromSettings) && fromSettings.length > 0) {
        merged = [...new Set([...ADMIN_EMAILS, ...fromSettings])];
      }
    } catch {
      // ignore; keep fallback
    }

    setAllowedEmails(merged);
    return merged;
  };

  const checkAdminSession = async (emails = allowedEmails) => {
    try {
      // Check if user is already logged in (from main auth or admin)
      const session = await account.get();
      if (session && emails.includes(session.email)) {
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
    const emails = await loadAllowedEmails();
    await checkAdminSession(emails);
  };

  const adminLoginWithGoogle = async () => {
    try {
      if (typeof window === 'undefined') return { success: false, error: 'Browser required' };

      // Make sure we have latest allowlist cached (used after redirect)
      await loadAllowedEmails();

      // After OAuth callback, send back to admin.
      sessionStorage.setItem('oauth_redirect', '/admin');

      const origin = window.location.origin;
      const success = `${origin}/auth/callback`;
      const failure = `${origin}/admin/login?error=oauth_failed`;

      account.createOAuth2Token({
        provider: OAuthProvider.Google,
        success,
        failure,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Back-compat (old email/password signature). Now uses Google login.
  const adminLogin = async () => {
    return adminLoginWithGoogle();
  };

  const adminLogout = async () => {
    try {
      await account.deleteSession({ sessionId: 'current' });
      setAdmin(null);

      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('appwrite_session_id');
        } catch {
          // ignore
        }
      }

      // Ensure subsequent calls don't keep sending an old session header
      try {
        client.setSession('');
      } catch {
        // ignore
      }
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
        adminLoginWithGoogle,
        adminLogout,
        refreshAdminStatus,
        ADMIN_EMAILS,
        allowedEmails,
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
