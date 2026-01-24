"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const { checkSession } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // Wait a moment for OAuth session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check session to update auth state
      if (checkSession) {
        await checkSession();
      }
      
      // Get redirect path from sessionStorage
      const redirectPath = typeof window !== 'undefined' 
        ? sessionStorage.getItem('oauth_redirect') || '/'
        : '/';
      
      // Clear the stored redirect
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('oauth_redirect');
      }
      
      // Redirect to the intended page
      router.push(redirectPath);
    };

    handleCallback();
  }, [router, checkSession]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
