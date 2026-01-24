"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLoginWithGoogle, isAdmin, isLoading, allowedEmails } = useAdmin();
  const { user, isAuthenticated, logout } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      router.push("/admin");
    }
  }, [isAdmin, isLoading, router]);

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    const result = await adminLoginWithGoogle();
    if (!result.success) {
      setError(result.error || "Login failed");
      setLoading(false);
    }
    // Success path redirects away.
  };

  const handleSignOut = async () => {
    setError("");
    setLoading(true);
    try {
      await logout();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="Gayatari Divine Stores" 
              className="h-20 w-20 object-contain mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 mt-2">Gayatari Divine Stores Dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isAuthenticated && !isAdmin ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
                <p className="font-semibold mb-1">Signed in, but not authorized</p>
                <p className="break-all">
                  {user?.email || ""}
                </p>
                <p className="mt-2 text-xs text-yellow-700">
                  Sign out and sign in with an admin Google account.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-3 border border-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                {loading ? "Signing out..." : "Sign out"}
              </button>
              <p className="text-xs text-gray-500">
                Allowed admin emails are configured in Settings.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-gray-700">
                  {loading ? "Signing in..." : "Continue with Google"}
                </span>
              </button>

              {Array.isArray(allowedEmails) && allowedEmails.length > 0 && (
                <p className="text-xs text-gray-500">
                  Access is limited to admin email addresses configured in Settings.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
